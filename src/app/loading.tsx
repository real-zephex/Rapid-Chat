"use client";

import { useEffect, useState } from "react";
import { FaRobot, FaBrain, FaCode, FaRocket } from "react-icons/fa6";

export default function Loading() {
  const [dots, setDots] = useState(1);
  const [iconIndex, setIconIndex] = useState(0);

  const icons = [
    { icon: <FaRobot className="text-blue-400" />, label: "Initializing AI" },
    { icon: <FaBrain className="text-purple-400" />, label: "Loading Models" },
    {
      icon: <FaCode className="text-green-400" />,
      label: "Compiling Thoughts",
    },
    {
      icon: <FaRocket className="text-orange-400" />,
      label: "Preparing Launch",
    },
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 300);

    const iconInterval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 1500);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(iconInterval);
    };
  }, [icons.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-900 to-black text-white p-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4 transition-all duration-300 ease-in-out">
            {icons[iconIndex].icon}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {icons[iconIndex].label}
            <span className="inline-block animate-pulse">
              {".".repeat(dots)}
            </span>
          </h1>
        </div>

        <div className="w-24 h-24 mx-auto mb-8 relative">
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div
            className="absolute inset-2 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"
            style={{ animationDelay: "-0.5s" }}
          ></div>
          <div
            className="absolute inset-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"
            style={{ animationDelay: "-1s" }}
          ></div>
          <div
            className="absolute inset-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
            style={{ animationDelay: "-1.5s" }}
          ></div>
        </div>

        <div className="max-w-md mx-auto">
          <p className="text-gray-300 mb-4">
            Rapid Chat is loading your intelligent conversation interface...
          </p>
          <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Connecting to AI providers</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <span>Loading conversation history</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <span>Preparing intelligent tools</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></span>
            Powered by Next.js 15 & React 19
          </p>
        </div>
      </div>
    </div>
  );
}
