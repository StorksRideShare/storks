package kafka

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"strings"
	"time"

	kafka "github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/plain"
)

type Consumer struct {
	reader *kafka.Reader
}

func NewConsumer(brokers, user, pass string) *Consumer {
	if brokers == "" {
		return nil
	}

	dialer := &kafka.Dialer{
		Timeout:   10 * time.Second,
		DualStack: true,
	}

	if user != "" && pass != "" {
		dialer.SASLMechanism = plain.Mechanism{
			Username: user,
			Password: pass,
		}
		dialer.TLS = &tls.Config{
			InsecureSkipVerify: false,
		}
	}

	brokerList := strings.Split(brokers, ",")
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   brokerList,
		GroupID:   "safety-and-verification-group",
		Topic:     "storks.safety.verification.requests",
		MinBytes:  10e3, // 10KB
		MaxBytes:  10e6, // 10MB
		Dialer:    dialer,
	})

	return &Consumer{reader: r}
}

// Start listens to the queue and triggers a callback when a JSON event arrives
func (c *Consumer) Start(ctx context.Context, handler func(ctx context.Context, action string, payload map[string]interface{})) {
	if c == nil || c.reader == nil {
		return
	}

	go func() {
		for {
			m, err := c.reader.ReadMessage(ctx)
			if err != nil {
				// Context cancelled or connection closed
				break
			}

			// We expect JSON payloads with at least an "action" field
			var payload map[string]interface{}
			if err := json.Unmarshal(m.Value, &payload); err == nil {
				action, _ := payload["action"].(string)
				if action != "" {
					handler(context.Background(), action, payload)
				}
			}
		}
	}()
}

func (c *Consumer) Close() error {
	if c == nil || c.reader == nil {
		return nil
	}
	return c.reader.Close()
}
