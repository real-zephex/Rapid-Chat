"use client";

import { useSidebar } from "@/context/SidebarContext";
import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const { isOpen } = useSidebar();

  return (
    <div
      className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isOpen ? "md:ml-72" : "ml-0"
      }`}
    >
      {children}
    </div>
  );
}
