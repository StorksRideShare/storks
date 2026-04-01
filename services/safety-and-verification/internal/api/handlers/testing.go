package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PostTestMockUser generates a fake user in the DB for testing OTP flows
func PostTestMockUser(dbPool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		type mockReq struct {
			Role     string `json:"role" binding:"required"` // 'parent' or 'driver'
			Provider string `json:"provider"`
		}
		var req mockReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		userID := uuid.New().String()
		providerID := req.Provider
		if providerID == "" {
			providerID = "mock_provider_" + userID[0:8]
		}

		// Insert into users
		_, err := dbPool.Exec(context.Background(), `
			INSERT INTO users (user_id, user_type, provider_type, provider_user_id, role, created_at, is_deleted)
			VALUES ($1, $2, 'mock', $3, $4, $5, false)
		`, userID, req.Role, providerID, req.Role, time.Now())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create mock user", "details": err.Error()})
			return
		}

		// Insert into specific role table
		if req.Role == "driver" {
			_, _ = dbPool.Exec(context.Background(), `
				INSERT INTO drivers (user_id, country_code, number, "primary", is_validated)
				VALUES ($1, '+1', '5550001111', true, true)
			`, userID)
		} else {
			_, _ = dbPool.Exec(context.Background(), `
				INSERT INTO parents (user_id, country_code, number, "primary", is_validated)
				VALUES ($1, '+1', '5550002222', true, true)
			`, userID)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "User created successfully",
			"user_id": userID,
			"token":   providerID, // Use this string as Bearer token
		})
	}
}
