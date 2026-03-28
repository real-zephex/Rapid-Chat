"use client";

import { useSmoothStream } from "@/hooks/useSmoothStream";
import { memo, useCallback, useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import { GoClock, GoCpu } from "react-icons/go";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { councilMarkdownComponents } from "./council-markdown";

interface CouncilMemberCardProps {
  modelCode: string;
  modelName: string;
  content: string;
  status: "pending" | "streaming" | "done" | "error";
  errorMessage?: string;
}

const statusColors: Record<string, string> = {
  pending: "border-border bg-surface",
  streaming: "border-accent/40 bg-accent/5",
  done: "border-border bg-surface",
  error: "border-error/40 bg-error/5",
};

const statusBadge: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Waiting",
    className: "bg-surface-hover text-text-muted",
  },
  streaming: {
    label: "Responding",
    className: "bg-accent/15 text-accent animate-pulse",
  },
  done: {
    label: "Done",
    className: "bg-success/15 text-success",
  },
  error: {
    label: "Error",
    className: "bg-error/15 text-error",
  },
};

const CouncilMemberCard = memo(
  ({ modelCode, modelName, content, status, errorMessage }: CouncilMemberCardProps) => {
    const [copyFeedback, setCopyFeedback] = useState(false);
    const displayContent = useSmoothStream(content, status === "streaming");
    const badge = statusBadge[status];

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 1500);
      } catch {
        // Clipboard may not be available.
      }
    }, [content]);

    return (
      <div
        className={`flex flex-col rounded-xl border transition-colors ${statusColors[status]}`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <GoCpu size={14} className="shrink-0 text-text-muted" />
            <span className="text-sm font-semibold text-text-primary truncate">
              {modelName}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
          {content && (
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-background hover:text-text-primary"
              title="Copy response"
              aria-label="Copy response"
            >
              <FaRegCopy size={13} />
              {copyFeedback && (
                <span className="ml-1 text-[10px] text-success">Copied</span>
              )}
            </button>
          )}
        </div>

        <div className="px-4 py-3 min-h-[60px]">
          {status === "pending" && !content && (
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <GoClock size={13} />
              <span>Waiting for response...</span>
            </div>
          )}

          {status === "error" && errorMessage && (
            <p className="text-sm text-error">{errorMessage}</p>
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

CouncilMemberCard.displayName = "CouncilMemberCard";

export default CouncilMemberCard;
