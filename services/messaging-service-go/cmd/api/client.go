package main

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second
	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second
	// Send pings to peer with this period (must be less than pongWait)
	pingPeriod = (pongWait * 9) / 10
	// Maximum message size allowed from peer
	maxMessageSize = 4096
)

// readPump pumps messages from the WebSocket connection to the hub.
// One goroutine per client runs readPump.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, rawMsg, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err,
				websocket.CloseGoingAway,
				websocket.CloseAbnormalClosure,
			) {
				log.Printf("read error (userID=%s): %v", c.userID, err)
			}
			break
		}

		msg, err := parseMessage(rawMsg)
		if err != nil {
			log.Printf("invalid message from userID=%s: %v", c.userID, err)
			c.sendError("invalid message format")
			continue
		}

		switch msg.Type {
		case MessageTypeJoin:
			// Client is joining a room
			if msg.ConversationID == "" {
				c.sendError("conversation_id required to join")
				continue
			}
			c.roomID = msg.ConversationID
			log.Printf("userID=%s joined room=%s", c.userID, c.roomID)

		case MessageTypeChat:
			// Route chat message through the hub
			if c.roomID == "" {
				c.sendError("join a conversation before sending messages")
				continue
			}
			msg.SenderID = c.userID
			msg.ConversationID = c.roomID
			c.hub.broadcast <- msg

		default:
			c.sendError("unknown message type")
		}
	}
}

// writePump pumps messages from the hub to the WebSocket connection.
// One goroutine per client runs writePump.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Hub closed the channel
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Flush any queued messages in the same write frame
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte("\n"))
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// sendError sends an error message back to the client
func (c *Client) sendError(errMsg string) {
	msg := &Message{
		Type:    MessageTypeError,
		Content: errMsg,
	}
	select {
	case c.send <- msg.toJSON():
	default:
	}
}