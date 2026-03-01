package main

import (
	"log"
	"net/http"
)

func main() {
	initRedis()

	hub := NewHub()
	go hub.Run()
	go hub.SubscribeToRedis()

	http.HandleFunc("/ws", hub.ServeWs)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	log.Println("Starting WebSocket server on :8089")
	if err := http.ListenAndServe(":8089", nil); err != nil {
		log.Fatal("ListenAndServe error:", err)
	}
}