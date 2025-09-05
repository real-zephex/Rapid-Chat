"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  getWebSocketClient,
  ChatSession,
  ChatMessage,
} from "@/lib/websocket-client";
import { saveChats } from "@/utils/indexedDB";

interface ChatContextType {
  // WebSocket connection state
  isConnected: boolean;
  connectionStatus: "connected" | "disconnected" | "error" | "connecting";

  // Chat sessions
  activeSessions: Map<string, ChatSession>;
  loadingSessions: string[];

  // Actions
  startChat: (
    chatId: string,
    message: string,
    model: string,
    previousMessages: ChatMessage[],
    images?: { mimeType: string; data: Uint8Array }[]
  ) => void;

  getSession: (chatId: string) => ChatSession | undefined;
  clearSession: (chatId: string) => void;

  // Events
  onChatUpdate: (
    chatId: string,
    callback: (session: ChatSession) => void
  ) => () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "error" | "connecting"
  >("connecting");
  const [activeSessions, setActiveSessions] = useState<
    Map<string, ChatSession>
  >(new Map());
  const [loadingSessions, setLoadingSessions] = useState<string[]>([]);
  const [chatUpdateCallbacks, setChatUpdateCallbacks] = useState<
    Map<string, Set<(session: ChatSession) => void>>
  >(new Map());

  const wsClient = getWebSocketClient();

  // Initialize WebSocket event listeners
  useEffect(() => {
    if (!wsClient) return;

    const unsubscribeConnection = wsClient.onConnectionEvent((status) => {
      setConnectionStatus(status);
      setIsConnected(status === "connected");
    });

    const unsubscribeChat = wsClient.onChatEvent((chatId, event, data) => {
      switch (event) {
        case "chunk":
        case "complete":
          if (data?.session) {
            setActiveSessions((prev) =>
              new Map(prev).set(chatId, data.session)
            );

            // Update loading sessions
            setLoadingSessions((prev) =>
              data.session.isLoading
                ? prev.includes(chatId)
                  ? prev
                  : [...prev, chatId]
                : prev.filter((id) => id !== chatId)
            );

            // Save to IndexedDB
            if (event === "complete") {
              saveChats(chatId, data.session.messages);
            }

            // Notify callbacks
            const callbacks = chatUpdateCallbacks.get(chatId);
            if (callbacks) {
              callbacks.forEach((callback) => callback(data.session));
            }
          }
          break;

        case "error":
          setLoadingSessions((prev) => prev.filter((id) => id !== chatId));
          console.error(`Chat error for ${chatId}:`, data?.error);
          break;
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribeChat();
    };
  }, [wsClient, chatUpdateCallbacks]);

  // Fallback to API streaming when WebSocket is not available
  const startChatWithAPI = useCallback(
    async (
      chatId: string,
      message: string,
      model: string,
      previousMessages: ChatMessage[],
      images?: { mimeType: string; data: Uint8Array }[]
    ) => {
      try {
        setLoadingSessions((prev) => [...prev, chatId]);

        const response = await fetch("/api/chat-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            model,
            previousMessages: previousMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            images,
            chatId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response stream available");
        }

        // Create a session for this chat
        const newSession: ChatSession = {
          id: chatId,
          messages: [
            ...previousMessages,
            {
              id: `user_${Date.now()}`,
              role: "user",
              content: message,
              images,
              timestamp: Date.now(),
            },
            {
              id: `assistant_${Date.now()}`,
              role: "assistant",
              content: "",
              timestamp: Date.now(),
            },
          ],
          model,
          isLoading: true,
          lastActivity: Date.now(),
        };

        setActiveSessions((prev) => new Map(prev).set(chatId, newSession));

        // Process stream
        let assistantMessage = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case "chunk":
                    assistantMessage += data.data.chunk || "";
                    newSession.messages[
                      newSession.messages.length - 1
                    ].content = data.data.content || assistantMessage;
                    newSession.messages[
                      newSession.messages.length - 1
                    ].reasoning = data.data.reasoning;
                    setActiveSessions((prev) =>
                      new Map(prev).set(chatId, { ...newSession })
                    );
                    break;

                  case "complete":
                    newSession.isLoading = false;
                    newSession.messages[
                      newSession.messages.length - 1
                    ].content = data.data.content;
                    newSession.messages[
                      newSession.messages.length - 1
                    ].reasoning = data.data.reasoning;
                    newSession.messages[
                      newSession.messages.length - 1
                    ].startTime = data.data.startTime;
                    newSession.messages[
                      newSession.messages.length - 1
                    ].endTime = data.data.endTime;

                    setActiveSessions((prev) =>
                      new Map(prev).set(chatId, { ...newSession })
                    );
                    setLoadingSessions((prev) =>
                      prev.filter((id) => id !== chatId)
                    );

                    // Save to IndexedDB
                    saveChats(chatId, newSession.messages);
                    break;

                  case "error":
                    newSession.isLoading = false;
                    setActiveSessions((prev) =>
                      new Map(prev).set(chatId, { ...newSession })
                    );
                    setLoadingSessions((prev) =>
                      prev.filter((id) => id !== chatId)
                    );
                    throw new Error(data.data.error);
                }
              } catch (parseError) {
                console.warn("Failed to parse SSE data:", parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error("API chat error:", error);
        setLoadingSessions((prev) => prev.filter((id) => id !== chatId));
      }
    },
    []
  );

  const startChat = useCallback(
    (
      chatId: string,
      message: string,
      model: string,
      previousMessages: ChatMessage[],
      images?: { mimeType: string; data: Uint8Array }[]
    ) => {
      if (isConnected && wsClient) {
        wsClient.startChat(chatId, message, model, previousMessages, images);
      } else {
        // Fallback to API streaming
        startChatWithAPI(chatId, message, model, previousMessages, images);
      }
    },
    [isConnected, wsClient, startChatWithAPI]
  );

  const getSession = useCallback(
    (chatId: string) => {
      return activeSessions.get(chatId) || wsClient?.getSession(chatId);
    },
    [activeSessions, wsClient]
  );

  const clearSession = useCallback(
    (chatId: string) => {
      setActiveSessions((prev) => {
        const newMap = new Map(prev);
        newMap.delete(chatId);
        return newMap;
      });
      setLoadingSessions((prev) => prev.filter((id) => id !== chatId));
      wsClient?.clearSession(chatId);
    },
    [wsClient]
  );

  const onChatUpdate = useCallback(
    (chatId: string, callback: (session: ChatSession) => void) => {
      setChatUpdateCallbacks((prev) => {
        const newMap = new Map(prev);
        const callbacks = newMap.get(chatId) || new Set();
        callbacks.add(callback);
        newMap.set(chatId, callbacks);
        return newMap;
      });

      return () => {
        setChatUpdateCallbacks((prev) => {
          const newMap = new Map(prev);
          const callbacks = newMap.get(chatId);
          if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
              newMap.delete(chatId);
            } else {
              newMap.set(chatId, callbacks);
            }
          }
          return newMap;
        });
      };
    },
    []
  );

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        connectionStatus,
        activeSessions,
        loadingSessions,
        startChat,
        getSession,
        clearSession,
        onChatUpdate,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
