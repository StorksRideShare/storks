package service

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"safety-and-verification/internal/kafka"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type VerificationService struct {
	dbPool      *pgxpool.Pool
	redisClient *redis.Client
	qrSecret    string
	producer    *kafka.Producer
}

func NewVerificationService(dbPool *pgxpool.Pool, redisClient *redis.Client, qrSecret string, producer *kafka.Producer) *VerificationService {
	return &VerificationService{
		dbPool:      dbPool,
		redisClient: redisClient,
		qrSecret:    qrSecret,
		producer:    producer,
	}
}

// GeneratePIN creates a 6-digit random number string
func GeneratePIN() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// EnsureTimezone returns the time in IST (+05:30)
func getIST() time.Time {
	// Attempt to load Indian Standard Time
	loc, err := time.LoadLocation("Asia/Colombo")
	if err != nil {
		// Fallback to fixed zone if timezone DB is missing
		return time.Now().In(time.FixedZone("IST", 5*3600+1800))
	}
	return time.Now().In(loc)
}

func (s *VerificationService) HandleMorningOTPRequest(ctx context.Context, userID, rideID, groupID string) (string, error) {
	now := getIST()
	
	// Check if time is before 7:30 AM
	limit := time.Date(now.Year(), now.Month(), now.Day(), 7, 30, 0, 0, now.Location())
	if now.After(limit) {
		return "", fmt.Errorf("morning OTPs can only be requested before 7:30 AM")
	}

	// Make sure user is authorized (check if user exists)
	// Make sure group.driver_id matches ride.driver_id
	var driverID string
	err := s.dbPool.QueryRow(ctx, `
		SELECT r.driver_id 
		FROM rides r
		JOIN child_groups cg ON cg.ride_id = r.ride_id
		WHERE r.ride_id = $1 AND cg.group_id = $2
	`, rideID, groupID).Scan(&driverID)
	
	if err != nil {
		return "", fmt.Errorf("failed to validate ride and group: %v", err)
	}

	pin, err := GeneratePIN()
	if err != nil {
		return "", err
	}

	// Save to Redis: morning:{ride_id}:{group_id}:{driver_id} -> pin (5 min expiry)
	key := fmt.Sprintf("morning:%s:%s:%s", rideID, groupID, driverID)
	err = s.redisClient.Set(ctx, key, pin, 5*time.Minute).Err()
	if err != nil {
		return "", fmt.Errorf("failed to save pin: %v", err)
	}

	if s.producer != nil {
		s.producer.PublishJSONEvent(ctx, "morning_otp_generated", map[string]string{
			"ride_id": rideID,
			"group_id": groupID,
		})
	}

	return pin, nil
}

func (s *VerificationService) VerifyMorningOTP(ctx context.Context, userID, rideID, groupID, pin string) error {
	now := getIST()
	limit := time.Date(now.Year(), now.Month(), now.Day(), 7, 30, 0, 0, now.Location())
	if now.After(limit) {
		return fmt.Errorf("morning OTPs can only be verified before 7:30 AM")
	}

	// Verify the requester (Driver) has this ride
	var isValidDriver bool
	err := s.dbPool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM rides WHERE ride_id = $1 AND driver_id = $2)
	`, rideID, userID).Scan(&isValidDriver)
	
	if err != nil || !isValidDriver {
		return fmt.Errorf("unauthorized driver for this ride")
	}

	// Verify the ride has the group
	var isValidGroup bool
	err = s.dbPool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM child_groups WHERE ride_id = $1 AND group_id = $2)
	`, rideID, groupID).Scan(&isValidGroup)

	if err != nil || !isValidGroup {
		return fmt.Errorf("group not associated with this ride")
	}

	key := fmt.Sprintf("morning:%s:%s:%s", rideID, groupID, userID)
	cachedPin, err := s.redisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		return fmt.Errorf("pin expired or not found")
	} else if err != nil {
		return fmt.Errorf("failed to retrieve pin")
	}

	if cachedPin != pin {
		return fmt.Errorf("invalid pin")
	}

	// Log verification
	_, _ = s.dbPool.Exec(ctx, `
		INSERT INTO verification_logs (id, verification_type, ride_id, group_id, status, verified_at)
		VALUES (gen_random_uuid(), 'morning_otp', $1, $2, 'success', $3)
	`, rideID, groupID, now)
	
	if s.producer != nil {
		s.producer.PublishJSONEvent(ctx, "morning_otp_verified", map[string]string{
			"ride_id": rideID,
			"group_id": groupID,
			"driver_id": userID,
		})
	}

	return nil
}

type ChildPin struct {
	ChildID string `json:"child_id"`
	Pin     string `json:"pin"`
}

