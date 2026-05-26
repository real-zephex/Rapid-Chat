"use client";

import { useSmoothStream } from "@/hooks/useSmoothStream";
import { memo, useCallback, useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import { GoCpu } from "react-icons/go";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { councilMarkdownComponents } from "./council-markdown";

interface CouncilTurnMessageProps {
  modelCode: string;
  modelName: string;
  round: number;
  totalRounds: number;
  content: string;
  status: "waiting" | "streaming" | "done" | "error";
  errorMessage?: string;
}

const MODEL_COLORS: Record<string, string> = {};

function getModelColor(code: string): string {
  if (!MODEL_COLORS[code]) {
    const colors = [
      "bg-[#06d6a0]",
      "bg-[#4d9eff]",
      "bg-[#ffd166]",
      "bg-[#ff6b6b]",
      "bg-[#c084fc]",
    ];
    MODEL_COLORS[code] = colors[Object.keys(MODEL_COLORS).length % colors.length];
  }
  return MODEL_COLORS[code];
}

const CouncilTurnMessage = memo(
  ({ modelCode, modelName, round, totalRounds, content, status, errorMessage }: CouncilTurnMessageProps) => {
    const [copyFeedback, setCopyFeedback] = useState(false);
    const displayContent = useSmoothStream(content, status === "streaming");
    const dotColor = getModelColor(modelCode);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 1500);
      } catch {
        // Clipboard may not be available.
      }
    }, [content]);

    const isActive = status === "streaming";

    return (
      <div className={`flex gap-3 group ${isActive ? "opacity-100" : "opacity-100"}`}>
        <div className="flex flex-col items-center gap-1.5 pt-1">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ${isActive ? "animate-pulse" : ""}`} />
          <div className="w-px flex-1 bg-border/40" />
        </div>

        <div className="flex-1 min-w-0 pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-text-primary truncate">
              {modelName}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted bg-surface-hover rounded-md px-1.5 py-0.5">
              R{round}/{totalRounds}
            </span>
            {status === "streaming" && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-accent bg-accent/10 rounded-md px-1.5 py-0.5 animate-pulse">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Speaking
              </span>
            )}
            {status === "waiting" && (
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted bg-surface-hover rounded-md px-1.5 py-0.5">
                Waiting
              </span>
            )}
            {status === "error" && (
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-error bg-error/10 rounded-md px-1.5 py-0.5">
                Error
              </span>
            )}
          </div>

          <div
            className={`rounded-xl border px-4 py-3 transition-colors ${
              status === "streaming"
                ? "border-accent/30 bg-accent/[0.03]"
                : status === "done"
                  ? "border-border bg-surface/50"
                  : status === "error"
                    ? "border-error/30 bg-error/[0.03]"
                    : "border-border/40 bg-surface/30"
            }`}
          >
            {status === "waiting" && !content && (
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-border animate-pulse" />
                <span>Waiting for response...</span>
              </div>
            )}

            {status === "error" && errorMessage && (
              <p className="text-sm text-error">{errorMessage}</p>
            )}

            {content && (
              <div className="relative">
                <ReactMarkdown
                  components={councilMarkdownComponents}
                  rehypePlugins={[rehypeHighlight, rehypeKatex]}
                  remarkPlugins={[remarkGfm, remarkMath]}
                >
                  {displayContent}
                </ReactMarkdown>

                {status === "streaming" && (
                  <span className="inline-block h-4 w-[3px] bg-accent animate-pulse rounded-sm ml-0.5" />
                )}
              </div>
            )}
          </div>

          {content && status === "done" && (
            <button
              type="button"
              onClick={handleCopy}
              className="mt-1 ml-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-text-primary"
              title="Copy response"
              aria-label="Copy response"
            >
              {copyFeedback ? (
                <>
                  <svg className="w-3 h-3 text-success" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-success">Copied</span>
                </>
              ) : (
                <>
                  <FaRegCopy size={11} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  },
);

CouncilTurnMessage.displayName = "CouncilTurnMessage";

export default CouncilTurnMessage;
