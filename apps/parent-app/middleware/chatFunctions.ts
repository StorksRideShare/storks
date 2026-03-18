type MessageData = {
  sender_id: string;
  content: string;
  type: string;
  conversation_id: string;
};

type MessageHandler = (data: MessageData) => void;
type StatusHandler = () => void;
type ErrorHandler = (error: Event) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private currentUserId: string = "";
  private currentRoom: string = "";
  private messageHandler: MessageHandler | null = null;
  private openHandler: StatusHandler | null = null;
  private closeHandler: StatusHandler | null = null;
  private errorHandler: ErrorHandler | null = null;

  /**
   * Connect to the WebSocket server.
   * @param url - The base WebSocket server URL (e.g., ws://example.com/ws)
   * @param userId - The current user's ID
   */
  connect(url: string, userId: string): void {
    if (this.ws) {
      console.warn("WebSocket already connected. Disconnect first.");
      return;
    }
    this.currentUserId = userId;
    const fullUrl = url + "?user_id=" + encodeURIComponent(userId);
    this.ws = new WebSocket(fullUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      if (this.openHandler) this.openHandler();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as MessageData;
        if (this.messageHandler) {
          this.messageHandler(data);
        }
      } catch (e) {
        console.warn("Received non-JSON message:", event.data);
        // Optionally handle raw messages if needed
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (this.errorHandler) this.errorHandler(error);
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.ws = null;
      this.currentRoom = "";
      if (this.closeHandler) this.closeHandler();
    };
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Join a chat room.
   * @param roomId - The conversation/room ID to join
   * @throws If not connected or roomId is empty
   */
  joinRoom(roomId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }
    if (!roomId) {
      throw new Error("Room ID is required");
    }
    this.ws.send(
      JSON.stringify({
        type: "join",
        conversation_id: roomId,
      }),
    );
    this.currentRoom = roomId;
  }

  /**
   * Send a chat message to the currently joined room.
   * @param content - The message text
   * @throws If not connected, no room joined, or content is empty
   */
  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }
    if (!this.currentRoom) {
      throw new Error("No room joined");
    }
    const trimmed = content.trim();
    if (!trimmed) return;

    this.ws.send(
      JSON.stringify({
        type: "chat",
        conversation_id: this.currentRoom,
        sender_id: this.currentUserId,
        content: trimmed,
      }),
    );
  }

  // Event Handlers

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  onOpen(handler: StatusHandler): void {
    this.openHandler = handler;
  }

  onClose(handler: StatusHandler): void {
    this.closeHandler = handler;
  }

  onError(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

  // Getters

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getCurrentRoom(): string {
    console.log(this.currentRoom);
    return this.currentRoom;
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }
}
