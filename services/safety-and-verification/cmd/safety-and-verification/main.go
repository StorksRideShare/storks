package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"

	"safety-and-verification/internal/api/handlers"
	"safety-and-verification/internal/api/middleware"
	"safety-and-verification/internal/config"
	"safety-and-verification/internal/kafka"
	"safety-and-verification/internal/repository"
	"safety-and-verification/internal/service"

	"github.com/gin-contrib/cors"
	ginprometheus "github.com/zsais/go-gin-prometheus"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Cors
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true
		},

		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Origin", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           604800, // 1 week
	}))

	// Prometheus (Protected by Basic Auth)
	metricsUser := os.Getenv("METRICS_USER")
	metricsPass := os.Getenv("METRICS_PASS")
	if metricsUser == "" {
		metricsUser = "grafana"
	}
	if metricsPass == "" {
		metricsPass = "metrics_password"
	}

	p := ginprometheus.NewPrometheus("gin")
	p.SetMetricsPathWithAuth(r, gin.Accounts{metricsUser: metricsPass})

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
	defer func(redisClient *redis.Client) {
		err := redisClient.Close()
		if err != nil {

		}
	}(redisClient)

	// Initialize Kafka Producer
	kafkaProducer := kafka.NewProducer(cfg.KafkaBrokers, cfg.KafkaUser, cfg.KafkaPass)
	defer func() {
		if kafkaProducer != nil {
			_ = kafkaProducer.Close()
		}
	}()

	r.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Add the testing mechanism directly (Not protected by middleware)
	r.POST("/api/v1/test/mock-user", handlers.PostTestMockUser(dbPool))

	// Public API group using Auth Middleware
	apiGrp := r.Group("/api/v1")
	apiGrp.Use(middleware.AuthMiddleware(dbPool, redisClient, cfg.ClerkSecretKey))

	verificationSvc := service.NewVerificationService(dbPool, redisClient, cfg.QRSecret, kafkaProducer, cfg.DemoMode)

	// Cron Scheduler (background process)
	sched := service.NewScheduler(verificationSvc)
	sched.Start(context.Background())

	apiGrp.POST("/demo/scheduler/trigger", func(c *gin.Context) {
		sched.RunBatchGeneration(c.Request.Context())
		c.JSON(http.StatusOK, gin.H{"message": "Scheduler triggered"})
	})

	otpHandler := handlers.NewOTPHandler(verificationSvc)

	apiGrp.POST("/otp/request", otpHandler.HandleOTPRequest)
	apiGrp.POST("/otp/verify", otpHandler.HandleOTPVerify)

	qrSvc := service.NewQRService(dbPool, redisClient, cfg.QRSecret, kafkaProducer, cfg.DemoMode)
	qrHandler := handlers.NewQRHandler(qrSvc)

	apiGrp.POST("/qr/request", qrHandler.HandleQRRequest)
	apiGrp.POST("/qr/verify", qrHandler.HandleQRVerify)

	emergencySvc := service.NewEmergencyService(dbPool, redisClient, kafkaProducer, true)
	emHandler := handlers.NewEmergencyHandler(emergencySvc)
	apiGrp.POST("/emergency/new", emHandler.HandleEmergency)

	// Initialize Kafka Consumer
	kafkaConsumer := kafka.NewConsumer(cfg.KafkaBrokers, cfg.KafkaUser, cfg.KafkaPass)
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
		defer func(kafkaConsumer *kafka.Consumer) {
			err := kafkaConsumer.Close()
			if err != nil {

			}
		}(kafkaConsumer)
	}

	log.Printf("Starting server on port %s...\n", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}
