"use client";

import { retrieveChats, retrieveTabs } from "@/utils/indexedDB";
import { generateChatTitle } from "@/utils/titleGenerator";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface SidebarContextType {
  isOpen: boolean;
  titles: Record<string, string>;
  tabs: string[];
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  refreshTitles: () => Promise<void>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [tabs, setTabs] = useState<string[]>([]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const refreshTitles = async () => await fetchTabs();

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
  }, []);

  return (
    <SidebarContext.Provider
      value={{ isOpen, titles, tabs, setIsOpen, toggleSidebar, refreshTitles }}
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
