"use client";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addTabs, retrieveChats, retrieveTabs } from "@/utils/indexedDB";
import { usePathname, useRouter } from "next/navigation";
import { FaMapPin } from "react-icons/fa";
import { useHotkeys } from "react-hotkeys-hook";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { v4 as uuidv4 } from "uuid";

export async function handlePress(
  event: React.MouseEvent<HTMLButtonElement> | KeyboardEvent,
  router: AppRouterInstance
) {
  event.preventDefault();

  const uuid = uuidv4();
  await addTabs(uuid);
  window.dispatchEvent(new Event("new-tab"));
  router.push("/chat/" + uuid);
}

const Sidebar = () => {
  const [expand, setExpanded] = useState<boolean>(false);
  const [tabs, setTabs] = useState<string[]>([]);
  const [tabTitles, setTabTitles] = useState<Record<string, string>>({});

  const router = useRouter();
  const pathname = usePathname().split("/")[2];

  const getTitle = (id: string) => {
    return tabTitles[id] || "Loading...";
  };

  useHotkeys("ctrl+shift+o", (e) => {
    e.preventDefault();
    handlePress(e, router);
  });

  useEffect(() => {
    const fetchTabs = async () => {
      const tabs = await retrieveTabs();
      setTabs(tabs);

      const titles: Record<string, string> = {};
      for (const tab of tabs) {
        const chats = await retrieveChats(tab);
        if (chats.length === 0) {
          titles[tab] = "New Chat";
        } else {
          const lastMessage = chats[chats.length - 1];
          titles[tab] =
            lastMessage.role === "user"
              ? lastMessage.content.slice(0, 80) +
                (lastMessage.content.length > 80 ? "..." : "")
              : lastMessage.content.slice(0, 80) + "...";
        }
      }
      setTabTitles(titles);
    };

    fetchTabs();
    window.addEventListener("new-tab", fetchTabs);

    return () => {
      window.removeEventListener("new-tab", fetchTabs);
    };
  }, []);

  useHotkeys(
    "ctrl+k",
    (e) => {
      e.preventDefault();
      setExpanded((prev) => !prev);
    },
    [expand]
  );

  useHotkeys(
    "esc",
    () => {
      setExpanded(false);
    },
    [expand]
  );

  return (
    <div className="fixed top-0 left-0 m-4 z-20">
      <button
        className="group p-3 rounded-xl bg-bg/20 hover:bg-bg/50 border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/10"
        onClick={(e) => {
          e.preventDefault();
          setExpanded((prev) => !prev);
        }}
        title="Toggle Command Center (Ctrl+K)"
      >
        <BsLayoutSidebarInsetReverse
          size={18}
          className={`${
            expand ? "rotate-180" : "rotate-0"
          } transition-all duration-300 ease-in-out text-gray-300 group-hover:text-white`}
        />
      </button>

      {expand && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-white/20 bg-bg/20 p-6 rounded-2xl shadow-2xl backdrop-blur-2xl max-w-4xl w-full flex flex-col gap-4 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Rapid Chat
              </h2>
            </div>
            <div className="text-xs text-gray-400 font-mono">Ctrl+K</div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <button
            className="group p-4 rounded-xl hover:bg-white/10 transition-all duration-300 flex flex-row justify-center items-center cursor-pointer relative border border-white/10 hover:border-white/20 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            onClick={(e) => handlePress(e, router)}
          >
            <span className="text-sm font-medium group-hover:text-white transition-colors">
              ✨ New Chat
            </span>
          </button>

          <div className="flex flex-col gap-2 p-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {tabs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-2xl mb-2">💬</div>
                <p className="text-sm">
                  No chats yet. Start a new conversation!
                </p>
              </div>
            ) : (
              tabs.map((tab, index) => (
                <div
                  key={tab}
                  className={`group p-3 rounded-xl hover:bg-white/10 transition-all duration-300 flex flex-row justify-between items-center cursor-pointer relative border hover:border-white/20 hover:shadow-md hover:scale-[1.01] ${
                    pathname === tab
                      ? "border-blue-400/50 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                      : "border-white/10"
                  }`}
                  onClick={() => {
                    router.push(`/chat/${tab}`);
                    setExpanded(false);
                  }}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {pathname === tab ? (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-gray-400 transition-colors flex-shrink-0"></div>
                    )}
                    <span
                      className={`text-sm font-medium truncate ${
                        pathname === tab
                          ? "text-blue-200"
                          : "text-gray-300 group-hover:text-white line-clamp-1"
                      } transition-colors`}
                    >
                      {getTitle(tab) || `Chat ${index + 1}`}
                    </span>
                  </div>

                  {pathname === tab && (
                    <div className="flex-shrink-0 ml-2">
                      <FaMapPin size={14} className="text-blue-400" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
            <div className="text-xs text-gray-500">
              {tabs.length} chat{tabs.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Sidebar;
