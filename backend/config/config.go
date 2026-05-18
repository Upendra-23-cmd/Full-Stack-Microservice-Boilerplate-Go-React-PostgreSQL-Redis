package config

import (
	"fmt"
	"os"
)

// Config holds all application configuration loaded from environment variables.
// Minimal required env vars: DATABASE_URL, REDIS_URL, JWT_SECRET
type Config struct {
	// Server
	Port string

	// Database (Postgres)
	DatabaseURL string

	// Cache (Redis)
	RedisURL string

	// Auth
	JWTSecret string

	// CORS
	AllowedOrigins string

	// Environment
	Env string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    mustGetEnv("DATABASE_URL"),
		RedisURL:       mustGetEnv("REDIS_URL"),
		JWTSecret:      mustGetEnv("JWT_SECRET"),
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "*"),
		Env:            getEnv("ENV", "development"),
	}
	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustGetEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic(fmt.Sprintf("required environment variable %q is not set", key))
	}
	return v
}
