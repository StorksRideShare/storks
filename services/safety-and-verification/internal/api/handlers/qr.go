package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"safety-and-verification/internal/service"
)

type QRHandler struct {
	svc *service.QRService
}

func NewQRHandler(svc *service.QRService) *QRHandler {
	return &QRHandler{svc: svc}
}

func (h *QRHandler) HandleQRRequest(c *gin.Context) {
	reqType := c.Query("type")

	if reqType == "morning" {
		type MorningQRReq struct {
			GroupID string `json:"group_id" binding:"required"`
			RideID  string `json:"ride_id" binding:"required"`
		}
		var req MorningQRReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		payload, err := h.svc.GenerateMorningQR(c.Request.Context(), req.RideID, req.GroupID)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Morning QR generated", "qr_payload": payload})
		return
	}

	if reqType == "afternoon" {
		type AfternoonQRReq struct {
			GroupID string `json:"group_id" binding:"required"`
			ChildID string `json:"child_id" binding:"required"`
		}
		var req AfternoonQRReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		payload, err := h.svc.GenerateAfternoonQR(c.Request.Context(), req.GroupID, req.ChildID)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Afternoon QR generated", "qr_payload": payload})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type parameter"})
}

func (h *QRHandler) HandleQRVerify(c *gin.Context) {
	reqType := c.Query("type")
	userID := c.GetString("userID") // driver

	if reqType == "morning" {
		var payload service.QRPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := h.svc.VerifyMorningQR(c.Request.Context(), userID, &payload)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Morning QR verified successfully"})
		return
	}

	if reqType == "afternoon" {
		var payload service.QRPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := h.svc.VerifyAfternoonQR(c.Request.Context(), userID, &payload)
		if err != nil {
			log.Printf("Verification failed: %v", err)
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Afternoon QR verified successfully"})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type parameter"})
}
