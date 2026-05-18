package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/microservice/backend/internal/cache"
	"github.com/microservice/backend/internal/models"
)

const ContextUserKey = "user_id"

type Claims struct {
	UserID string `json:"uid"`
	JTI    string `json:"jti"`
	jwt.RegisteredClaims
}

func GenerateToken(userID, secret string) (string, error) {
	claims := Claims{
		UserID: userID,
		JTI:    uuid.New().String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

func Auth(secret string, c *cache.Cache) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		header := ctx.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, models.Err("missing token"))
			return
		}
		tokenStr := strings.TrimPrefix(header, "Bearer ")

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, models.Err("invalid token"))
			return
		}
		if c.IsTokenBlacklisted(ctx, claims.JTI) {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, models.Err("token revoked"))
			return
		}

		ctx.Set(ContextUserKey, claims.UserID)
		ctx.Next()
	}
}

func RateLimit(c *cache.Cache, max int64) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		key := ctx.ClientIP()
		count, err := c.IncrRateLimit(ctx, key, time.Minute)
		if err != nil || count > max {
			ctx.AbortWithStatusJSON(http.StatusTooManyRequests, models.Err("rate limit exceeded"))
			return
		}
		ctx.Next()
	}
}
