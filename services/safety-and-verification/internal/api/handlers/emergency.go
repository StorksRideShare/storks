package handlers

import (
	"net/http"
	"safety-and-verification/internal/service"

	"github.com/gin-gonic/gin"
)

type EmergencyHandler struct {
	svc *service.EmergencyService
}

func NewEmergencyHandler(svc *service.EmergencyService) *EmergencyHandler {
	return &EmergencyHandler{svc: svc}
}

type emergencyRequest struct {
	UserID    string `json:"user_id" binding:"required"`
	RideID    string `json:"ride_id" binding:"required"`
	GroupID   string `json:"group_id" binding:"required"`
	EventType string `json:"event_type" binding:"required"` // "SOS", "Accident", "Other", "CheckIn"
}

func (h *EmergencyHandler) HandleEmergency(c *gin.Context) {
	var req emergencyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert string to EventType
	var eventType service.EventType
	switch req.EventType {
	case "SOS":
		eventType = service.TypeSOS
	case "Accident":
		eventType = service.TypeAccident
	case "Other":
		eventType = service.TypeOther
	case "CheckIn":
		eventType = service.TypeCheckIn
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event_type"})
		return
	}

	msg, err := h.svc.HandleEmergencyEvent(c.Request.Context(), req.UserID, req.RideID, req.GroupID, eventType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": msg, "status": 201})
}
