package main

import (
	"context"
	"log"

	"github.com/gin-gonic/gin"

	"safty-and-verification/internal/config"
	"safty-and-verification/internal/kafka"
	"safty-and-verification/internal/repository"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Init DB
	dbPool, err := repository.NewPostgresPool(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Failed to connect to database: %v", err)
	} else {
		defer dbPool.Close()
		log.Println("Connected to PostgreSQL")
	}

	// Init Redis
	redisClient, err := repository.NewRedisClient(context.Background(), cfg.RedisURL)
	if err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v", err)
	} else {
		defer redisClient.Close()
		log.Println("Connected to Redis")
	}

	// Init Kafka Producer
	kafkaProducer := kafka.NewProducer(cfg.KafkaBrokers)
	if kafkaProducer != nil {
		defer kafkaProducer.Close()
		log.Println("Initialized Kafka Producer")
	} else {
		log.Printf("Warning: Database or Kafka not configured properly")
	}

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	log.Printf("Starting server on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
