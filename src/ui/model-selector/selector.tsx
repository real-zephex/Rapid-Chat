"use client";

import { useModel } from "@/context/ModelContext";
import { useSidebar } from "@/context/SidebarContext";
import { ModelInfo } from "@/utils/model-list";
import { IoIosArrowDown } from "react-icons/io";
import { IoRefreshOutline } from "react-icons/io5";
import { useHotkeys } from "react-hotkeys-hook";
import { useEffect, useState } from "react";

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

  const [mod, setMod] = useState<ModelInfo[]>(models);
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
      <div className="w-full max-w-6xl mx-auto p-3 z-50 text-zinc-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {models.map((m) => {
            const isSelected =
              selectedModel === m.code || selectedModel === m.name;
            const typeStyles =
              m.type === "reasoning"
                ? "bg-violet-950/40 text-violet-300 ring-1 ring-violet-500/30"
                : m.type === "conversational"
                ? "bg-sky-950/40 text-sky-300 ring-1 ring-sky-500/30"
                : "bg-amber-950/40 text-amber-300 ring-1 ring-amber-500/30";

            return (
              <div
                key={m.code}
                className={`relative overflow-hidden rounded-xl border ${
                  isSelected
                    ? "border-sky-500 ring-2 ring-sky-500/50"
                    : "border-zinc-700"
                } bg-zinc-900 shadow-sm hover:shadow-md   cursor-pointer hover:-translate-y-1 transition-all`}
                onClick={() => {
                  changeModel(m.code);
                }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400/70 via-cyan-400/70 to-blue-400/70" />
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-100 truncate">
                          {m.name}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-900/30 text-sky-300 px-2 py-0.5 text-[10px] ring-1 ring-sky-500/30">
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
                      {/* <div className="text-xs text-zinc-400 truncate">
                        {m.code}
                      </div> */}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${typeStyles}`}
                    >
                      {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-zinc-300 line-clamp-3">
                    {m.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md ring-1 ${
                        m.image
                          ? "bg-emerald-900/30 text-emerald-300 ring-emerald-500/30"
                          : "bg-rose-900/30 text-rose-300 ring-rose-500/30"
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
                      {m.image ? "Image support" : "No image"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md ring-1 ${
                        m.pdf
                          ? "bg-emerald-900/30 text-emerald-300 ring-emerald-500/30"
                          : "bg-rose-900/30 text-rose-300 ring-rose-500/30"
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
                      {m.pdf ? "PDF support" : "No PDF"}
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
    <main
      className={`fixed top-0 ${!isOpen ? "left-10" : "left-0"} z-[9999] p-3`}
    >
      <div
        className={`flex-row items-center justify-between bg-sky-400 text-black p-0.5 rounded-md ${
          models.length === 0 ? "hidden" : "flex"
        }`}
        onClick={() => handleClick()}
      >
        <p className="ml-1">
          {models.find((e) => e.code === selectedModel)?.name}{" "}
        </p>
        <IoIosArrowDown />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-lg ">
          <div className="bg-neutral-800 rounded-lg shadow-lg w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Select a Model</h2>
              <section className="flex flex-row items-center gap-2">
                <button
                  className="bg-neutral-800"
                  title="Refresh models"
                  onClick={() => {
                    refreshModels();
                  }}
                >
                  <IoRefreshOutline size={16} />
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowModal(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
            <p className="p-2 rounded-xl text-center text-xs text-zinc-300 mt-2">
              Showing {current} ({mod.length} models)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 text-xs">
              {["conversational", "reasoning", "general"].map((item, idx) => (
                <button
                  key={idx}
                  className="bg-sky-800 py-1 px-2 cursor-pointer rounded-xl hover:bg-sky-900 transition-all"
                  onClick={() => {
                    setMod(() => {
                      return models.filter((m) => m.type === item);
                    });
                    setCurrent(item);
                  }}
                >
                  <code>{item}</code>
                </button>
              ))}
              <button
                onClick={() => {
                  setMod(models);
                  setCurrent("all");
                }}
                className="bg-emerald-700 py-1 px-2 cursor-pointer rounded-xl hover:bg-emerald-900 transition-all"
              >
                <code>All</code>
              </button>
            </div>
            <ModelCardGallery models={mod} />
          </div>
        </div>
      )}
    </main>
  );
};

export default ModelSelector;
