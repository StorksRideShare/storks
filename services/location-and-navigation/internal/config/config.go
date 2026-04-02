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
	ClerkSecretKey string
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	cfg := &Config{
		Port:           port,
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		RedisURL:       os.Getenv("REDIS_URL"),
		KafkaBrokers:   os.Getenv("KAFKA_BROKERS"),
		ClerkSecretKey: os.Getenv("CLERK_SECRET_KEY"),
	}

	return cfg, nil
}
