package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	ProductsTTL = 5 * time.Minute
	UserTTL     = 10 * time.Minute
)

type Cache struct {
	client *redis.Client
}

func New(redisURL string) (*Cache, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("redis.ParseURL: %w", err)
	}
	client := redis.NewClient(opts)
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("redis ping: %w", err)
	}
	return &Cache{client: client}, nil
}

func (c *Cache) Close() error { return c.client.Close() }

func (c *Cache) Set(ctx context.Context, key string, val any, ttl time.Duration) error {
	b, err := json.Marshal(val)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, b, ttl).Err()
}

func (c *Cache) Get(ctx context.Context, key string, dest any) error {
	b, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(b, dest)
}

func (c *Cache) Del(ctx context.Context, keys ...string) error {
	return c.client.Del(ctx, keys...).Err()
}

// Helpers for common cache patterns

func (c *Cache) GetOrSet(ctx context.Context, key string, ttl time.Duration, dest any, fetch func() (any, error)) error {
	err := c.Get(ctx, key, dest)
	if err == nil {
		return nil
	}
	// Cache miss — fetch from source
	val, err := fetch()
	if err != nil {
		return err
	}
	// Marshal fetched value into dest
	b, _ := json.Marshal(val)
	json.Unmarshal(b, dest)
	// Store in cache (best-effort)
	c.Set(ctx, key, val, ttl)
	return nil
}

// Session helpers (JWT blocklist / rate limiting)

func (c *Cache) BlacklistToken(ctx context.Context, jti string, exp time.Duration) error {
	return c.client.Set(ctx, "blacklist:"+jti, "1", exp).Err()
}

func (c *Cache) IsTokenBlacklisted(ctx context.Context, jti string) bool {
	err := c.client.Get(ctx, "blacklist:"+jti).Err()
	return err == nil
}

func (c *Cache) IncrRateLimit(ctx context.Context, key string, window time.Duration) (int64, error) {
	pipe := c.client.Pipeline()
	incr := pipe.Incr(ctx, "rl:"+key)
	pipe.Expire(ctx, "rl:"+key, window)
	_, err := pipe.Exec(ctx)
	if err != nil {
		return 0, err
	}
	return incr.Val(), nil
}
