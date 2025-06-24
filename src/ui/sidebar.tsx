"use client";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";

import { useEffect, useState } from "react";
import { retrieveTabs } from "@/utils/indexedDB";
import { usePathname, useRouter } from "next/navigation";
import { FaMapPin } from "react-icons/fa";
import { useHotkeys } from "react-hotkeys-hook";
import { handlePress } from "./get-started";

const Sidebar = () => {
  const [expand, setExpanded] = useState<boolean>(false);
  const [tabs, setTabs] = useState<string[]>([]);

  const router = useRouter();
  const pathname = usePathname().split("/")[2];

  useEffect(() => {
    const fetchTabs = async () => {
      const tabs = await retrieveTabs();
      setTabs(tabs);
    };

    fetchTabs();
    window.addEventListener("new-tab", fetchTabs);

    return () => {
      window.removeEventListener("new-tab", fetchTabs);
    };
  }, [tabs]);

  useHotkeys(
    "ctrl+k",
    (e) => {
      e.preventDefault();
      setExpanded((prev) => !prev);
    },
    [expand]
  );

  return (
    <div className="fixed top-0 left-0 m-4 z-20 ">
      <button
        onClick={(e) => {
          e.preventDefault();
          setExpanded((prev) => !prev);
        }}
      >
        <BsLayoutSidebarInsetReverse
          size={18}
          className={`${
            expand ? "rotate-180" : "rotate-0"
          } transition-all duration-300 ease-in-out`}
        />
      </button>

      {expand && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-white/10 bg-bg/10 p-4 rounded-xl shadow-xl backdrop-blur-xl max-w-3xl w-full flex flex-col gap-2">
          <h2 className="text-lg ">Rapid Chat</h2>
          <hr />
          <button
            className="p-2 rounded hover:bg-bg/30 transition-colors flex flex-row justify-center items-center cursor-pointer relative border border-white/10"
            onClick={(e) => handlePress(e, router)}
          >
            + New Chat
          </button>
          <div className="flex flex-col gap-2  p-2 max-h-80  overflow-y-auto">
            {tabs.map((tab) => (
              <div
                key={tab}
                className="p-2 rounded hover:bg-bg/30 transition-colors flex flex-row justify-between items-center cursor-pointer relative border border-white/10"
                onClick={() => {
                  router.push(`/chat/${tab}`);
                  // setExpanded(false);
                }}
              >
                {pathname === tab && (
                  <div className="absolute -top-4 -left-2 m-2">
                    <FaMapPin size={18} className="text-text" />
                  </div>
                )}
                {tab}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Sidebar;
