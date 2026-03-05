package main

import (
	"context"
	"log"
	"net/http"

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
	router := gin.Default()
	router.GET("/api/navigation/route", getRoute)
	router.Run(":8080")
}
