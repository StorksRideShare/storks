package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID             string `json:"id"`
	UserType       string `json:"user_type"`
	ProviderUserID string `json:"provider_user_id"`
}

func AuthMiddleware(dbPool *pgxpool.Pool, clerkSecret string) gin.HandlerFunc {
	// Initialize Clerk client instance if doing it globally or configure default
	clerk.SetKey(clerkSecret)

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == "" || token == authHeader { // no Bearer prefix
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			return
		}

		// Use Clerk SDK to verify token
		claims, err := jwt.Verify(c.Request.Context(), &jwt.VerifyParams{
			Token: token,
		})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token or expired session", "details": err.Error()})
			return
		}

		// The subject is the Clerk User ID
		providerUserID := claims.Subject

		var user User
		err = dbPool.QueryRow(context.Background(),
			"SELECT user_id, user_type, provider_user_id FROM users WHERE provider_user_id = $1 AND is_deleted = false", providerUserID).
			Scan(&user.ID, &user.UserType, &user.ProviderUserID)

		if err != nil {
			// Fallback: Check if they are testing directly with the raw user_id instead of clerk id
			err = dbPool.QueryRow(context.Background(),
				"SELECT user_id, user_type, provider_user_id FROM users WHERE user_id = $1 AND is_deleted = false", providerUserID).
				Scan(&user.ID, &user.UserType, &user.ProviderUserID)

			if err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found in local database"})
				return
			}
		}

		c.Set("userID", user.ID)
		c.Set("userType", user.UserType)

		c.Next()
	}
}
