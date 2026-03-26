"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const Homepage = () => {
  const router = useRouter();

  useEffect(() => {
    const uuid = uuidv4();
    const timer = setTimeout(() => {
      router.push("/chat/" + uuid);
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm" role="status" aria-live="polite">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
          <p className="text-sm font-medium text-text-secondary">Entering workspace...</p>
        </div>
      </div>
    </main>
  );
};

export default Homepage;
