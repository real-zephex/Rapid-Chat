import { NextRequest } from "next/server";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import ModelProvider from "@/models";
import { processMessageContent } from "@/utils/responseCleaner";

interface WebSocketMessage {
  type: string;
  chatId: string;
  messageId?: string;
  data?: any;
  timestamp: number;
}

interface ExtendedWebSocket extends WebSocket {
  id: string;
  isAlive: boolean;
}

class WebSocketChatServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ExtendedWebSocket> = new Map();
  private activeChats: Map<string, { messageId: string; clientId: string }> =
    new Map();

  constructor() {
    if (process.env.NODE_ENV === "development") {
      this.initializeWebSocketServer();
    }
  }

  private initializeWebSocketServer() {
    try {
      // Create HTTP server for WebSocket in development
      const server = createServer();
      this.wss = new WebSocketServer({ server });

      this.wss.on("connection", this.handleConnection.bind(this));

      // Start server on a different port for WebSocket
      const port = parseInt(process.env.WS_PORT || "3001");
      server.listen(port, () => {
        console.log(`WebSocket server running on port ${port}`);
      });

      // Heartbeat to keep connections alive
      setInterval(() => {
        this.clients.forEach((ws) => {
          if (!ws.isAlive) {
            this.clients.delete(ws.id);
            return ws.terminate();
          }
          ws.isAlive = false;
          ws.ping();
        });
      }, 30000);
    } catch (error) {
      console.error("Failed to initialize WebSocket server:", error);
    }
  }

  private handleConnection(ws: ExtendedWebSocket) {
    const clientId = this.generateClientId();
    ws.id = clientId;
    ws.isAlive = true;

    this.clients.set(clientId, ws);
    console.log(`WebSocket client connected: ${clientId}`);

    ws.on("message", (data) => this.handleMessage(ws, data));
    ws.on("close", () => this.handleDisconnection(ws));
    ws.on("error", (error) =>
      console.error(`WebSocket error for ${clientId}:`, error)
    );
    ws.on("pong", () => {
      ws.isAlive = true;
    });
  }

  private async handleMessage(ws: ExtendedWebSocket, data: any) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case "chat_start":
          await this.handleChatStart(ws, message);
          break;
        case "ping":
          this.sendMessage(ws, {
            type: "pong",
            chatId: message.chatId,
            timestamp: Date.now(),
          });
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
      this.sendMessage(ws, {
        type: "chat_error",
        chatId: "",
        data: { error: "Invalid message format" },
        timestamp: Date.now(),
      });
    }
  }

  private async handleChatStart(
    ws: ExtendedWebSocket,
    message: WebSocketMessage
  ) {
    const { chatId, messageId, data } = message;

    if (!data || !data.message || !data.model) {
      this.sendMessage(ws, {
        type: "chat_error",
        chatId,
        messageId,
        data: { error: "Missing required chat data" },
        timestamp: Date.now(),
      });
      return;
    }

    // Track this chat
    this.activeChats.set(chatId, { messageId: messageId!, clientId: ws.id });

    try {
      // Send status update
      this.sendMessage(ws, {
        type: "chat_status",
        chatId,
        messageId,
        data: { status: "processing" },
        timestamp: Date.now(),
      });

      // Get response stream from ModelProvider
      const response = await ModelProvider({
        type: data.model,
        query: data.message,
        chats: data.previousMessages || [],
        imageData: data.images,
      });

      if (!(response instanceof ReadableStream)) {
        throw new Error("Expected a ReadableStream response");
      }

      const reader = response.getReader();
      let assistantMessage = "";
      const startTime = performance.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Check if client is still connected and chat is still active
        if (!this.clients.has(ws.id) || !this.activeChats.has(chatId)) {
          break;
        }

        const text =
          typeof value === "string" ? value : new TextDecoder().decode(value);
        assistantMessage += text;

        const { displayContent, reasoning } =
          processMessageContent(assistantMessage);

        // Send chunk to client
        this.sendMessage(ws, {
          type: "chat_chunk",
          chatId,
          messageId,
          data: { chunk: text, content: displayContent, reasoning },
          timestamp: Date.now(),
        });
      }

      const endTime = performance.now();
      const { displayContent, reasoning } =
        processMessageContent(assistantMessage);

      // Send completion message
      this.sendMessage(ws, {
        type: "chat_complete",
        chatId,
        messageId,
        data: {
          content: displayContent,
          reasoning,
          startTime,
          endTime,
        },
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`Error processing chat ${chatId}:`, error);
      this.sendMessage(ws, {
        type: "chat_error",
        chatId,
        messageId,
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: Date.now(),
      });
    } finally {
      // Clean up
      this.activeChats.delete(chatId);
    }
  }

  private handleDisconnection(ws: ExtendedWebSocket) {
    console.log(`WebSocket client disconnected: ${ws.id}`);
    this.clients.delete(ws.id);

    // Clean up any active chats for this client
    for (const [chatId, chatData] of this.activeChats.entries()) {
      if (chatData.clientId === ws.id) {
        this.activeChats.delete(chatId);
      }
    }
  }

  private sendMessage(ws: ExtendedWebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Initialize server instance
let wsServer: WebSocketChatServer | null = null;

export function GET(request: NextRequest) {
  // For production, we'll handle WebSocket upgrade differently
  if (process.env.NODE_ENV === "production") {
    return new Response(
      "WebSocket endpoints not supported in production serverless environment",
      {
        status: 501,
      }
    );
  }

  // Initialize server if not already done
  if (!wsServer) {
    wsServer = new WebSocketChatServer();
  }

  return new Response("WebSocket server initialized", { status: 200 });
}

export function POST(request: NextRequest) {
  return new Response("WebSocket server uses GET for connections", {
    status: 405,
  });
}
