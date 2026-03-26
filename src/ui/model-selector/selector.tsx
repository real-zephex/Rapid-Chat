"use client";

import { useModel } from "@/context/ModelContext";
import { IoIosArrowDown } from "react-icons/io";
import { useState, useRef, useEffect } from "react";

interface ModelSelectorProps {
  selectedModel?: string;
  onChangeModel?: (modelCode: string) => void;
}

const ModelSelector = ({
  selectedModel: selectedModelProp,
  onChangeModel,
}: ModelSelectorProps) => {
  const { selectedModel: contextSelectedModel, models, changeModel } = useModel();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = selectedModelProp ?? contextSelectedModel;
  const changeModelHandler = onChangeModel ?? changeModel;

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

  if (models.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-text-primary transition-colors hover:bg-surface-hover"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select model"
      >
        <span className="max-w-[180px] truncate text-sm font-medium">
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
        <div
          className="absolute bottom-full left-0 z-50 mb-2 max-h-[320px] w-64 overflow-y-auto rounded-xl border border-border bg-surface shadow-xl"
          role="listbox"
        >
          <div className="space-y-0.5 p-1">
            {models.map((model) => {
              const isSelected = selectedModel === model.code;
              return (
                <button
                  key={model.code}
                  type="button"
                  onClick={() => {
                    changeModelHandler(model.code);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:bg-background hover:text-text-primary"
                  }`}
                >
                  <span className="truncate text-sm mr-2">{model.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {model.image && (
                      <span title="Image support" className="flex items-center">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className={`h-3.5 w-3.5 ${
                            isSelected ? "fill-white" : "fill-text-muted"
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
                            isSelected ? "fill-white" : "fill-text-muted"
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
