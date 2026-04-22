package main

import (
	"context"
	"log"
	"net/http"

	"location-and-navigation/internal/api/middleware"
	"location-and-navigation/internal/config"
	"location-and-navigation/internal/repository"

	"github.com/gin-gonic/gin"
	"googlemaps.github.io/maps"
)

var mapsClient *maps.Client

func init() {
	var err error
	// Use your Google Maps API Key
	mapsClient, err = maps.NewClient(maps.WithAPIKey("AIzaSyAgnt49hspjGjVFZO6Edc7eOGO0trgrTOI"))
	if err != nil {
		log.Fatalf("fatal error: %s", err)
	}
}

func getRoute(c *gin.Context) {
	origin := c.Query("origin")
	destination := c.Query("destination")

	r := &maps.DirectionsRequest{
		Origin:      origin,
		Destination: destination,
		Mode:        maps.TravelModeDriving,
	}

	routes, _, err := mapsClient.Directions(context.Background(), r)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"polyline": routes[0].OverviewPolyline.Points,
		"duration": routes[0].Legs[0].Duration.String(),
		"distance": routes[0].Legs[0].Distance.HumanReadable,
	})
}

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
	r.GET("/api/v1/location/health", func(c *gin.Context) {
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
	
	r.GET("/api/v1/navigation/route", getRoute)


	log.Printf("Starting location-and-navigation service on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
