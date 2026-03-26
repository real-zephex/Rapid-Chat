"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HiArrowsRightLeft, HiOutlineRectangleGroup, HiXMark } from "react-icons/hi2";

import ChatInterface from "@/ui/chat-interface";

type Pane = "primary" | "secondary";

interface ChatWorkspaceProps {
  id: string;
  splitId?: string;
}

const ChatWorkspace = ({ id, splitId }: ChatWorkspaceProps) => {
  const router = useRouter();
  const normalizedSplitId = useMemo(() => {
    if (!splitId || splitId === id) {
      return "";
    }
    return splitId;
  }, [id, splitId]);

  const hasSplit = normalizedSplitId.length > 0;
  const [activePane, setActivePane] = useState<Pane>("primary");
  const [mobilePane, setMobilePane] = useState<Pane>("primary");

  useEffect(() => {
    if (!hasSplit) {
      setActivePane("primary");
      setMobilePane("primary");
    }
  }, [hasSplit]);

  useHotkeys(
    "alt+1",
    (event) => {
      if (!hasSplit) {
        return;
      }
      event.preventDefault();
      setActivePane("primary");
      setMobilePane("primary");
    },
    { enabled: hasSplit },
    [hasSplit],
  );

  useHotkeys(
    "alt+2",
    (event) => {
      if (!hasSplit) {
        return;
      }
      event.preventDefault();
      setActivePane("secondary");
      setMobilePane("secondary");
    },
    { enabled: hasSplit },
    [hasSplit],
  );

  const closeSplit = () => {
    router.push(`/chat/${id}`);
  };

  const swapPanes = () => {
    if (!normalizedSplitId) {
      return;
    }

    router.push(`/chat/${normalizedSplitId}?split=${id}`);
    setActivePane((current) =>
      current === "primary" ? "secondary" : "primary",
    );
    setMobilePane((current) =>
      current === "primary" ? "secondary" : "primary",
    );
  };

  const handleDeleteChat = (pane: Pane) => {
    if (!hasSplit || !normalizedSplitId) {
      router.push("/chat");
      return;
    }

    if (pane === "primary") {
      router.push(`/chat/${normalizedSplitId}`);
      return;
    }

    router.push(`/chat/${id}`);
  };

  return (
    <section className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      {hasSplit && (
        <header className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            <HiOutlineRectangleGroup size={14} />
            <span>Split View</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={swapPanes}
              className="rounded-lg border border-border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-label="Swap split panes"
            >
              <span className="flex items-center gap-1">
                <HiArrowsRightLeft size={13} />
                Swap
              </span>
            </button>
            <button
              type="button"
              onClick={closeSplit}
              className="rounded-lg border border-border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-label="Close split view"
            >
              <span className="flex items-center gap-1">
                <HiXMark size={13} />
                Close
              </span>
            </button>
          </div>
        </header>
      )}

      {hasSplit && (
        <div className="flex gap-2 border-b border-border bg-background px-3 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setMobilePane("primary");
              setActivePane("primary");
            }}
            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              mobilePane === "primary"
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-text-secondary"
            }`}
          >
            Left Chat
          </button>
          <button
            type="button"
            onClick={() => {
              setMobilePane("secondary");
              setActivePane("secondary");
            }}
            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              mobilePane === "secondary"
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-text-secondary"
            }`}
          >
            Right Chat
          </button>
        </div>
      )}

      <div
        className={`grid min-h-0 flex-1 overflow-hidden ${
          hasSplit ? "lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        <div
          className={`min-h-0 overflow-hidden ${
            hasSplit && mobilePane === "secondary" ? "hidden lg:block" : "block"
          } ${
            hasSplit
              ? "border-r border-border lg:border-r"
              : "border-r-0"
          }`}
        >
          <ChatInterface
            id={id}
            pane="primary"
            isSplitView={hasSplit}
            isActivePane={hasSplit ? activePane === "primary" : true}
            onActivatePane={() => setActivePane("primary")}
            onDeleteChat={() => handleDeleteChat("primary")}
          />
        </div>

        {hasSplit && normalizedSplitId && (
          <div
            className={`min-h-0 overflow-hidden ${
              mobilePane === "primary" ? "hidden lg:block" : "block"
            }`}
          >
            <ChatInterface
              id={normalizedSplitId}
              pane="secondary"
              isSplitView={true}
              isActivePane={activePane === "secondary"}
              onActivatePane={() => setActivePane("secondary")}
              onDeleteChat={() => handleDeleteChat("secondary")}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ChatWorkspace;
