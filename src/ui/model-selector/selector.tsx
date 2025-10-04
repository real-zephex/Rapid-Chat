"use client";

import { useModel } from "@/context/ModelContext";
import { useSidebar } from "@/context/SidebarContext";
import { ModelInfo } from "@/utils/model-list";
import { IoIosArrowDown } from "react-icons/io";
import { IoRefreshOutline } from "react-icons/io5";
import { useHotkeys } from "react-hotkeys-hook";
import { useState } from "react";

const ModelSelector = () => {
  const {
    selectedModel,
    models,
    changeModel,
    showModal,
    setShowModal,
    refreshModels,
  } = useModel();
  const { isOpen } = useSidebar();

  const [current, setCurrent] = useState<string>("all");

  function handleClick() {
    setShowModal(true);
  }

  useHotkeys("ctrl+k", (e) => {
    e.preventDefault();
    setShowModal(!showModal);
  });

  useHotkeys("esc", (e) => {
    e.preventDefault();
    if (showModal) {
      setShowModal(false);
    }
  });

  const ModelCardGallery = ({ models }: { models: ModelInfo[] }) => {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 z-50 text-zinc-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {models.map((m) => {
            const isSelected =
              selectedModel === m.code || selectedModel === m.name;
            const typeStyles =
              m.type === "reasoning"
                ? "bg-violet-900/30 text-violet-300 ring-1 ring-violet-500/40"
                : m.type === "conversational"
                ? "bg-sky-900/30 text-sky-300 ring-1 ring-sky-500/40"
                : "bg-amber-900/30 text-amber-300 ring-1 ring-amber-500/40";

            return (
              <div
                key={m.code}
                className={`relative overflow-hidden rounded-xl border ${
                  isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/50 bg-[#3f3f3f]"
                    : "border-gray-700 bg-[#1a1a1a] hover:bg-[#252525]"
                } shadow-sm hover:shadow-lg cursor-pointer hover:-translate-y-0.5 transition-all`}
                onClick={() => {
                  changeModel(m.code);
                }}
              >
                {isSelected && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400" />
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">
                          {m.name}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 text-emerald-300 px-2 py-0.5 text-[10px] ring-1 ring-emerald-500/40">
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 20 20"
                              className="h-3 w-3 fill-current"
                            >
                              <path d="M7.629 14.314a1 1 0 01-1.415 0l-3.536-3.536a1 1 0 111.415-1.415l2.828 2.829 8.486-8.486a1 1 0 111.415 1.414L7.63 14.314z" />
                            </svg>
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${typeStyles}`}
                    >
                      {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-gray-400 line-clamp-3">
                    {m.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md ring-1 ${
                        m.image
                          ? "bg-emerald-900/30 text-emerald-300 ring-emerald-500/30"
                          : "bg-gray-800/50 text-gray-500 ring-gray-700/30"
                      }`}
                      title={
                        m.image
                          ? "This model supports images"
                          : "This model does not support images"
                      }
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 fill-current"
                      >
                        <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a1 1 0 0 1-1.6.8l-4.8-3.6-2.4 1.8a1 1 0 0 1-1.2 0L6 14.5l-2 1.5V5Zm14 0H6v8.1l2.8-2.1a1 1 0 0 1 1.2 0l2.4 1.8 3.6-2.7a1 1 0 0 1 1.6.8V5Z" />
                      </svg>
                      {m.image ? "Image" : "No image"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md ring-1 ${
                        m.pdf
                          ? "bg-emerald-900/30 text-emerald-300 ring-emerald-500/30"
                          : "bg-gray-800/50 text-gray-500 ring-gray-700/30"
                      }`}
                      title={
                        m.pdf
                          ? "This model supports PDFs"
                          : "This model does not support PDFs"
                      }
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 fill-current"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2.5L19.5 10H14V4.5ZM8 13h2.5a1.5 1.5 0 0 0 0-3H8v3Zm0 2H7v3h1v-1h1.5a1.5 1.5 0 1 0 0-3H8Zm5 0h-1v3h1v-1h1a1 1 0 1 0 0-2h-1Zm-3.5-3H10a.5.5 0 0 0 0-1h-.5v1Zm0 5H11a.5.5 0 1 1 0 1h-1.5v-1Zm5-2h1a.5.5 0 0 1 0 1h-1v-1Z" />
                      </svg>
                      {m.pdf ? "PDF" : "No PDF"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className={`fixed top-2 ${!isOpen ? "left-12" : "left-3"} z-[9999]`}>
      <div
        className={`flex-row items-center justify-between gap-2 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white px-3 py-2 rounded-xl border border-gray-700/50 hover:border-gray-600 cursor-pointer transition-all ${
          models.length === 0 ? "hidden" : "flex"
        }`}
        onClick={() => handleClick()}
      >
        <p className="text-xs font-medium">
          {models.find((e) => e.code === selectedModel)?.name}{" "}
        </p>
        <IoIosArrowDown size={16} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#2f2f2f] rounded-2xl shadow-2xl w-11/12 max-w-5xl max-h-[85vh] overflow-y-auto border border-gray-700/50">
            <div className="flex justify-between items-center p-5 border-b border-gray-700/50 sticky top-0 bg-[#2f2f2f] z-10">
              <h2 className="text-xl font-semibold text-white">
                Select a Model
              </h2>
              <section className="flex flex-row items-center gap-3">
                <button
                  className="p-2 rounded-lg hover:bg-[#3f3f3f] transition-colors text-gray-400 hover:text-white"
                  title="Refresh models"
                  onClick={() => {
                    refreshModels();
                  }}
                >
                  <IoRefreshOutline size={20} />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-[#3f3f3f] transition-colors text-gray-400 hover:text-white"
                  onClick={() => setShowModal(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </section>
            </div>
            <p className="p-3 text-center text-sm text-gray-400">
              Showing {current} (
              {models.filter((m) => m.type === current).length} models)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4">
              {["conversational", "reasoning", "general", "all"].map(
                (item, idx) => (
                  <button
                    key={idx}
                    className={`${
                      current === item ? "bg-emerald-600" : "bg-[#3f3f3f]"
                    } ${
                      current === item ? "bg-emerald-800" : "hover:bg-[#4f4f4f]"
                    } py-2 px-3 rounded-lg transition-all text-sm font-medium text-gray-300 hover:text-white border border-gray-700/30 hover:border-gray-600 `}
                    onClick={() => {
                      setCurrent(item);
                    }}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
            <ModelCardGallery
              models={
                current === "all"
                  ? models
                  : models.filter((m) => m.type === current)
              }
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default ModelSelector;
