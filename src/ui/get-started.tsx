"use client";

import { addTabs } from "@/utils/indexedDB";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

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
      className="px-4 py-2 lg:py-2
        bg-text-primary text-background rounded-full
        hover:opacity-90 
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-center"
      onClick={(e) => handlePress(e, router, setLoading)}
    >
      <FaArrowRight size={14} />
    </button>
  );
}

export default GetStarted;
