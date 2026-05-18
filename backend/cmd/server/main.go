package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/microservice/backend/config"
	"github.com/microservice/backend/internal/cache"
	"github.com/microservice/backend/internal/handlers"
	"github.com/microservice/backend/internal/middleware"
	"github.com/microservice/backend/internal/repository"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("config:", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Postgres
	db, err := repository.NewDB(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal("db:", err)
	}
	defer db.Close()

	if err := db.Migrate(context.Background()); err != nil {
		log.Fatal("migrate:", err)
	}

	// Redis
	c, err := cache.New(cfg.RedisURL)
	if err != nil {
		log.Fatal("redis:", err)
	}
	defer c.Close()

	// Router
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.Default()

	// CORS — origins from ALLOWED_ORIGINS (comma-separated or "*")
	allowedOrigins := strings.Split(cfg.AllowedOrigins, ",")
	for i, o := range allowedOrigins {
		allowedOrigins[i] = strings.TrimSpace(o)
	}
	allowCredentials := cfg.AllowedOrigins != "*"

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: allowCredentials,
	}))

	h := handlers.New(db, c, cfg.JWTSecret)

	r.GET("/health", h.Health)

	v1 := r.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)

		protected := v1.Group("")
		protected.Use(middleware.Auth(cfg.JWTSecret, c))
		protected.Use(middleware.RateLimit(c, 100))
		{
			protected.GET("/me", h.Me)
			protected.GET("/products", h.ListProducts)
			protected.GET("/products/:id", h.GetProduct)
			protected.POST("/products", h.CreateProduct)
			protected.GET("/orders", h.ListOrders)
			protected.POST("/orders", h.CreateOrder)
		}
	}

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("Server running on :%s (env=%s, origins=%s)\n",
			cfg.Port, cfg.Env, cfg.AllowedOrigins)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server:", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down...")

	shutCtx, shutCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutCancel()
	srv.Shutdown(shutCtx)
}
