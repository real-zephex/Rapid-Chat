"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";

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

  // Track the auto-hide timer so we can clear it before starting a new one
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = () => {
    console.log(`Toast fired: [${type}] ${message}`);

    // Clear any existing timer before starting a new one
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    setShowToast(true);

    // Start a new timer and store its id
    hideTimerRef.current = setTimeout(() => {
      setShowToast(false);
      hideTimerRef.current = null;
    }, 3000);
  };

  // Cleanup on unmount to prevent leaked timers or premature hides
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
