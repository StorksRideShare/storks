package service

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"safety-and-verification/internal/kafka"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type QRService struct {
	dbPool      *pgxpool.Pool
	redisClient *redis.Client
	qrSecret    string
	producer    *kafka.Producer
}

func NewQRService(dbPool *pgxpool.Pool, redisClient *redis.Client, qrSecret string, producer *kafka.Producer) *QRService {
	return &QRService{
		dbPool:      dbPool,
		redisClient: redisClient,
		qrSecret:    qrSecret,
		producer:    producer,
	}
}

type QRPayload struct {
	Type      string `json:"type"`      // morning or afternoon
	RideID    string `json:"ride_id"`
	GroupID   string `json:"group_id"`
	ChildID   string `json:"child_id,omitempty"` // populated for afternoon
	ExpiresAt int64  `json:"expires_at"`         // unix timestamp, 0 for no expiration
	Hash      string `json:"hash"`
}

func (s *QRService) generateHash(data string) string {
	h := hmac.New(sha256.New, []byte(s.qrSecret))
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

func (s *QRService) signPayload(payload *QRPayload) {
	// Temporarily empty hash to generate signature
	payload.Hash = ""
	b, _ := json.Marshal(payload)
	payload.Hash = s.generateHash(string(b))
}

func (s *QRService) verifySignature(payload *QRPayload) bool {
	providedHash := payload.Hash
	payload.Hash = ""
	b, _ := json.Marshal(payload)
	expectedHash := s.generateHash(string(b))
	payload.Hash = providedHash
	return hmac.Equal([]byte(providedHash), []byte(expectedHash))
}

func (s *QRService) GenerateMorningQR(ctx context.Context, rideID, groupID string) (*QRPayload, error) {
	now := getIST()
	limit := time.Date(now.Year(), now.Month(), now.Day(), 7, 30, 0, 0, now.Location())
	if now.After(limit) {
		return nil, fmt.Errorf("morning QRs can only be requested before 7:30 AM")
	}

	payload := &QRPayload{
		Type:      "morning",
		RideID:    rideID,
		GroupID:   groupID,
		ExpiresAt: now.Add(5 * time.Minute).Unix(),
	}
	s.signPayload(payload)

	if s.producer != nil {
		s.producer.PublishJSONEvent(ctx, "morning_qr_generated", map[string]string{
			"ride_id":  rideID,
			"group_id": groupID,
		})
	}

	return payload, nil
}

func (s *QRService) VerifyMorningQR(ctx context.Context, driverID string, payload *QRPayload) error {
	now := getIST()
	limit := time.Date(now.Year(), now.Month(), now.Day(), 7, 30, 0, 0, now.Location())
	if now.After(limit) {
		return fmt.Errorf("morning QRs can only be verified before 7:30 AM")
	}

	if payload.ExpiresAt < now.Unix() {
		return fmt.Errorf("QR code has expired")
	}

	if !s.verifySignature(payload) {
		return fmt.Errorf("invalid QR code signature")
	}

	// Validate driver has ride
	var isValidDriver bool
	err := s.dbPool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM rides WHERE ride_id = $1 AND driver_id = $2)`, payload.RideID, driverID).Scan(&isValidDriver)
	if err != nil || !isValidDriver {
		return fmt.Errorf("unauthorized driver for this ride")
	}

	_, _ = s.dbPool.Exec(ctx, `
		INSERT INTO verification_logs (id, verification_type, ride_id, group_id, status, verified_at)
		VALUES (gen_random_uuid(), 'morning_qr', $1, $2, 'success', $3)
	`, payload.RideID, payload.GroupID, now)

	if s.producer != nil {
		s.producer.PublishJSONEvent(ctx, "morning_qr_verified", map[string]string{
			"ride_id":  payload.RideID,
			"group_id": payload.GroupID,
			"driver_id": driverID,
		})
	}

	return nil
}

// Afternoon QR Logic
func (s *QRService) GenerateAfternoonQR(ctx context.Context, groupID, childID string) (*QRPayload, error) {
	// Afternoon QRs have no expiration but we bind them to the specific child and group
	payload := &QRPayload{
		Type:      "afternoon",
		GroupID:   groupID,
		ChildID:   childID,
		ExpiresAt: 0,
	}
	s.signPayload(payload)

	if s.producer != nil {
		s.producer.PublishJSONEvent(ctx, "afternoon_qr_generated", map[string]string{
			"group_id": groupID,
			"child_id": childID,
		})
	}

	// In the real system, you might save this in the database permanently to track generation
	return payload, nil
}

func (s *QRService) VerifyAfternoonQR(ctx context.Context, driverID string, payload *QRPayload) error {
	now := getIST()
	today := now.Format("2006-01-02")

	if payload.Type != "afternoon" {
		return fmt.Errorf("invalid QR type")
	}

	if !s.verifySignature(payload) {
		return fmt.Errorf("invalid QR code signature")
	}

	// Validate child is on driver's ride for today
	var rideID string
	err := s.dbPool.QueryRow(ctx, `
		SELECT r.ride_id 
		FROM rides r
		JOIN child_groups cg ON cg.ride_id = r.ride_id
		WHERE r.driver_id = $1 AND cg.group_id = $2
	`, driverID, payload.GroupID).Scan(&rideID)
	
	if err != nil {
		return fmt.Errorf("unauthorized driver or ride not found")
	}

	// Make sure child isn't absent
	var isAbsent bool
	absentErr := s.dbPool.QueryRow(ctx, `
		SELECT afternoon_attendance 
		FROM ride_passengers 
		WHERE ride_id = $1 AND child_id = $2 AND date = $3
	`, rideID, payload.ChildID, today).Scan(&isAbsent)
	
	if absentErr == nil && !isAbsent {
		return fmt.Errorf("child is marked absent for the afternoon")
	}

	_, _ = s.dbPool.Exec(ctx, `
		INSERT INTO verification_logs (id, verification_type, ride_id, group_id, child_id, status, verified_at)
		VALUES (gen_random_uuid(), 'afternoon_qr', $1, $2, $3, 'success', $4)
	`, rideID, payload.GroupID, payload.ChildID, now)

	if s.producer != nil {
		s.producer.PublishJSONEvent(ctx, "afternoon_qr_verified", map[string]string{
			"ride_id":  rideID,
			"group_id": payload.GroupID,
			"child_id": payload.ChildID,
			"driver_id": driverID,
		})
	}

	return nil
}
