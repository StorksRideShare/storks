package main

import (
	"context"
	"log"

	"github.com/gin-gonic/gin"

	"location-and-navigation/internal/api/middleware"
	"location-and-navigation/internal/config"
	"location-and-navigation/internal/repository"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	ctx := context.Background()

	// Initialize Database
	dbPool, err := repository.NewPostgresPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	// Initialize Redis
	redisClient, err := repository.NewRedisClient(ctx, cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to redis: %v", err)
	}
	defer redisClient.Close()

	r := gin.Default()

	// Health Check
	r.GET("/api/location/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "location-and-navigation"})
	})

	// Protected Routes
	api := r.Group("/api/v1")
	api.Use(middleware.AuthMiddleware(dbPool, redisClient, cfg.ClerkSecretKey))
	{
		api.GET("/ping", func(c *gin.Context) {
			claim, _ := c.Get("userClaim")
			c.JSON(200, gin.H{
				"message": "pong",
				"user":    claim,
			})
		})
	}

	log.Printf("Starting location-and-navigation service on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
