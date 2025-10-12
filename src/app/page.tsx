"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const Homepage = () => {
  const router = useRouter();
  const uuid = uuidv4();

  useEffect(() => {
    setTimeout(() => {
      router.push("/chat/" + uuid);
    }, 200);
  }, []);

  return (
    <main className="min-h-[calc(100dvh-8px)] flex items-center justify-center gap-2 bg-neutral-900 rounded-xl">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
      <p>Loading content, please wait...</p>
    </main>
  );
};

export default Homepage;
