package main

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var rdb *redis.Client

func initRedis() {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "localhost:6379"
	}

	rdb = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       0,
		Protocol: 2,
	})

	ctx := context.Background()
	if _, err := rdb.Ping(ctx).Result(); err != nil {
		log.Fatalf("redis connection failed (%s): %v", addr, err)
	}
	log.Printf("Connected to Redis at %s", addr)
}