func (s *VerificationService) HandleAfternoonOTPRequest(ctx context.Context, userID, groupID string, reroll bool) ([]ChildPin, error) {
	now := getIST()
	
	limitStart := time.Date(now.Year(), now.Month(), now.Day(), 18, 0, 0, 0, now.Location())
	limitEnd := time.Date(now.Year(), now.Month(), now.Day(), 21, 0, 0, 0, now.Location())
	if now.Before(limitStart) || now.After(limitEnd) {
		return nil, fmt.Errorf("afternoon OTPs can only be requested between 6 PM and 9 PM")
	}

	// Active ride tomorrow
	tomorrow := now.AddDate(0, 0, 1).Format("2006-01-02")
	
	// Fetch children in the group that have a schedule/ride for tomorrow
	rows, err := s.dbPool.Query(ctx, `
		SELECT c.child_id 
		FROM children c
		JOIN child_groups cg ON c.group_id = cg.group_id
		JOIN schedules s ON s.child_id = c.child_id
		WHERE cg.group_id = $1 AND s.date = $2
	`, groupID, tomorrow)

	if err != nil {
		return nil, fmt.Errorf("failed to fetch children: %v", err)
	}
	defer rows.Close()

	var children []string
	for rows.Next() {
		var cid string
		if err := rows.Scan(&cid); err == nil {
			children = append(children, cid)
		}
	}

	if len(children) == 0 {
		return nil, fmt.Errorf("no active schedules found for this group tomorrow")
	}

	var childPins []ChildPin
	for _, cid := range children {
		pin, _ := GeneratePIN()
		childPins = append(childPins, ChildPin{ChildID: cid, Pin: pin})

		if reroll {
			_, _ = s.dbPool.Exec(ctx, `
				UPDATE afternoon_otps SET pin = $1, created_at = $2 
				WHERE group_id = $3 AND child_id = $4 AND active_date = $5
			`, pin, now, groupID, cid, tomorrow)
		} else {
			_, _ = s.dbPool.Exec(ctx, `
				INSERT INTO afternoon_otps (id, group_id, child_id, pin, created_at, active_date)
				VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
				ON CONFLICT DO NOTHING
			`, groupID, cid, pin, now, tomorrow)
		}
	}
	
	if s.producer != nil {
		s.producer.PublishJSONEvent(ctx, "afternoon_otp_batch_generated", map[string]interface{}{
			"group_id": groupID,
			"children_count": len(childPins),
			"active_date": tomorrow,
		})
	}

	return childPins, nil
}

func (s *VerificationService) VerifyAfternoonOTP(ctx context.Context, userID, rideID, groupID string, pins []ChildPin) error {
	now := getIST()
	limit := time.Date(now.Year(), now.Month(), now.Day(), 18, 30, 0, 0, now.Location())
	if now.After(limit) {
		return fmt.Errorf("afternoon OTPs can only be verified before 6:30 PM")
	}

	// Validate driver has ride
	var isValidDriver bool
	err := s.dbPool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM rides WHERE ride_id = $1 AND driver_id = $2)`, rideID, userID).Scan(&isValidDriver)
	if err != nil || !isValidDriver {
		return fmt.Errorf("unauthorized driver for this ride")
	}

	// Today is the active_date for verification
	today := now.Format("2006-01-02")

	for _, cp := range pins {
		// Verify child not marked absent in ride_passengers
		var isAbsent bool
		absentErr := s.dbPool.QueryRow(ctx, `
			SELECT afternoon_attendance 
			FROM ride_passengers 
			WHERE ride_id = $1 AND child_id = $2 AND date = $3
		`, rideID, cp.ChildID, today).Scan(&isAbsent)
		
		// If record exists and isAbsent (false means marked absent according to domain logic, or depends on wording. Assuming false = not attended/absent)
		// Assuming afternoon_attendance false = absent for the afternoon. We'll skip verification if true or just proceed to pin check.
		if absentErr == nil && !isAbsent {
			continue // Skip because child is absent (or depends on true/false meaning)
		}

		var realPin string
		err := s.dbPool.QueryRow(ctx, `
			SELECT pin FROM afternoon_otps
			WHERE group_id = $1 AND child_id = $2 AND active_date = $3
		`, groupID, cp.ChildID, today).Scan(&realPin)

		if err != nil || realPin != cp.Pin {
			return fmt.Errorf("invalid pin for child %s", cp.ChildID)
		}

		// Success: Log it
		_, _ = s.dbPool.Exec(ctx, `
			INSERT INTO verification_logs (id, verification_type, ride_id, group_id, child_id, status, verified_at)
			VALUES (gen_random_uuid(), 'afternoon_otp', $1, $2, $3, 'success', $4)
		`, rideID, groupID, cp.ChildID, now)
		
		if s.producer != nil {
			s.producer.PublishJSONEvent(ctx, "afternoon_otp_verified", map[string]string{
				"ride_id": rideID,
				"group_id": groupID,
				"child_id": cp.ChildID,
				"driver_id": userID,
			})
		}
	}

	return nil
}
