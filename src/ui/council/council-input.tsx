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
  rounds: number;
  isRunning: boolean;
  onMemberModelsChange: (models: string[]) => void;
  onJudgeModelChange: (model: string) => void;
  onQuestionChange: (question: string) => void;
  onRoundsChange: (rounds: number) => void;
  onSubmit: () => void;
}

const CouncilInput = ({
  memberModels,
  judgeModel,
  question,
  rounds,
  isRunning,
  onMemberModelsChange,
  onJudgeModelChange,
  onQuestionChange,
  onRoundsChange,
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
    <div className="flex justify-center px-4 pb-4 pt-2">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-xl space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative" ref={memberRef}>
            <button
              type="button"
              onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
              className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-haspopup="listbox"
              aria-expanded={memberDropdownOpen}
            >
              <HiOutlineUserGroup size={11} />
              <span className="truncate max-w-[100px]">
                {memberModels.length} Member{memberModels.length !== 1 ? "s" : ""}
              </span>
              <IoIosArrowDown
                size={10}
                className={`transition-transform ${memberDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {memberDropdownOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-2 max-h-[260px] w-56 overflow-y-auto rounded-xl border border-border bg-surface shadow-xl">
                <div className="border-b border-border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted">
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
                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          isSelected
                            ? "bg-accent/10 text-accent"
                            : "text-text-secondary hover:bg-background hover:text-text-primary"
                        }`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? "border-accent bg-accent"
                              : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              viewBox="0 0 12 12"
                              className="h-2.5 w-2.5 fill-white"
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

          <span className="text-text-muted text-[9px] font-bold">×</span>

          <div className="relative" ref={judgeRef}>
            <button
              type="button"
              onClick={() => setJudgeDropdownOpen(!judgeDropdownOpen)}
              className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-haspopup="listbox"
              aria-expanded={judgeDropdownOpen}
            >
              <HiOutlineScale size={11} />
              <span className="truncate max-w-[120px]">{selectedJudgeName}</span>
              <IoIosArrowDown
                size={10}
                className={`transition-transform ${judgeDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {judgeDropdownOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-2 max-h-[260px] w-56 overflow-y-auto rounded-xl border border-border bg-surface shadow-xl">
                <div className="border-b border-border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted">
                  Judge model
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
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
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

          <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted">
              Rounds
            </span>
            <div className="flex items-center gap-px">
              <button
                type="button"
                onClick={() => onRoundsChange(Math.max(1, rounds - 1))}
                disabled={rounds <= 1 || isRunning}
                className="flex h-4 w-4 items-center justify-center rounded text-text-muted hover:bg-surface-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease rounds"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <span className="w-4 text-center text-[10px] font-semibold text-text-primary tabular-nums">
                {rounds}
              </span>
              <button
                type="button"
                onClick={() => onRoundsChange(Math.min(5, rounds + 1))}
                disabled={rounds >= 5 || isRunning}
                className="flex h-4 w-4 items-center justify-center rounded text-text-muted hover:bg-surface-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase rounds"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the council..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            disabled={isRunning}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!question.trim() || isRunning}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-background transition-colors hover:bg-accent-strong disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Submit to council"
          >
            <FaArrowCircleRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouncilInput;
