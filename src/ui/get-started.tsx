"use client";

import { addTabs } from "@/utils/localStoraage";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { FaArrowRight } from "react-icons/fa6";

export function handlePress(
  event: React.MouseEvent<HTMLButtonElement>,
  router: AppRouterInstance
) {
  event.preventDefault();

  const uuid = uuidv4();
  addTabs(uuid);
  router.push("/chat/" + uuid);
}

function GetStarted() {
  const router = useRouter();

  return (
    <button
      className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 
        bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500
        text-black font-medium rounded-xl
        transform hover:scale-105 active:scale-95
        transition-all duration-200 ease-out
        shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_25px_rgba(45,212,191,0.5)]
        overflow-hidden"
      onClick={(e) => handlePress(e, router)}
    >
      <span className="relative z-10 text-lg">Get Started</span>
      <FaArrowRight className="relative z-10 text-lg transition-transform duration-200 group-hover:translate-x-1" />
      <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors duration-200" />
    </button>
  );
}

export default GetStarted;
