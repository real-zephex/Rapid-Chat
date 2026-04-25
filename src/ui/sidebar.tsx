"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { addTabs, deleteAllChats } from "@/utils/indexedDB";
import { deleteCouncilSession } from "@/utils/councilIndexedDB";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MouseEvent, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  HiChatBubbleLeft,
  HiInformationCircle,
  HiMoon,
  HiOutlineRectangleGroup,
  HiOutlineUserGroup,
  HiSun,
  HiOutlineViewColumns,
  HiPlus,
  HiOutlineCog8Tooth,
} from "react-icons/hi2";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { v4 as uuidv4 } from "uuid";

import DeleteModal from "./delete-modal";

export async function handlePress(
  event: MouseEvent<HTMLButtonElement> | KeyboardEvent,
  router: AppRouterInstance,
) {
  event.preventDefault();

  const uuid = uuidv4();
  router.push(`/chat/${uuid}`);
}

const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max) + "..." : text;

const Sidebar = () => {
  const {
    isOpen,
    titles,
    councilSessions,
    setIsOpen,
    refreshTitles,
    refreshCouncilSessions,
  } = useSidebar();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { theme, toggleTheme, isHydrated } = useTheme();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeChatId = pathname.startsWith("/chat/")
    ? pathname.split("/")[2] || ""
    : "";
  const splitChatId = searchParams.get("split") || "";
  const activeCouncilId = pathname.startsWith("/council/")
    ? pathname.split("/")[2] || ""
    : "";
  const conversations = Object.entries(titles).reverse();

  useHotkeys("ctrl+shift+o", (event) => {
    event.preventDefault();
    void handlePress(event, router);
  });

  useHotkeys("ctrl+b", (event) => {
    event.preventDefault();
    setIsOpen(!isOpen);
  });

  const closeOnMobile = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const openChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
    closeOnMobile();
  };

  const openCouncilSession = (sessionId: string) => {
    router.push(`/council/${sessionId}`);
    closeOnMobile();
  };

  const handleDeleteCouncilSession = async (sessionId: string) => {
    await deleteCouncilSession(sessionId);
    await refreshCouncilSessions();
    if (activeCouncilId === sessionId) {
      router.push("/council");
    }
  };

  const openInSplit = async (chatId: string) => {
    if (!activeChatId || activeChatId === chatId) {
      if (!activeChatId) {
        openChat(chatId);
        return;
      }

      const fallbackSplitId = conversations.find(([id]) => id !== chatId)?.[0];

      const params = new URLSearchParams(searchParams.toString());

      if (fallbackSplitId) {
        params.set("split", fallbackSplitId);
        router.push(`/chat/${chatId}?${params.toString()}`);
        closeOnMobile();
        return;
      }

      const generatedSplitId = uuidv4();
      await addTabs(generatedSplitId);
      await refreshTitles();
      params.set("split", generatedSplitId);
      router.push(`/chat/${chatId}?${params.toString()}`);
      closeOnMobile();
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("split", chatId);
    router.push(`/chat/${activeChatId}?${params.toString()}`);
    closeOnMobile();
  };

  const confirmDelete = async () => {
    await deleteAllChats();
    await refreshTitles();
    setShowDeleteModal(false);
    router.push("/chat");
  };

  return (
    <>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      <aside
        className={`fixed left-0 top-0 z-30 h-full overflow-hidden border-r border-border bg-background transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? "w-80" : "w-0"
        }`}
        aria-label="Sidebar"
      >
        <div className="flex h-full w-80 max-w-[85vw] flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
              title="Close sidebar (Ctrl+B)"
              aria-label="Close sidebar"
            >
              <BsLayoutSidebarInsetReverse size={18} />
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-accent-strong"
              onClick={(event) => {
                void handlePress(event, router);
              }}
              title="New chat (Ctrl+Shift+O)"
              aria-label="Create new chat"
            >
              <HiPlus size={14} />
              <span>New Chat</span>
            </button>
          </div>

          <div className="px-4 pb-2 pt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                router.push("/council");
                closeOnMobile();
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                pathname.startsWith("/council") && !activeCouncilId
                  ? "border-accent/35 bg-accent/10 text-accent"
                  : "border-transparent bg-surface text-text-secondary hover:border-border hover:text-text-primary"
              }`}
            >
              <HiOutlineUserGroup size={15} />
              <span>AI Council</span>
            </button>
            <button
              type="button"
              onClick={() => {
                router.push("/admin");
                closeOnMobile();
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                pathname.startsWith("/admin")
                  ? "border-accent/35 bg-accent/10 text-accent"
                  : "border-transparent bg-surface text-text-secondary hover:border-border hover:text-text-primary"
              }`}
            >
              <HiOutlineCog8Tooth size={15} />
              <span>Admin</span>
            </button>
          </div>

          {councilSessions.length > 0 && (
            <>
              <div className="px-4 pb-1.5 pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  Council Sessions
                </p>
              </div>
              <nav
                className="scrollbar-track-only px-2 pb-2"
                aria-label="Council session history"
              >
                <ul className="space-y-0.5">
                  {councilSessions.map((session) => {
                    const isActive = activeCouncilId === session.id;
                    return (
                      <li key={session.id}>
                        <div
                          className={`group flex items-center gap-1 rounded-xl border px-1 py-1 transition-colors ${
                            isActive
                              ? "border-accent/35 bg-accent/10"
                              : "border-transparent hover:border-border hover:bg-surface"
                          }`}
                        >
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left"
                            onClick={() => openCouncilSession(session.id)}
                          >
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                isActive ? "bg-accent" : "bg-border"
                              }`}
                            />
                            <span
                              className={`truncate text-sm ${
                                isActive
                                  ? "font-semibold text-text-primary"
                                  : "text-text-secondary"
                              }`}
                            >
                              {truncate(session.question, 35)}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDeleteCouncilSession(session.id);
                            }}
                            className="rounded-md p-1.5 text-text-muted opacity-0 transition-opacity hover:bg-background hover:text-error group-hover:opacity-100"
                            aria-label="Delete council session"
                            title="Delete session"
                          >
                            <RiDeleteBin2Fill size={13} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </>
          )}

          <div className="px-4 pb-2 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Conversations
            </p>
          </div>

          <nav
            className="scrollbar-track-only min-h-0 flex-1 overflow-y-auto px-2 pb-3"
            aria-label="Conversation history"
          >
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-text-muted/70">
                <HiChatBubbleLeft size={28} className="mb-3" />
                <p className="text-xs font-medium uppercase tracking-[0.14em]">
                  No chats yet
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {conversations.map(([chatId, title]) => {
                  const isPrimary = activeChatId === chatId;
                  const isSecondary = splitChatId === chatId;

                  return (
                    <li key={chatId}>
                      <div
                        className={`group flex items-center gap-1 rounded-xl border px-1 py-1 transition-colors ${
                          isPrimary
                            ? "border-accent/35 bg-accent/10"
                            : isSecondary
                              ? "border-border bg-surface"
                              : "border-transparent hover:border-border hover:bg-surface"
                        }`}
                      >
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left"
                          onClick={() => openChat(chatId)}
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              isPrimary
                                ? "bg-accent"
                                : isSecondary
                                  ? "bg-text-secondary"
                                  : "bg-border"
                            }`}
                          />
                          <span
                            className={`truncate text-sm ${
                              isPrimary
                                ? "font-semibold text-text-primary"
                                : "text-text-secondary"
                            }`}
                          >
                            {title}
                          </span>
                        </button>

                        <div className="flex items-center gap-1 pr-1">
                          {isPrimary && (
                            <span className="rounded-md border border-accent/35 bg-accent/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-accent">
                              A
                            </span>
                          )}
                          {isSecondary && (
                            <span className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                              B
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              void openInSplit(chatId);
                            }}
                            className="rounded-md p-1.5 text-text-muted opacity-0 transition-opacity hover:bg-background hover:text-text-primary group-hover:opacity-100"
                            aria-label={`Open ${title} in split view`}
                            title="Open in split view"
                          >
                            <HiOutlineViewColumns size={15} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <div className="mt-auto border-t border-border bg-surface px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                {Object.keys(titles).length} Chats
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  title={
                    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
                  }
                  aria-label={
                    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {theme === "dark" ? <HiSun size={12} /> : <HiMoon size={12} />}
                  <span>{isHydrated ? theme : "Theme"}</span>
                </button>

                {Object.keys(titles).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="rounded-lg p-2 text-text-muted transition-colors hover:bg-background hover:text-error"
                    title="Clear all history"
                    aria-label="Clear all chat history"
                  >
                    <RiDeleteBin2Fill size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-accent">
                <HiInformationCircle size={17} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text-primary">
                  Rapid Chat
                </span>
                <span className="text-[10px] text-text-muted">v3.0 split-ready</span>
              </div>
              {splitChatId && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                  <HiOutlineRectangleGroup size={11} />
                  Split
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {!isOpen && (
        <button
          type="button"
          className="fixed left-3 top-3 z-40 rounded-lg border border-border bg-surface p-2 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          onClick={() => setIsOpen(true)}
          title="Open sidebar (Ctrl+B)"
          aria-label="Open sidebar"
        >
          <BsLayoutSidebarInsetReverse size={16} />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
