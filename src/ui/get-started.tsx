"use client";

import { addTabs } from "@/utils/localStoraage";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

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
      className="w-26 lg:w-32 bg-lime-300 text-black rounded-lg py-2 active:scale-95 transition-transform duration-300 ease-in-out cursor-pointer hover:bg-lime-500 text-md lg:text-xl"
      onClick={(e) => handlePress(e, router)}
    >
      Get Started
    </button>
  );
}
export default GetStarted;
