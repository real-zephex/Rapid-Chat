"use client";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { HiPlus, HiChatBubbleLeft, HiInformationCircle } from "react-icons/hi2";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { v4 as uuidv4 } from "uuid";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import { deleteAllChats } from "@/utils/indexedDB";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { useState } from "react";
import DeleteModal from "./delete-modal";

export async function handlePress(
  event: React.MouseEvent<HTMLButtonElement> | KeyboardEvent,
  router: AppRouterInstance,
) {
  event.preventDefault();

  const uuid = uuidv4();
  router.push("/chat/" + uuid);
}

const Sidebar = () => {
  const { isOpen, titles, setIsOpen, refreshTitles } = useSidebar();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const router = useRouter();
  const pathname = usePathname().split("/")[2];
  const sidebarRef = useRef(null);

  useHotkeys("ctrl+shift+o", (e) => {
    e.preventDefault();
    handlePress(e, router);
  });

  useHotkeys("ctrl+b", (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  });

  const handleDeleteAll = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    await deleteAllChats();
    refreshTitles();
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
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-30 ${
          isOpen ? "w-72" : "w-0"
        } overflow-hidden border-r border-border bg-background`}
        ref={sidebarRef}
      >
        <div className="flex flex-col h-full w-72">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl hover:bg-surface transition-all duration-200 text-text-muted hover:text-text-primary"
              title="Close sidebar (Ctrl+B)"
            >
              <BsLayoutSidebarInsetReverse size={18} />
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-text-primary text-background hover:opacity-90 transition-all duration-200 font-bold text-xs uppercase tracking-widest"
              onClick={(e) => handlePress(e, router)}
              title="New chat (Ctrl+Shift+O)"
            >
              <HiPlus size={14} />
              <span>New</span>
            </button>
          </div>

          <div className="px-4 py-2">
            <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">
              Conversations
            </h2>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
            {Object.entries(titles).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-text-muted/40">
                <HiChatBubbleLeft size={32} className="mb-4" />
                <p className="text-[11px] font-medium uppercase tracking-wider">
                  Empty space
                </p>
              </div>
            ) : (
              Object.entries(titles)
                .reverse()
                .map(([id, title]) => (
                  <Link
                    href={`/chat/${id}`}
                    prefetch={true}
                    key={id}
                    className="block"
                  >
                    <div
                      className={`group px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        pathname === id
                          ? "bg-surface shadow-sm"
                          : "hover:bg-surface/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            pathname === id
                              ? "bg-accent scale-100"
                              : "bg-transparent scale-0 group-hover:bg-text-muted/30 group-hover:scale-100"
                          }`}
                        />
                        <span
                          className={`text-sm truncate flex-1 transition-colors duration-200 ${
                            pathname === id
                              ? "text-text-primary font-semibold"
                              : "text-text-secondary group-hover:text-text-primary"
                          }`}
                        >
                          {title}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 mt-auto border-t border-border bg-background/50 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                {Object.keys(titles).length} Active
              </span>
              {Object.keys(titles).length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all duration-200"
                  title="Clear all history"
                >
                  <RiDeleteBin2Fill size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-row items-center gap-4 active:scale-95 transition-all select-none">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <HiInformationCircle size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Rapid Chat
                </span>
                <span className="text-[10px] text-text-muted">
                  v2.0.0 "Neutral"
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toggle Button - only visible when sidebar is closed */}
      {!isOpen && (
        <button
          className="fixed top-3 left-3 z-40 p-2 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-all"
          onClick={() => setIsOpen(true)}
          title="Open sidebar (Ctrl+B)"
        >
          <BsLayoutSidebarInsetReverse
            size={16}
            className="text-text-secondary"
          />
        </button>
      )}{" "}
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
