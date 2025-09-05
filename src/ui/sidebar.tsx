"use client";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { HiPlus, HiChatBubbleLeft } from "react-icons/hi2";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { v4 as uuidv4 } from "uuid";
import { useSidebar } from "@/context/SidebarContext";
import { useChat } from "@/context/ChatContext";
import Link from "next/link";

export async function handlePress(
  event: React.MouseEvent<HTMLButtonElement> | KeyboardEvent,
  router: AppRouterInstance
) {
  event.preventDefault();

  const uuid = uuidv4();
  router.push("/chat/" + uuid);
}

const Sidebar = () => {
  const { isOpen, titles, setIsOpen } = useSidebar();
  const { loadingSessions, connectionStatus } = useChat();

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

  // useHotkeys("down", (e) => {
  //   e.preventDefault();
  //   if (!isOpen) return;
  //   handleArrowKeys({ action: "down" });
  // });

  // useHotkeys("up", (e) => {
  //   e.preventDefault();
  //   if (!isOpen) return;
  //   handleArrowKeys({ action: "up" });
  // });

  // function handleArrowKeys({ action }: { action: "up" | "down" }) {
  //   const sidebar = sidebarRef.current;
  //   if (!sidebar) return;

  //   const el = getTabElementById(tabs[count]);
  //   if (el) {
  //     el.style.border = "none";
  //   }

  //   if (action === "up") {
  //     if (count === 0) return;
  //     const element = getTabElementById(tabs[count - 1]);
  //     if (element) {
  //       element.style.border = "1px solid #3b82f6";
  //       element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  //       element.setAttribute("tabindex", "0");
  //       element.focus();

  //       element.onkeydown = (e) => {
  //         if (e.key === "Enter") {
  //           element.click();
  //         }
  //       };

  //       setCount(count - 1);
  //     }
  //   } else if (action === "down") {
  //     if (count === tabs.length - 1) return;
  //     const element = getTabElementById(tabs[count + 1]);
  //     if (element) {
  //       element.style.border = "1px solid #3b82f6";
  //       element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  //       element.setAttribute("tabindex", "0");
  //       element.focus();

  //       element.onkeydown = (e) => {
  //         if (e.key === "Enter") {
  //           element.click();
  //         }
  //       };

  //       setCount(count + 1);
  //     }
  //   }
  // }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-neutral-900 rounded-r-lg transition-all duration-300 ease-in-out z-30 ${
          isOpen ? "w-64" : "w-0"
        } overflow-hidden`}
        ref={sidebarRef}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Rapid Chat</h2>
              <div className="flex items-center gap-2">
                {/* Connection Status Indicator */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-400"
                      : connectionStatus === "connecting"
                      ? "bg-yellow-400"
                      : connectionStatus === "error"
                      ? "bg-red-400"
                      : "bg-gray-400"
                  }`}
                  title={`WebSocket: ${connectionStatus}`}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                  }}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  title="Close sidebar (Ctrl+B)"
                >
                  <BsLayoutSidebarInsetReverse
                    size={16}
                    className="text-gray-400"
                  />
                </button>
              </div>
            </div>

            {/* New Chat Button */}
            <button
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20"
              onClick={(e) => handlePress(e, router)}
              title="New chat (Ctrl+Shift+O)"
            >
              <HiPlus size={14} className="text-gray-400" />
              <span className="text-xs text-gray-300">New chat</span>
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(titles).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <HiChatBubbleLeft
                  size={32}
                  className="mx-auto mb-2 opacity-50"
                />
                <p className="text-sm">No chats yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {Object.entries(titles).map(([id, title]) => (
                  <Link
                    href={`/chat/${id}`}
                    prefetch={true}
                    key={id}
                    className="flex flex-col gap-2"
                  >
                    <div
                      key={id}
                      id={id}
                      className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                        pathname === id
                          ? "bg-white/10 border border-white/20"
                          : "border border-transparent hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              pathname === id
                                ? "bg-blue-400"
                                : "bg-gray-600 group-hover:bg-gray-500"
                            }`}
                          />
                          {loadingSessions.includes(id) && (
                            <AiOutlineLoading3Quarters
                              size={12}
                              className="text-blue-400 animate-spin"
                              title="Chat loading in background"
                            />
                          )}
                        </div>
                        <span
                          className={`text-xs truncate flex-1 ${
                            pathname === id
                              ? "text-white text-xs"
                              : "text-gray-300 group-hover:text-gray-200"
                          }`}
                        >
                          {title}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="text-xs text-gray-500 text-center">
              {/* {tabs.length} chat{tabs.length !== 1 ? "s" : ""} */}
              {titles && Object.keys(titles).length} chat
              {titles && Object.keys(titles).length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button - only visible when sidebar is closed */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 hover:border-white/20 transition-all duration-200"
          onClick={() => setIsOpen(true)}
          title="Open sidebar (Ctrl+B)"
        >
          <BsLayoutSidebarInsetReverse size={14} className="text-gray-400" />
        </button>
      )}

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
