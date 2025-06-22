"use client";

import "@/app/globals.css";

import { useEffect, useState } from "react";
import { FaHome, FaChevronRight, FaDumpster } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { retrieveChats, retrieveTabs } from "@/utils/indexedDB";

const Sidebar = () => {
  const [expand, setExpanded] = useState<boolean>(false);
  const [tabs, setTabs] = useState<string[]>([]);
  const [tabTitles, setTabTitles] = useState<Record<string, string>>({});
  const router = useRouter();

  const pathname = usePathname().split("/")[2];

  useEffect(() => {
    const func = async () => {
      const tabs = await retrieveTabs();
      setTabs(tabs);

      // Load titles for all tabs
      const titles: Record<string, string> = {};
      for (const tab of tabs) {
        const chats = await retrieveChats(tab);
        if (chats.length === 0) {
          titles[tab] = "New Chat";
        } else {
          const lastMessage = chats[chats.length - 1];
          titles[tab] =
            lastMessage.role === "user"
              ? lastMessage.content.slice(0, 24) +
                (lastMessage.content.length > 24 ? "..." : "")
              : lastMessage.content.slice(0, 24) + "...";
        }
      }
      setTabTitles(titles);
    };

    window.addEventListener("new-tab", func);
    func(); // Initial load
    return () => {
      window.removeEventListener("new-tab", func);
    };
  }, []);

  const getTitle = (id: string) => {
    return tabTitles[id] || "Loading...";
  };

  return (
    <div
      className={` select-none ${
        expand ? "w-72" : "w-16"
      } min-h-[calc(100dvh-15px)] rounded-xl transition-all duration-300 ease-in-out flex flex-col shadow-xl border border-white/10 bg-bg/10`}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div
        className={`p-4 flex items-center justify-between cursor-pointer group hover:bg-white/5 transition-colors rounded-t-xl`}
      >
        <p className="font-semibold  text-text ">
          {expand ? "Rapid Chat" : "RC"}
        </p>
        {expand && (
          <FaChevronRight
            className="text-gray-400 transition-transform duration-300 rotate-180 opacity-0 group-hover:opacity-100"
            size={14}
          />
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto mt-2 p-2  max-h-[calc(100vh-150px)] scrollbar-track-only">
        {expand &&
          tabs.map((tab, index) => (
            <div
              className="group relative hover:bg-white/10 bg-white/5 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg "
              key={tab}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push("/chat/" + tab);
              }}
            >
              {pathname === tab && (
                <div className="absolute -top-2 left-2 text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                  <p>Active</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
              <div className="flex flex-row items-center justify-between">
                <p className="px-2 py-1 line-clamp-1 text-sm text-gray-200 leading-10 text-center">
                  {expand ? getTitle(tab) : index + 1}
                </p>
              </div>
            </div>
          ))}
        {!expand && (
          <div className="flex justify-center items-center h-full">
            <span
              className="text-lg text-gray-400 font-semibold origin-center"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              Click here to see chats
            </span>
          </div>
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="flex justify-center py-4">
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
        >
          <FaHome
            size={20}
            className="text-gray-400 group-hover:text-gray-200 transition-colors"
          />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
