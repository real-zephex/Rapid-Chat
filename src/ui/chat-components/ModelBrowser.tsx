"use client";

import { useState, useRef, useEffect } from "react";
import { ModelInfo } from "@/utils/model-list";
import { FaChevronDown, FaChevronUp, FaImage, FaFilePdf } from "react-icons/fa";
import { MdOutlineImage, MdOutlinePictureAsPdf } from "react-icons/md";

interface ModelBrowserProps {
  models: ModelInfo[];
  selectedModel: string;
  onModelChange: (modelCode: string) => void;
  disabled?: boolean;
}

const ModelBrowser = ({
  models,
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelBrowserProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModelInfo = models.find((m) => m.code === selectedModel);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const groupedModels = {
    conversational: models
      .filter((m) => m.type === "conversational")
      .sort((a, b) => a.name.localeCompare(b.name)),
    general: models
      .filter((m) => m.type === "general")
      .sort((a, b) => a.name.localeCompare(b.name)),
    reasoning: models
      .filter((m) => m.type === "reasoning")
      .sort((a, b) => a.name.localeCompare(b.name)),
  };

  const handleModelSelect = (modelCode: string) => {
    onModelChange(modelCode);
    setIsOpen(false);
  };

  const SupportIcon = ({ type, supported }: { type: "image" | "pdf"; supported: boolean }) => {
    const Icon = type === "image" ? MdOutlineImage : MdOutlinePictureAsPdf;
    return (
      <Icon
        size={14}
        className={`${
          supported ? "text-green-400" : "text-gray-500"
        } transition-colors duration-200`}
        title={`${type === "image" ? "Image" : "PDF"} support: ${
          supported ? "Yes" : "No"
        }`}
      />
    );
  };

  const ModelItem = ({ model }: { model: ModelInfo }) => (
    <div
      onClick={() => handleModelSelect(model.code)}
      className={`px-3 py-2 cursor-pointer hover:bg-neutral-700 transition-colors duration-200 flex items-center justify-between group ${
        selectedModel === model.code ? "bg-cyan-600/20 border-l-2 border-cyan-500" : ""
      }`}
    >
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-sm font-medium text-white truncate">{model.name}</span>
        <div className="flex items-center gap-2">
          <SupportIcon type="image" supported={model.image} />
          <SupportIcon type="pdf" supported={model.pdf} />
        </div>
      </div>
      {selectedModel === model.code && (
        <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0"></div>
      )}
    </div>
  );

  const GroupHeader = ({ label }: { label: string }) => (
    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-neutral-800/50 border-b border-neutral-700/50">
      {label}
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Model Display */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`text-white rounded-lg px-3 py-2 outline-none max-w-sm w-full text-xs bg-neutral-800/90 border border-neutral-700 transition-all duration-200 shadow-md flex items-center justify-between gap-2 ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-neutral-700 focus:ring-2 focus:ring-cyan-500"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="truncate font-medium">
            {selectedModelInfo?.name || "Select Model"}
          </span>
          {selectedModelInfo && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <SupportIcon type="image" supported={selectedModelInfo.image} />
              <SupportIcon type="pdf" supported={selectedModelInfo.pdf} />
            </div>
          )}
        </div>
        {!disabled && (
          <div className="flex-shrink-0">
            {isOpen ? (
              <FaChevronUp size={10} className="text-gray-400" />
            ) : (
              <FaChevronDown size={10} className="text-gray-400" />
            )}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800/95 border border-neutral-700 rounded-lg shadow-lg backdrop-blur-sm z-50 max-h-80 overflow-y-auto">
          {Object.entries(groupedModels).map(([groupKey, groupModels]) => {
            if (groupModels.length === 0) return null;
            return (
              <div key={groupKey}>
                <GroupHeader
                  label={
                    groupKey.charAt(0).toUpperCase() + groupKey.slice(1)
                  }
                />
                {groupModels.map((model) => (
                  <ModelItem key={model.code} model={model} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModelBrowser;