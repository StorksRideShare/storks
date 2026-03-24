import { Client, Message } from "@stomp/stompjs";
import "text-encoding"; // Required for STOMP in React Native

/**
 * Polyfill for TextEncoder/TextDecoder if missing in RN environment
 */
if (typeof TextEncoder === "undefined") {
  const enc = require("text-encoding");
  (global as any).TextEncoder = enc.TextEncoder;
  (global as any).TextDecoder = enc.TextDecoder;
}

export type ChatMessage = {
  messageId: string;
  roomId: string;
  senderId: string;
  content: string;
  sentAt?: string;
  type: "CHAT" | "JOIN" | "LEAVE" | "TYPING" | "READ_RECEIPT" | "SYSTEM";
  status?: "sending" | "sent" | "read";
};

export class StompChatClient {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();

  constructor(private wsUrl: string, private getToken: () => Promise<string | null>) {}

  async connect(onConnect: () => void, onError: (err: any) => void) {
    this.client = new Client({
      brokerURL: this.wsUrl,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      reconnectDelay: 5000,
      debug: (str) => {
        if (__DEV__) console.log("STOMP:", str);
      },
      beforeConnect: async () => {
        const token = await this.getToken();
        if (!token) {
          console.error("STOMP: No auth token, aborting connect");
          this.client?.deactivate();
          return;
        }
        console.log("STOMP: Setting connect headers with token (first 10 chars):", token.substring(0, 10));
        if (this.client) {
          this.client.connectHeaders = {
            Authorization: `Bearer ${token}`,
          };
        }
      },
      onConnect: () => {
        console.log("STOMP: Connected successfully");
        onConnect();
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame.body);
        onError(frame.body);
      },
      onWebSocketClose: () => {
        console.log("STOMP Connection closed");
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribeToRoom(roomId: string, onMessage: (msg: ChatMessage) => void) {
    if (!this.client || !this.client.connected) {
      console.warn("STOMP not connected, cannot subscribe");
      return;
    }

    // Unsubscribe from previous if any
    if (this.subscriptions.has(roomId)) {
      this.subscriptions.get(roomId).unsubscribe();
    }

    const sub = this.client.subscribe(`/topic/room/${roomId}`, (message: Message) => {
      try {
        const payload = JSON.parse(message.body);
        onMessage(payload);
      } catch (e) {
        console.error("Failed to parse STOMP message", e);
      }
    });

    this.subscriptions.set(roomId, sub);
  }

  sendMessage(roomId: string, content: string) {
    if (!this.client || !this.client.connected) {
      throw new Error("STOMP client is not connected");
    }
    this.client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify({ roomId, content, type: "CHAT" }),
    });
  }

  sendReadReceipt(roomId: string, messageId: string) {
    if (!this.client || !this.client.connected) return;
    this.client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify({ roomId, messageId, type: "READ_RECEIPT" }),
    });
  }

  isConnected() {
    return this.client?.connected || false;
  }
}
