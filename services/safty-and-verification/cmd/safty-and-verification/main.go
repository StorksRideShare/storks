package main

import (
	"context"
	"log"

	"github.com/gin-gonic/gin"

	"safty-and-verification/internal/api/handlers"
	"safty-and-verification/internal/api/middleware"
	"safty-and-verification/internal/config"
	"safty-and-verification/internal/kafka"
	"safty-and-verification/internal/repository"
	"safty-and-verification/internal/service"
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

	// Test endpoints (no auth required)
	testGrp := r.Group("/api/v1/test")
	testGrp.POST("/mock-user", handlers.PostTestMockUser(dbPool))

	// Public API group using Auth Middleware
	apiGrp := r.Group("/api/v1")
	apiGrp.Use(middleware.AuthMiddleware(dbPool, cfg.ClerkSecretKey))
	
	verificationSvc := service.NewVerificationService(dbPool, redisClient, cfg.QRSecret)

	// Start Scheduler
	scheduler := service.NewScheduler(verificationSvc)
	scheduler.Start(context.Background())

	otpHandler := handlers.NewOTPHandler(verificationSvc)

	apiGrp.POST("/otp/request", otpHandler.HandleOTPRequest)
	apiGrp.POST("/otp/verify", otpHandler.HandleOTPVerify)

	qrSvc := service.NewQRService(dbPool, redisClient, cfg.QRSecret)
	qrHandler := handlers.NewQRHandler(qrSvc)
	
	apiGrp.POST("/qr/request", qrHandler.HandleQRRequest)
	apiGrp.POST("/qr/verify", qrHandler.HandleQRVerify)
	
	_ = apiGrp

	log.Printf("Starting server on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
