"use client";

import { useModel } from "@/context/ModelContext";
import { useEffect, useRef, useState } from "react";
import { FaArrowCircleRight } from "react-icons/fa";
import { HiOutlineScale, HiOutlineUserGroup } from "react-icons/hi2";
import { IoIosArrowDown } from "react-icons/io";

interface CouncilInputProps {
  memberModels: string[];
  judgeModel: string;
  question: string;
  isRunning: boolean;
  onMemberModelsChange: (models: string[]) => void;
  onJudgeModelChange: (model: string) => void;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
}

const CouncilInput = ({
  memberModels,
  judgeModel,
  question,
  isRunning,
  onMemberModelsChange,
  onJudgeModelChange,
  onQuestionChange,
  onSubmit,
}: CouncilInputProps) => {
  const { models } = useModel();
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [judgeDropdownOpen, setJudgeDropdownOpen] = useState(false);
  const memberRef = useRef<HTMLDivElement>(null);
  const judgeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        memberRef.current &&
        !memberRef.current.contains(event.target as Node)
      ) {
        setMemberDropdownOpen(false);
      }
      if (
        judgeRef.current &&
        !judgeRef.current.contains(event.target as Node)
      ) {
        setJudgeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (models.length > 0 && memberModels.length === 0) {
      const defaults = models.slice(0, 3).map((m) => m.code);
      onMemberModelsChange(defaults);
      if (!judgeModel) {
        onJudgeModelChange(models[0].code);
      }
    }
  }, [models]);

  const toggleMember = (code: string) => {
    if (memberModels.includes(code)) {
      if (memberModels.length > 2) {
        onMemberModelsChange(memberModels.filter((c) => c !== code));
      }
    } else {
      if (memberModels.length < 5) {
        onMemberModelsChange([...memberModels, code]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (question.trim() && !isRunning) {
        onSubmit();
      }
    }
  };

  const selectedMemberNames = memberModels
    .map((code) => models.find((m) => m.code === code)?.name || code)
    .join(", ");

  const selectedJudgeName =
    models.find((m) => m.code === judgeModel)?.name || judgeModel;

  if (models.length === 0) return null;

  return (
    <div className="border-t border-border bg-surface px-4 py-4">
      <div className="mx-auto max-w-5xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={memberRef}>
            <button
              type="button"
              onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-haspopup="listbox"
              aria-expanded={memberDropdownOpen}
            >
              <HiOutlineUserGroup size={13} />
              <span className="max-w-[200px] truncate">
                {memberModels.length} Members
              </span>
              <IoIosArrowDown
                size={12}
                className={`transition-transform ${memberDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {memberDropdownOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-2 max-h-[280px] w-64 overflow-y-auto rounded-xl border border-border bg-surface shadow-xl">
                <div className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  Select 2-5 models
                </div>
                <div className="space-y-0.5 p-1">
                  {models.map((model) => {
                    const isSelected = memberModels.includes(model.code);
                    return (
                      <button
                        key={model.code}
                        type="button"
                        onClick={() => toggleMember(model.code)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isSelected
                            ? "bg-accent/10 text-accent"
                            : "text-text-secondary hover:bg-background hover:text-text-primary"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? "border-accent bg-accent"
                              : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              viewBox="0 0 12 12"
                              className="h-3 w-3 fill-white"
                            >
                              <path d="M10.28 2.28L4.5 8.06 1.72 5.28a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l6.5-6.5a.75.75 0 0 0-1.06-1.06z" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">{model.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <span className="text-text-muted text-xs">vs</span>

          <div className="relative" ref={judgeRef}>
            <button
              type="button"
              onClick={() => setJudgeDropdownOpen(!judgeDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-haspopup="listbox"
              aria-expanded={judgeDropdownOpen}
            >
              <HiOutlineScale size={13} />
              <span className="max-w-[200px] truncate">
                Judge: {selectedJudgeName}
              </span>
              <IoIosArrowDown
                size={12}
                className={`transition-transform ${judgeDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {judgeDropdownOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-2 max-h-[280px] w-64 overflow-y-auto rounded-xl border border-border bg-surface shadow-xl">
                <div className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  Select judge model
                </div>
                <div className="space-y-0.5 p-1">
                  {models.map((model) => {
                    const isSelected = judgeModel === model.code;
                    return (
                      <button
                        key={model.code}
                        type="button"
                        onClick={() => {
                          onJudgeModelChange(model.code);
                          setJudgeDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                          isSelected
                            ? "bg-accent text-background"
                            : "text-text-secondary hover:bg-background hover:text-text-primary"
                        }`}
                      >
                        <span className="truncate">{model.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the council a question..."
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            disabled={isRunning}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!question.trim() || isRunning}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-background transition-colors hover:bg-accent-strong disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Submit to council"
          >
            <FaArrowCircleRight size={16} />
          </button>
        </div>

        {selectedMemberNames && (
          <p className="text-[10px] text-text-muted uppercase tracking-[0.1em]">
            Council: {selectedMemberNames}
          </p>
        )}
      </div>
    </div>
  );
};

export default CouncilInput;
