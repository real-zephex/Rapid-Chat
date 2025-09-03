"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ToastContextType {
  message: string;
  type: "info" | "warning" | "error" | "success";
  showToast: boolean;
  fire: () => void;
  setMessage: (msg: string) => void;
  setType: (type: "info" | "warning" | "error" | "success") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<"info" | "warning" | "error" | "success">(
    "info"
  );
  const [showToast, setShowToast] = useState<boolean>(false);

  const fire = () => {
    console.log(`Toast fired: [${type}] ${message}`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <ToastContext.Provider
      value={{ message, type, showToast, fire, setMessage, setType }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
