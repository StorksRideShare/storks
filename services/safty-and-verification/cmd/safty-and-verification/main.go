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
		log.Fatalf("Failed to connect to database: %v\n", err)
	}
	defer dbPool.Close()

	redisClient, err := repository.NewRedisClient(context.Background(), cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to redis: %v\n", err)
	}
	defer redisClient.Close()

	// Initialize Kafka Producer
	kafkaProducer := kafka.NewProducer(cfg.KafkaBrokers)
	defer func() {
		if kafkaProducer != nil {
			_ = kafkaProducer.Close()
		}
	}()

	r := gin.Default()

	r.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Add the testing mechanism directly (Not protected by middleware)
	r.POST("/api/v1/test/mock-user", handlers.PostTestMockUser(dbPool))

	// Public API group using Auth Middleware
	apiGrp := r.Group("/api/v1")
	apiGrp.Use(middleware.AuthMiddleware(dbPool, redisClient, cfg.ClerkSecretKey))
	
	verificationSvc := service.NewVerificationService(dbPool, redisClient, cfg.QRSecret, kafkaProducer)

	// Cron Scheduler (background process)
	sched := service.NewScheduler(verificationSvc)
	sched.Start(context.Background())

	otpHandler := handlers.NewOTPHandler(verificationSvc)

	apiGrp.POST("/otp/request", otpHandler.HandleOTPRequest)
	apiGrp.POST("/otp/verify", otpHandler.HandleOTPVerify)

	qrSvc := service.NewQRService(dbPool, redisClient, cfg.QRSecret, kafkaProducer)
	qrHandler := handlers.NewQRHandler(qrSvc)
	
	apiGrp.POST("/qr/request", qrHandler.HandleQRRequest)
	apiGrp.POST("/qr/verify", qrHandler.HandleQRVerify)
	
	// Initialize Kafka Consumer
	kafkaConsumer := kafka.NewConsumer(cfg.KafkaBrokers)
	if kafkaConsumer != nil {
		kafkaConsumer.Start(context.Background(), func(ctx context.Context, action string, payload map[string]interface{}) {
			// Extremely simple routing for kafka commands
			log.Printf("Kafka Request received: %s", action)
			
			switch action {
			case "generate_morning_otp":
				rID, _ := payload["ride_id"].(string)
				gID, _ := payload["group_id"].(string)
				// We pass a generic system user for kafka-originated cmds 
				_, _ = verificationSvc.HandleMorningOTPRequest(ctx, "kafka_system", rID, gID)
			case "generate_morning_qr":
				rID, _ := payload["ride_id"].(string)
				gID, _ := payload["group_id"].(string)
				_, _ = qrSvc.GenerateMorningQR(ctx, rID, gID)
			case "generate_afternoon_qr":
				cID, _ := payload["child_id"].(string)
				gID, _ := payload["group_id"].(string)
				_, _ = qrSvc.GenerateAfternoonQR(ctx, gID, cID)
			}
		})
		defer kafkaConsumer.Close()
	}

	log.Printf("Starting server on port %s...\n", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}
