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
      className={`transition-all duration-75 ease-in-out ${
        isOpen ? "ml-64" : "ml-0"
      }`}
    >
      {children}
    </div>
  );
}
