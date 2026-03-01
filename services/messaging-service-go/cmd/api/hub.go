package main

import (
	"context"
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// Client represents a connected WebSocket client
type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	userID string // from authentication
	roomID string // current conversation
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *Message, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("client registered: userID=%s", client.userID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("client unregistered: userID=%s", client.userID)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			// Publish to Redis so other hub instances (if any) also receive it
			go h.publishToRedis(message)
			// h.deliverToRoom(message)
		}
	}
}

// deliverToRoom sends a message to all clients in the same room.
// Uses a write lock because we may need to remove dead clients.
func (h *Hub) deliverToRoom(message *Message) {
	h.mu.Lock()
	defer h.mu.Unlock()

	for client := range h.clients {
		if client.roomID != message.ConversationID {
			continue
		}
		select {
		case client.send <- message.toJSON():
		default:
			// Client send buffer is full — drop and remove
			close(client.send)
			delete(h.clients, client)
			log.Printf("client removed (buffer full): userID=%s", client.userID)
		}
	}
}

// publishToRedis publishes a message to the Redis channel for the room
func (h *Hub) publishToRedis(message *Message) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Println("redis publish marshal error:", err)
		return
	}
	ctx := context.Background()
	channel := "room:" + message.ConversationID
	if err := rdb.Publish(ctx, channel, data).Err(); err != nil {
		log.Println("redis publish error:", err)
	}
}

// SubscribeToRedis listens for messages published by other hub instances
// and delivers them locally. Essential when running multiple instances.
func (h *Hub) SubscribeToRedis() {
	log.Printf("SubscribeToRedis started")
	ctx := context.Background()
	// Subscribe to all room channels using a pattern
	pubsub := rdb.PSubscribe(ctx, "room:*")
	defer pubsub.Close()

	log.Println("Subscribed to Redis channels: room:*")

	for redisMsg := range pubsub.Channel() {
		var msg Message
		if err := json.Unmarshal([]byte(redisMsg.Payload), &msg); err != nil {
			log.Println("redis message unmarshal error:", err)
			continue
		}
		// Deliver locally without re-publishing to Redis (avoid loop)
		h.deliverToRoom(&msg)
	}
}