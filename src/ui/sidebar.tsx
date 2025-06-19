"use client";

import { use, useEffect, useState } from "react";
import { FaHome } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { retrieveChats, retrieveTabs } from "@/utils/localStoraage";
import { getImageEtag } from "next/dist/server/image-optimizer";

const Sidebar = () => {
  const [expand, setExpanded] = useState<boolean>(false);
  const [tabs, setTabs] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const tabs = retrieveTabs();
    setTabs(tabs);
  }, []);

  const getTitle = (id: string) => {
    const chats = retrieveChats(id);
    if (chats.length === 0) return "New Chat";
    const lastMessage = chats[chats.length - 1];
    return lastMessage.role === "user"
      ? lastMessage.content
      : lastMessage.content.slice(0, 20) + "...";
  };

  return (
    <div
      className={`bg-black/90 select-none ${
        expand ? "w-72" : "w-16"
      } min-h-[calc(100dvh-15px)] rounded-xl transition-width duration-300 ease-in-out flex flex-col`}
    >
      <p
        className="p-4 text-center font-semibold"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expand ? "Fast Chat" : "FC"}
      </p>
      <hr />
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto mt-1 p-2">
        {tabs.map((tab) => (
          <p
            className=" hover:bg-gray-700 bg-neutral-800 rounded-lg cursor-pointer line-clamp-1 p-1"
            key={tab}
            onClick={() => router.push("/chat/" + tab)}
          >
            {getTitle(tab)}
          </p>
        ))}
      </div>
      <div className="flex justify-center pb-4">
        <FaHome
          size={22}
          onClick={() => {
            router.push("/");
          }}
        />
      </div>
    </div>
  );
};

export default Sidebar;
