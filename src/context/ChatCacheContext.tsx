
"use client";
import { createContext, useContext, useState, useCallback } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: { mimeType: string; data: Uint8Array }[];
  reasoning?: string;
  startTime?: number;
  endTime?: number;
};

type ChatCache = {
  [id: string]: Message[];
};

type ChatCacheContextType = {
  cache: ChatCache;
  getChat: (id: string) => Message[] | undefined;
  setChat: (id: string, messages: Message[]) => void;
};

const ChatCacheContext = createContext<ChatCacheContextType | undefined>(
  undefined,
);

export const ChatCacheProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cache, setCache] = useState<ChatCache>({});

  const getChat = useCallback(
    (id: string) => {
      return cache[id];
    },
    [cache],
  );

  const setChat = useCallback((id: string, messages: Message[]) => {
    setCache((prevCache) => ({
      ...prevCache,
      [id]: messages,
    }));
  }, []);

  return (
    <ChatCacheContext.Provider value={{ cache, getChat, setChat }}>
      {children}
    </ChatCacheContext.Provider>
  );
};

export const useChatCache = () => {
  const context = useContext(ChatCacheContext);
  if (context === undefined) {
    throw new Error("useChatCache must be used within a ChatCacheProvider");
  }
  return context;
};
