"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface HomepageContextType {
  text: string;
  setText: (text: string) => void;
}

const HomepageContext = createContext<HomepageContextType | undefined>(
  undefined
);

export function HomepageProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string>("");
  return (
    <HomepageContext.Provider value={{ text, setText }}>
      {children}
    </HomepageContext.Provider>
  );
}

export function useHomepage() {
  const context = useContext(HomepageContext);
  if (context === undefined) {
    throw new Error("useHomepage must be used within a HomepageProvider");
  }
  return context;
}
