package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	RedisURL       string
	KafkaBrokers   string
	KafkaUser      string
	KafkaPass      string
	QRSecret       string
	ClerkSecretKey string
	DemoMode       bool
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	demoMode := false
	if os.Getenv("DEMO_MODE") == "true" {
		demoMode = true
	}

	cfg := &Config{
		Port:           port,
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		RedisURL:       os.Getenv("REDIS_URL"),
		KafkaBrokers:   os.Getenv("KAFKA_BROKERS"),
		KafkaUser:      os.Getenv("KAFKA_USER"),
		KafkaPass:      os.Getenv("KAFKA_PASS"),
		QRSecret:       os.Getenv("QR_SECRET"),
		ClerkSecretKey: os.Getenv("CLERK_SECRET_KEY"),
		DemoMode:       demoMode,
	}

	return cfg, nil
}
