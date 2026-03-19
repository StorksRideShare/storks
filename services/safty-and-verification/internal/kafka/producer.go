package kafka

import (
	"context"
	"fmt"
	"log"
	"strings"

	kafka "github.com/segmentio/kafka-go"
)

type Producer struct {
	writer *kafka.Writer
}

func NewProducer(brokers string) *Producer {
	if brokers == "" {
		return nil
	}

	brokerList := strings.Split(brokers, ",")
	w := &kafka.Writer{
		Addr:     kafka.TCP(brokerList...),
		Topic:    "verification_events",
		Balancer: &kafka.LeastBytes{},
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

func (p *Producer) Close() error {
	if p == nil || p.writer == nil {
		return nil
	}
	return p.writer.Close()
}
