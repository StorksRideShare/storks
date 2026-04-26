package kafka

import (
	"crypto/tls"
	"time"

	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/plain"
)

// getDialer returns a kafka dialer configured for SASL/PLAIN if credentials are provided
func getDialer(user, pass string) *kafka.Dialer {
	if user == "" || pass == "" {
		return &kafka.Dialer{
			Timeout:   10 * time.Second,
			DualStack: true,
		}
	}

	return &kafka.Dialer{
		Timeout:   10 * time.Second,
		DualStack: true,
		SASLMechanism: plain.Mechanism{
			Username: user,
			Password: pass,
		},
		TLS: &tls.Config{
			InsecureSkipVerify: false,
		},
	}
}
