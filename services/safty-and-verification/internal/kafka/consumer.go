package kafka

import (
	"context"
	"encoding/json"
	"strings"

	kafka "github.com/segmentio/kafka-go"
)

type Consumer struct {
	reader *kafka.Reader
}

func NewConsumer(brokers string) *Consumer {
	if brokers == "" {
		return nil
	}

	brokerList := strings.Split(brokers, ",")
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   brokerList,
		Topic:     "verification_requests",
		Partition: 0,
		MinBytes:  10e3, // 10KB
		MaxBytes:  10e6, // 10MB
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
