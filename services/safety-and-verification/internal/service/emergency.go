package service

import (
	"context"
	"encoding/json"
	"fmt"
	"safety-and-verification/internal/kafka"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type EmergencyService struct {
	dbPool      *pgxpool.Pool
	redisClient *redis.Client
	producer    *kafka.Producer
	demoMode    bool
}

type EventType int

const (
	TypeSOS EventType = iota
	TypeAccident
	TypeOther
	TypeCheckIn
)

var eventName = map[EventType]string{
	TypeSOS:      "SOS",
	TypeAccident: "Accident",
	TypeOther:    "Other",
	TypeCheckIn:  "CheckIn",
}

func (e EventType) String() string {
	return eventName[e]
}

func NewEmergencyService(dbPool *pgxpool.Pool, redisClient *redis.Client, producer *kafka.Producer, demoMode bool) *EmergencyService {
	return &EmergencyService{
		dbPool:      dbPool,
		redisClient: redisClient,
		producer:    producer,
		demoMode:    demoMode,
	}
}

func (s *EmergencyService) HandleEmergencyEvent(ctx context.Context, userID, rideID, groupID string, eventType EventType) (string, error) {
	now := GetIST()

	event := map[string]interface{}{
		"user_id":      userID,
		"ride_id":      rideID,
		"group_id":     groupID,
		"requested_at": now,
		"event_type":   eventType.String(),
	}

	// Save to Redis: emergency:{user_id}:{ride_id}:{group_id} -> 5 min
	eventJSON, _ := json.Marshal(event)
	key := fmt.Sprintf("emergency:%s:%s:%s", userID, rideID, groupID)
	err := s.redisClient.Set(ctx, key, eventJSON, 5*time.Minute).Err()
	if err != nil {
		return "", fmt.Errorf("failed to save event: %v", err)
	}

	if s.producer != nil {
		s.producer.PublishJSONEvent(ctx, "emergency", event)
	}

	return "Event Broadcasted Successfully", nil
}
