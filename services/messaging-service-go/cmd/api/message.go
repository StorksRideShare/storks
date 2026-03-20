package main

import "encoding/json"

// MessageType defines the kind of WebSocket message
type MessageType string

const (
	MessageTypeChat  MessageType = "chat"
	MessageTypeJoin  MessageType = "join"
	MessageTypeLeave MessageType = "leave"
	MessageTypeError MessageType = "error"
)

// Message is the core data structure passed between clients and the hub
type Message struct {
	Type           MessageType `json:"type"`
	ConversationID string      `json:"conversation_id"`
	SenderID       string      `json:"sender_id"`
	Content        string      `json:"content"`
}

func (m *Message) toJSON() []byte {
	b, _ := json.Marshal(m)
	return b
}

func parseMessage(data []byte) (*Message, error) {
	var msg Message
	if err := json.Unmarshal(data, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}