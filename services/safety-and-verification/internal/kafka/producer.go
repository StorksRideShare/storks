package kafka

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	kafka "github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/plain"
)

type Producer struct {
	writer *kafka.Writer
}

func NewProducer(brokers, user, pass string) *Producer {
	if brokers == "" {
		return nil
	}

	brokerList := strings.Split(brokers, ",")

	transport := &kafka.Transport{
		TLS: &tls.Config{
			InsecureSkipVerify: false,
		},
	}

	if user != "" && pass != "" {
		transport.SASL = plain.Mechanism{
			Username: user,
			Password: pass,
		}
	}

	w := &kafka.Writer{
		Addr:      kafka.TCP(brokerList...),
		Topic:     "storks.safety.verification.events",
		Balancer:  &kafka.LeastBytes{},
		Transport: transport,
		Async:     false,
	}

	return &Producer{
		writer: w,
	}
}

func (p *Producer) ProduceEvent(ctx context.Context, key string, message []byte) error {
	if p == nil || p.writer == nil {
		log.Println("Kafka producer not initialized, skipping message")
		return nil
	}
	err := p.writer.WriteMessages(ctx,
		kafka.Message{
			Key:   []byte(key),
			Value: message,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to write messages: %w", err)
	}
	return nil
}

func (p *Producer) PublishJSONEvent(ctx context.Context, eventType string, payload interface{}) {
	if p == nil || p.writer == nil {
		log.Println("Kafka producer not initialized, ignoring PublishJSONEvent")
		return
	}
	
	type Event struct {
		EventType string      `json:"event_type"`
		Timestamp string      `json:"timestamp"`
		Data      interface{} `json:"data"`
	}

	evt := Event{
		EventType: eventType,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Data:      payload,
	}
	
	b, err := json.Marshal(evt)
	if err != nil {
		log.Printf("Failed to marshal kafka event: %v", err)
		return
	}
	if err := p.ProduceEvent(ctx, eventType, b); err != nil {
		log.Printf("CRITICAL: Failed to publish Kafka event %s: %v", eventType, err)
	}
}

func (p *Producer) Close() error {
	if p == nil || p.writer == nil {
		return nil
	}
	return p.writer.Close()
}
