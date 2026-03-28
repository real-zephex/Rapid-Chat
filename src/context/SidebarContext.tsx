"use client";

import { retrieveChats, retrieveTabs } from "@/utils/indexedDB";
import { listCouncilSessions } from "@/utils/councilIndexedDB";
import { generateChatTitle } from "@/utils/titleGenerator";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

interface CouncilSessionEntry {
  id: string;
  question: string;
  timestamp: number;
}

interface SidebarContextType {
  isOpen: boolean;
  titles: Record<string, string>;
  tabs: string[];
  councilSessions: CouncilSessionEntry[];
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  refreshTitles: () => Promise<void>;
  refreshCouncilSessions: () => Promise<void>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [tabs, setTabs] = useState<string[]>([]);
  const [councilSessions, setCouncilSessions] = useState<CouncilSessionEntry[]>([]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const refreshTitles = async () => await fetchTabs();

  const refreshCouncilSessions = useCallback(async () => {
    try {
      const sessions = await listCouncilSessions();
      setCouncilSessions(
        sessions.map((s) => ({
          id: s.id,
          question: s.question,
          timestamp: s.timestamp,
        })),
      );
    } catch (error) {
      console.error("Error loading council sessions:", error);
    }
  }, []);

  // Non-context function
  const fetchTabs = async () => {
    const tabs = await retrieveTabs();

    const newTitles: Record<string, string> = {};
    for (const tab of tabs) {
      const chats = await retrieveChats(tab);
      if (chats.length === 0) {
        newTitles[tab] = "New Chat";
      } else {
        // Use intelligent title generation for chats with conversation history
        try {
          const generatedTitle = await generateChatTitle(chats);
          newTitles[tab] = generatedTitle;
        } catch (error) {
          console.error(
            "Fallback to simple title generation for tab:",
            tab,
            error
          );
          // Fallback to simple title generation if AI fails
          const lastMessage = chats[chats.length - 1];
          newTitles[tab] =
            lastMessage.role === "user"
              ? lastMessage.content.slice(0, 50) +
                (lastMessage.content.length > 50 ? "..." : "")
              : lastMessage.content.slice(0, 50) + "...";
        }
      }
    }
    setTitles(newTitles);
  };

  useEffect(() => {
    async function getTabs() {
      const tabs = await retrieveTabs();
      setTabs(tabs);
    }

    fetchTabs();
    getTabs();
    refreshCouncilSessions();
  }, [refreshCouncilSessions]);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        titles,
        tabs,
        councilSessions,
        setIsOpen,
        toggleSidebar,
        refreshTitles,
        refreshCouncilSessions,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
