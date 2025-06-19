"use client";

import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// import { Router, useRouter } from "next/router";
function GetStarted() {
  const router = useRouter();

  function handlePress(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const uuid = uuidv4();
    router.push("/chat/" + uuid);
  }

  return (
    <button
      className="w-26 lg:w-32 bg-lime-300 text-black rounded-lg py-2 active:scale-95 transition-transform duration-300 ease-in-out cursor-pointer hover:bg-lime-500 text-md lg:text-xl"
      onClick={handlePress}
    >
      Get Started
    </button>
  );
}
export default GetStarted;
