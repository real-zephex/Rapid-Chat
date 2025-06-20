"use client";

import { useEffect, useState } from "react";
import { FaHome, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { retrieveChats, retrieveTabs } from "@/utils/localStoraage";

const Sidebar = () => {
  const [expand, setExpanded] = useState<boolean>(false);
  const [tabs, setTabs] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const func = () => {
      const tabs = retrieveTabs();
      setTabs(tabs);
    };

    window.addEventListener("new-tab", func);
    func(); // Initial load
    return () => {
      window.removeEventListener("new-tab", func);
    };
  }, []);

  const getTitle = (id: string) => {
    const chats = retrieveChats(id);
    if (chats.length === 0) return "New Chat";
    const lastMessage = chats[chats.length - 1];
    return lastMessage.role === "user"
      ? lastMessage.content
      : lastMessage.content.slice(0, 24) + "...";
  };

  return (
    <div
      className={`backdrop-blur-md select-none ${
        expand ? "w-72" : "w-16"
      } min-h-[calc(100dvh-15px)] rounded-xl transition-all duration-300 ease-in-out flex flex-col shadow-xl border border-white/10 bg-black/70`}
    >
      <div
        className={`p-4 flex items-center justify-between cursor-pointer group hover:bg-white/5 transition-colors rounded-t-xl `}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <p className="font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto mt-2 p-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {tabs.map((tab) => (
          <div
            className="group relative hover:bg-white/10 bg-white/5 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg"
            key={tab}
            onClick={() => router.push("/chat/" + tab)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
            <p className="p-3 line-clamp-1 text-sm text-gray-200">
              {expand ? getTitle(tab) : getTitle(tab).slice(0, 2)}
            </p>
          </div>
        ))}
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
