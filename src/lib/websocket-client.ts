"use client";

import { v4 as uuidv4 } from "uuid";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: { mimeType: string; data: Uint8Array }[];
  reasoning?: string;
  startTime?: number;
  endTime?: number;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  model: string;
  isLoading: boolean;
  lastActivity: number;
}

export interface WebSocketMessage {
  type:
    | "chat_start"
    | "chat_chunk"
    | "chat_complete"
    | "chat_error"
    | "chat_status"
    | "ping"
    | "pong";
  chatId: string;
  data?: any;
  messageId?: string;
  chunk?: string;
  error?: string;
  timestamp: number;
}

type ChatEventCallback = (chatId: string, event: string, data?: any) => void;
type ConnectionEventCallback = (
  status: "connected" | "disconnected" | "error"
) => void;

class WebSocketChatClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isIntentionalClose = false;
  private chatEventCallbacks: Set<ChatEventCallback> = new Set();
  private connectionEventCallbacks: Set<ConnectionEventCallback> = new Set();
  private activeSessions: Map<string, ChatSession> = new Map();
  private pendingMessages: WebSocketMessage[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.connect();
    }
  }

  private connect() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/websocket`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.handleError(error);
    }
  }

  private handleOpen() {
    console.log("WebSocket connected");
    this.reconnectAttempts = 0;
    this.connectionEventCallbacks.forEach((callback) => callback("connected"));

    // Send any pending messages
    this.pendingMessages.forEach((message) => this.sendMessage(message));
    this.pendingMessages = [];

    // Start heartbeat
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case "chat_chunk":
          this.handleChatChunk(message);
          break;
        case "chat_complete":
          this.handleChatComplete(message);
          break;
        case "chat_error":
          this.handleChatError(message);
          break;
        case "chat_status":
          this.handleChatStatus(message);
          break;
        case "pong":
          // Heartbeat response
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log("WebSocket disconnected:", event.code, event.reason);
    this.stopHeartbeat();

    if (!this.isIntentionalClose) {
      this.connectionEventCallbacks.forEach((callback) =>
        callback("disconnected")
      );
      this.attemptReconnect();
    }
  }

  private handleError(error: any) {
    console.error("WebSocket error:", error);
    this.connectionEventCallbacks.forEach((callback) => callback("error"));
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
    );

    setTimeout(() => {
      if (!this.isIntentionalClose) {
        this.connect();
      }
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: "ping",
          chatId: "",
          timestamp: Date.now(),
        });
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleChatChunk(message: WebSocketMessage) {
    const session = this.activeSessions.get(message.chatId);
    if (!session) return;

    // Find the last assistant message and update it
    const lastMessage = session.messages[session.messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      lastMessage.content += message.chunk || "";
    }

    this.chatEventCallbacks.forEach((callback) =>
      callback(message.chatId, "chunk", { chunk: message.chunk, session })
    );
  }

  private handleChatComplete(message: WebSocketMessage) {
    const session = this.activeSessions.get(message.chatId);
    if (!session) return;

    session.isLoading = false;
    session.lastActivity = Date.now();

    // Update the last message with final data
    const lastMessage = session.messages[session.messages.length - 1];
    if (lastMessage && message.data) {
      Object.assign(lastMessage, message.data);
    }

    this.chatEventCallbacks.forEach((callback) =>
      callback(message.chatId, "complete", { session, data: message.data })
    );
  }

  private handleChatError(message: WebSocketMessage) {
    const session = this.activeSessions.get(message.chatId);
    if (session) {
      session.isLoading = false;
    }

    this.chatEventCallbacks.forEach((callback) =>
      callback(message.chatId, "error", { error: message.error, session })
    );
  }

  private handleChatStatus(message: WebSocketMessage) {
    this.chatEventCallbacks.forEach((callback) =>
      callback(message.chatId, "status", message.data)
    );
  }

  private sendMessage(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.pendingMessages.push(message);
    }
  }

  // Public API
  public startChat(
    chatId: string,
    userMessage: string,
    model: string,
    previousMessages: ChatMessage[] = [],
    images?: { mimeType: string; data: Uint8Array }[]
  ): string {
    const messageId = uuidv4();

    // Create or update session
    const session: ChatSession = this.activeSessions.get(chatId) || {
      id: chatId,
      messages: [...previousMessages],
      model,
      isLoading: false,
      lastActivity: Date.now(),
    };

    // Add user message
    const userChatMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: userMessage,
      images,
      timestamp: Date.now(),
    };

    session.messages.push(userChatMessage);
    session.isLoading = true;
    session.lastActivity = Date.now();
    session.model = model;

    // Add placeholder assistant message
    const assistantMessage: ChatMessage = {
      id: messageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };
    session.messages.push(assistantMessage);

    this.activeSessions.set(chatId, session);

    // Send WebSocket message
    this.sendMessage({
      type: "chat_start",
      chatId,
      messageId,
      data: {
        message: userMessage,
        model,
        previousMessages: previousMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        images,
      },
      timestamp: Date.now(),
    });

    return messageId;
  }

  public getSession(chatId: string): ChatSession | undefined {
    return this.activeSessions.get(chatId);
  }

  public getAllSessions(): ChatSession[] {
    return Array.from(this.activeSessions.values());
  }

  public getLoadingSessions(): ChatSession[] {
    return Array.from(this.activeSessions.values()).filter((s) => s.isLoading);
  }

  public clearSession(chatId: string) {
    this.activeSessions.delete(chatId);
  }

  public onChatEvent(callback: ChatEventCallback) {
    this.chatEventCallbacks.add(callback);
    return () => this.chatEventCallbacks.delete(callback);
  }

  public onConnectionEvent(callback: ConnectionEventCallback) {
    this.connectionEventCallbacks.add(callback);
    return () => this.connectionEventCallbacks.delete(callback);
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public disconnect() {
    this.isIntentionalClose = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
let webSocketClient: WebSocketChatClient | null = null;

export function getWebSocketClient(): WebSocketChatClient {
  if (!webSocketClient && typeof window !== "undefined") {
    webSocketClient = new WebSocketChatClient();
  }
  return webSocketClient!;
}

export default WebSocketChatClient;
