"use client";

import { useModel } from "@/context/ModelContext";
import { IoIosArrowDown } from "react-icons/io";
import { useState, useRef, useEffect } from "react";

const ModelSelector = () => {
  const { selectedModel, models, changeModel } = useModel();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedModelInfo = models.find((e) => e.code === selectedModel);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center gap-2 bg-transparent hover:bg-[#3f3f3f] text-white px-3 py-2 rounded-xl border border-transparent hover:border-gray-600 cursor-pointer transition-all ${
          models.length === 0 ? "hidden" : "flex"
        }`}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium">
          {selectedModelInfo?.name || "Select Model"}
        </span>
        <IoIosArrowDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#2f2f2f] border border-gray-700/50 rounded-xl shadow-xl overflow-hidden z-50 max-h-[300px] overflow-y-auto">
          <div className="p-1 space-y-0.5">
            {models.map((model) => {
              const isSelected = selectedModel === model.code;
              return (
                <button
                  key={model.code}
                  onClick={() => {
                    changeModel(model.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-emerald-900/30 text-emerald-300"
                      : "text-gray-300 hover:bg-[#3f3f3f] hover:text-white"
                  }`}
                >
                  <span className="truncate mr-2">{model.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {model.image && (
                      <span title="Image support" className="flex items-center">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className={`h-3.5 w-3.5 ${
                            isSelected ? "fill-emerald-300" : "fill-gray-500"
                          }`}
                        >
                          <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a1 1 0 0 1-1.6.8l-4.8-3.6-2.4 1.8a1 1 0 0 1-1.2 0L6 14.5l-2 1.5V5Zm14 0H6v8.1l2.8-2.1a1 1 0 0 1 1.2 0l2.4 1.8 3.6-2.7a1 1 0 0 1 1.6.8V5Z" />
                        </svg>
                      </span>
                    )}
                    {model.pdf && (
                      <span title="PDF support" className="flex items-center">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className={`h-3.5 w-3.5 ${
                            isSelected ? "fill-emerald-300" : "fill-gray-500"
                          }`}
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2.5L19.5 10H14V4.5ZM8 13h2.5a1.5 1.5 0 0 0 0-3H8v3Zm0 2H7v3h1v-1h1.5a1.5 1.5 0 1 0 0-3H8Zm5 0h-1v3h1v-1h1a1 1 0 1 0 0-2h-1Zm-3.5-3H10a.5.5 0 0 0 0-1h-.5v1Zm0 5H11a.5.5 0 1 1 0 1h-1.5v-1Zm5-2h1a.5.5 0 0 1 0 1h-1v-1Z" />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
