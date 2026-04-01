package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"safty-and-verification/internal/service"
)

type OTPHandler struct {
	svc *service.VerificationService
}

func NewOTPHandler(svc *service.VerificationService) *OTPHandler {
	return &OTPHandler{svc: svc}
}

func (h *OTPHandler) HandleOTPRequest(c *gin.Context) {
	reqType := c.Query("type")
	userID := c.GetString("userID")

	if reqType == "morning" {
		type MorningReq struct {
			GroupID string `json:"group_id" binding:"required"`
			RideID  string `json:"ride_id" binding:"required"`
		}
		var req MorningReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		pin, err := h.svc.HandleMorningOTPRequest(c.Request.Context(), userID, req.RideID, req.GroupID)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Morning PIN generated", "pin": pin})
		return
	}

	if reqType == "afternoon" {
		type AfternoonReq struct {
			GroupID string `json:"group_id" binding:"required"`
			Reroll  bool   `json:"reroll"`
		}
		var req AfternoonReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		pins, err := h.svc.HandleAfternoonOTPRequest(c.Request.Context(), userID, req.GroupID, req.Reroll)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":  "successfully generated the pins",
			"group_id": req.GroupID,
			"pins":     pins,
		})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type parameter"})
}

func (h *OTPHandler) HandleOTPVerify(c *gin.Context) {
	reqType := c.Query("type")
	userID := c.GetString("userID")

	if reqType == "morning" {
		type MorningVerifyReq struct {
			RideID  string `json:"ride_id" binding:"required"`
			GroupID string `json:"group_id" binding:"required"`
			Pin     string `json:"pin" binding:"required"`
		}
		var req MorningVerifyReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := h.svc.VerifyMorningOTP(c.Request.Context(), userID, req.RideID, req.GroupID, req.Pin)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Morning OTP verified successfully"})
		return
	}

	if reqType == "afternoon" {
		type AfternoonVerifyReq struct {
			RideID  string             `json:"ride_id" binding:"required"`
			GroupID string             `json:"group_id" binding:"required"`
			Pins    []service.ChildPin `json:"pins" binding:"required"`
		}
		var req AfternoonVerifyReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := h.svc.VerifyAfternoonOTP(c.Request.Context(), userID, req.RideID, req.GroupID, req.Pins)
		if err != nil {
			log.Printf("Verification failed: %v", err)
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Afternoon OTPs verified successfully"})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type parameter"})
}
