"use client";

import { useModel } from "@/context/ModelContext";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  HiOutlineChatBubbleLeft,
  HiOutlineCog8Tooth,
  HiOutlineMoon,
  HiOutlinePlus,
  HiOutlineSun,
  HiOutlineUserGroup,
  HiOutlineViewColumns,
} from "react-icons/hi2";
import { FiCpu } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

interface Action {
  id: string;
  name: string;
  icon?: React.ReactNode;
  category: "Navigation" | "Theme" | "Models" | "Chats";
  perform: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const { toggleTheme, theme } = useTheme();
  const { toggleSidebar, titles } = useSidebar();
  const { models, changeModel, selectedModel } = useModel();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useHotkeys("meta+k, ctrl+k", (e) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const actions = useMemo<Action[]>(() => {
    const defaultActions: Action[] = [
      {
        id: "new-chat",
        name: "New Chat",
        icon: <HiOutlinePlus size={16} />,
        category: "Navigation",
        perform: () => {
          router.push(`/chat/${uuidv4()}`);
        },
      },
      {
        id: "ai-council",
        name: "AI Council",
        icon: <HiOutlineUserGroup size={16} />,
        category: "Navigation",
        perform: () => {
          router.push("/council");
        },
      },
      {
        id: "admin",
        name: "Admin Dashboard",
        icon: <HiOutlineCog8Tooth size={16} />,
        category: "Navigation",
        perform: () => {
          router.push("/admin");
        },
      },
      {
        id: "toggle-sidebar",
        name: "Toggle Sidebar",
        icon: <HiOutlineViewColumns size={16} />,
        category: "Navigation",
        perform: toggleSidebar,
      },
      {
        id: "toggle-theme",
        name: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        icon: theme === "dark" ? <HiOutlineSun size={16} /> : <HiOutlineMoon size={16} />,
        category: "Theme",
        perform: toggleTheme,
      },
    ];

    const modelActions: Action[] = models.map((m) => ({
      id: `model-${m.code}`,
      name: `Switch to ${m.name}`,
      icon: <FiCpu size={16} />,
      category: "Models",
      perform: () => {
        changeModel(m.code);
      },
    }));

    const chatActions: Action[] = Object.entries(titles)
      .map(([id, title]) => ({
        id: `chat-${id}`,
        name: title,
        icon: <HiOutlineChatBubbleLeft size={16} />,
        category: "Chats" as const,
        perform: () => {
          router.push(`/chat/${id}`);
        },
      }))
      .reverse()
      .slice(0, 10); // Show max 10 recent chats

    return [...defaultActions, ...modelActions, ...chatActions];
  }, [router, toggleTheme, theme, toggleSidebar, models, changeModel, titles]);

  const filteredActions = useMemo(() => {
    if (!query) return actions;
    return actions.filter((a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) || 
      a.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, actions]);

  // Group by category for rendering
  const groupedActions = useMemo(() => {
    const groups: Record<string, Action[]> = {};
    for (const action of filteredActions) {
      if (!groups[action.category]) {
        groups[action.category] = [];
      }
      groups[action.category].push(action);
    }
    return groups;
  }, [filteredActions]);

  // Flatten back out just for keyboard navigation index matching
  const flatGroupedActions = useMemo(() => Object.values(groupedActions).flat(), [groupedActions]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatGroupedActions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatGroupedActions.length) % flatGroupedActions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatGroupedActions[selectedIndex]) {
          flatGroupedActions[selectedIndex].perform();
          setIsOpen(false);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, flatGroupedActions]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeItem = listRef.current.querySelector('[data-selected="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-center border-b border-border px-4 py-3">
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent text-text-primary placeholder-text-muted outline-none text-base"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-text-muted">
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5">Esc</kbd> to close
              </span>
            </div>

            <ul ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 scrollbar-track-only">
              {Object.entries(groupedActions).length === 0 ? (
                <div className="py-10 text-center text-sm text-text-muted">
                  No results found for &quot;{query}&quot;
                </div>
              ) : (
                Object.entries(groupedActions).map(([category, items]) => (
                  <div key={category} className="mb-2 last:mb-0">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                      {category}
                    </div>
                    {items.map((action) => {
                      const globalIndex = flatGroupedActions.indexOf(action);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <li
                          key={action.id}
                          data-selected={isSelected}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                            isSelected
                              ? "bg-accent text-background"
                              : "text-text-primary hover:bg-background"
                          }`}
                          onClick={() => {
                            action.perform();
                            setIsOpen(false);
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                        >
                          <span className={`opacity-80 ${isSelected ? "text-background" : "text-text-secondary"}`}>
                            {action.icon}
                          </span>
                          <span className="font-medium">{action.name}</span>
                          {action.category === "Models" && selectedModel === action.id.replace("model-", "") && (
                            <span className="ml-auto text-[10px] uppercase tracking-widest opacity-80 font-bold">
                              Active
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </div>
                ))
              )}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}