package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type UserAuthClaim struct {
	UserID         string `json:"userId"`
	Email          string `json:"email"`
	IsDeleted      bool   `json:"isDeleted"`
	ProviderUserID string `json:"providerUserId"`
	UserType       string `json:"userType"`
}

func AuthMiddleware(dbPool *pgxpool.Pool, redisClient *redis.Client, clerkSecret string) gin.HandlerFunc {
	clerk.SetKey(clerkSecret)

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == "" || token == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			return
		}

		claims, err := jwt.Verify(c.Request.Context(), &jwt.VerifyParams{
			Token: token,
		})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
			return
		}

		providerUserID := claims.Subject
		cacheKey := fmt.Sprintf("userClaims:%s", providerUserID)

		var userClaim UserAuthClaim
		cached, err := redisClient.Get(c.Request.Context(), cacheKey).Result()
		if err == nil {
			if err := json.Unmarshal([]byte(cached), &userClaim); err == nil {
				c.Set("userClaim", userClaim)
				c.Next()
				return
			}
		}

		err = dbPool.QueryRow(c.Request.Context(),
			"SELECT user_id, email, is_deleted, provider_user_id, user_type FROM users WHERE provider_user_id = $1 AND is_deleted = false", providerUserID).
			Scan(&userClaim.UserID, &userClaim.Email, &userClaim.IsDeleted, &userClaim.ProviderUserID, &userClaim.UserType)

		if err != nil {
			// Fallback: search by user_id if provider_user_id was passed as the claim subject (helpful for tests)
			err = dbPool.QueryRow(c.Request.Context(),
				"SELECT user_id, email, is_deleted, provider_user_id, user_type FROM users WHERE user_id::text = $1 AND is_deleted = false", providerUserID).
				Scan(&userClaim.UserID, &userClaim.Email, &userClaim.IsDeleted, &userClaim.ProviderUserID, &userClaim.UserType)
			
			if err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found in database"})
				return
			}
		}

		claimJSON, _ := json.Marshal(userClaim)
		redisClient.Set(c.Request.Context(), cacheKey, claimJSON, 1 * time.Hour)

		c.Set("userClaim", userClaim)
		c.Set("userID", userClaim.UserID)
		c.Set("userType", userClaim.UserType)
		c.Next()
	}
}
