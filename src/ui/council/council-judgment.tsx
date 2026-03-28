"use client";

import { useSmoothStream } from "@/hooks/useSmoothStream";
import { memo, useCallback, useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import { HiOutlineScale } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { councilMarkdownComponents } from "./council-markdown";

interface CouncilJudgmentProps {
  content: string;
  status: "pending" | "streaming" | "done";
  judgeModel?: string;
}

const CouncilJudgment = memo(
  ({ content, status, judgeModel }: CouncilJudgmentProps) => {
    const [copyFeedback, setCopyFeedback] = useState(false);
    const displayContent = useSmoothStream(content, status === "streaming");

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 1500);
      } catch {
        // Clipboard may not be available.
      }
    }, [content]);

    const isActive = status !== "pending";

    return (
      <div
        className={`rounded-xl border transition-colors ${
          status === "streaming"
            ? "border-accent/50 bg-accent/5"
            : status === "done"
              ? "border-accent/30 bg-surface"
              : "border-border bg-surface/50"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <HiOutlineScale size={16} className="text-accent" />
            <span className="text-sm font-bold uppercase tracking-[0.1em] text-text-primary">
              Final Judgment
            </span>
            {judgeModel && isActive && (
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-[0.1em]">
                by {judgeModel}
              </span>
            )}
            {status === "streaming" && (
              <span className="inline-flex items-center rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent animate-pulse">
                Deliberating
              </span>
            )}
          </div>
          {content && (
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-background hover:text-text-primary"
              title="Copy judgment"
              aria-label="Copy judgment"
            >
              <FaRegCopy size={13} />
              {copyFeedback && (
                <span className="ml-1 text-[10px] text-success">Copied</span>
              )}
            </button>
          )}
        </div>

        <div className="px-5 py-4 min-h-[80px]">
          {status === "pending" && !content && (
            <div className="flex items-center justify-center py-6 text-text-muted text-sm">
              <span>Judgment will appear after all council members respond...</span>
            </div>
          )}

          {content && (
            <ReactMarkdown
              components={councilMarkdownComponents}
              rehypePlugins={[rehypeHighlight, rehypeKatex]}
              remarkPlugins={[remarkGfm, remarkMath]}
            >
              {displayContent}
            </ReactMarkdown>
          )}

          {status === "streaming" && content && (
            <span className="inline-block h-4 w-1.5 bg-accent animate-pulse rounded-sm mt-1" />
          )}
        </div>
      </div>
    );
  },
);

CouncilJudgment.displayName = "CouncilJudgment";

export default CouncilJudgment;
