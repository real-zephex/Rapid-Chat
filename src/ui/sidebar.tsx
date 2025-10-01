"use client";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { HiPlus, HiChatBubbleLeft } from "react-icons/hi2";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { v4 as uuidv4 } from "uuid";
import { useSidebar } from "@/context/SidebarContext";
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
        className={`fixed top-0 left-0 h-full bg-[#171717] transition-all duration-300 ease-in-out z-30 ${
          isOpen ? "w-64" : "w-0"
        } overflow-hidden border-r border-gray-800`}
        ref={sidebarRef}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Close sidebar (Ctrl+B)"
              >
                <BsLayoutSidebarInsetReverse
                  size={18}
                  className="text-gray-400"
                />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={(e) => handlePress(e, router)}
                title="New chat (Ctrl+Shift+O)"
              >
                <HiPlus size={18} className="text-gray-400" />
              </button>
            </div>
          </div>{" "}
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto px-2">
            {Object.entries(titles).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HiChatBubbleLeft
                  size={28}
                  className="mx-auto mb-3 opacity-30"
                />
                <p className="text-xs">No chats yet</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {Object.entries(titles).map(([id, title]) => (
                  <Link href={`/chat/${id}`} prefetch={true} key={id}>
                    <div
                      id={id}
                      className={`group px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                        pathname === id ? "bg-[#2f2f2f]" : "hover:bg-[#212121]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <HiChatBubbleLeft
                          size={16}
                          className={`flex-shrink-0 ${
                            pathname === id
                              ? "text-white"
                              : "text-gray-500 group-hover:text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm truncate flex-1 ${
                            pathname === id
                              ? "text-white"
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
          </div>{" "}
          {/* Footer */}
          <div className="p-3 border-t border-gray-800">
            <div className="text-[11px] text-gray-600 text-center">
              {titles && Object.keys(titles).length} conversation
              {titles && Object.keys(titles).length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
      {/* Toggle Button - only visible when sidebar is closed */}
      {!isOpen && (
        <button
          className="fixed top-3 left-3 z-40 p-2 rounded-lg bg-[#2f2f2f] hover:bg-[#3f3f3f] border border-gray-700/50 hover:border-gray-600 transition-all"
          onClick={() => setIsOpen(true)}
          title="Open sidebar (Ctrl+B)"
        >
          <BsLayoutSidebarInsetReverse size={16} className="text-gray-400" />
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
