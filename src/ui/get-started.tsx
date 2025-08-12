"use client";

import { addTabs } from "@/utils/indexedDB";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

export async function handlePress(
  event: React.MouseEvent<HTMLButtonElement>,
  router: AppRouterInstance,
  setLoading: (loading: boolean) => void
) {
  event.preventDefault();
  setLoading(true);

  const uuid = uuidv4();
  await addTabs(uuid);
  window.dispatchEvent(new Event("new-tab"));
  router.push("/chat/" + uuid);
}

function GetStarted() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <button
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 
        bg-white text-black font-light text-lg rounded-full
        hover:bg-gray-100 hover:scale-105
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      onClick={(e) => handlePress(e, router, setLoading)}
    >
      <span className="hidden lg:block">
        {loading ? "Loading..." : "Get Started"}
      </span>
      <span className="text-xl">→</span>
    </button>
  );
}

export default GetStarted;
