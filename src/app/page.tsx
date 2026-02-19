"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const Homepage = () => {
  const router = useRouter();

  useEffect(() => {
    const uuid = uuidv4();
    setTimeout(() => {
      router.push("/chat/" + uuid);
    }, 200);
  }, []);

  return (
    <main className="min-h-[calc(100dvh-8px)] flex items-center justify-center gap-3 bg-background rounded-xl border border-border">
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-text-muted border-t-text-primary"></div>
      <p className="text-text-secondary text-sm font-medium">Entering workspace...</p>
    </main>
  );
};

export default Homepage;
