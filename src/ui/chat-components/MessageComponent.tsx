"use client";

import { memo, useMemo, useState } from "react";
import { FaCodeBranch, FaRegCopy } from "react-icons/fa6";
import { GoCpu } from "react-icons/go";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { TbAlphabetLatin } from "react-icons/tb";

import { useSmoothStream } from "@/hooks/useSmoothStream";

import CopyButton from "./CopyButton";
import ImageDisplay from "./ImageDisplay";

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: { mimeType: string; data: Uint8Array }[];
  reasoning?: string;
  startTime?: number;
  endTime?: number;
  cancelled?: boolean;
};

interface MessageComponentProps {
  message: Message;
  index: number;
  model: string;
  onCopyResponse: (content: string) => void;
  onBranchFromMessage: (index: number) => void;
  isSplitView?: boolean;
}

const MessageComponent = memo(
  ({
    message,
    index,
    model,
    onCopyResponse,
    onBranchFromMessage,
    isSplitView = false,
  }: MessageComponentProps) => {
    const [isReasoningOpen, setIsReasoningOpen] = useState(false);

    const isUser = message.role === "user";
    const isStreaming = !message.endTime && !message.cancelled && !isUser;

    const displayedContent = useSmoothStream(message.content, isStreaming);
    const displayedReasoning = useSmoothStream(message.reasoning || "", isStreaming);

    const reasoningTokens = useMemo(() => {
      if (!message.reasoning) {
        return 0;
      }

      return message.reasoning
        .split(/[ \t\n\r\f.,!?;:"'’“”(){}\[\]-]+/)
        .filter(Boolean).length;
    }, [message.reasoning]);

    const totalTokens = useMemo(
      () =>
        message.content
          .split(/[ \t\n\r\f.,!?;:"'’“”(){}\[\]-]+/)
          .filter(Boolean).length + reasoningTokens,
      [message.content, reasoningTokens],
    );

    const tokensPerSecond = useMemo(() => {
      if (!message.endTime || !message.startTime) {
        return 0;
      }

      const duration = (message.endTime - message.startTime) / 1000;
      return duration > 0 ? Number((totalTokens / duration).toFixed(2)) : 0;
    }, [message.endTime, message.startTime, totalTokens]);

    const wrapperClass = isSplitView ? "max-w-none" : "max-w-5xl";

    if (isUser) {
      return (
        <article className="group w-full">
          <div className={`mx-auto flex w-full ${wrapperClass} justify-end px-1 py-5 sm:px-3`}>
            <div className="max-w-[92%] space-y-3 sm:max-w-[84%]">
              {message.images && message.images.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-2">
                  <ImageDisplay images={message.images} />
                </div>
              )}

              <div className="rounded-2xl border border-accent/35 bg-accent px-4 py-3 text-[15px] leading-relaxed text-white shadow-sm">
                {message.content}
              </div>

              <div className="flex justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  className="rounded-lg border border-border bg-surface p-2 text-text-muted transition-colors hover:text-text-primary"
                  onClick={() => onCopyResponse(message.content)}
                  aria-label="Copy user message"
                >
                  <FaRegCopy size={13} />
                </button>
              </div>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article className="group w-full">
        <div className={`mx-auto w-full ${wrapperClass} px-1 py-5 sm:px-3`}>
          <div className="w-full rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm sm:px-6 sm:py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                {model}
              </span>
            </div>

            {displayedReasoning && (
              <div className="mb-5 overflow-hidden rounded-xl border border-border bg-background">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.13em] text-text-secondary transition-colors hover:bg-surface"
                  onClick={() => setIsReasoningOpen((current) => !current)}
                  aria-expanded={isReasoningOpen}
                  aria-controls={`reasoning-${index}`}
                >
                  <span>Reasoning</span>
                  <span
                    className={`transition-transform duration-200 ${
                      isReasoningOpen ? "rotate-90" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  >
                    &gt;
                  </span>
                </button>
                <div
                  id={`reasoning-${index}`}
                  className={`px-3 pb-3 text-sm leading-relaxed text-text-secondary ${
                    isReasoningOpen ? "block" : "hidden"
                  }`}
                >
                  {displayedReasoning}
                </div>
              </div>
            )}

            <div className="chat-markdown prose prose-neutral max-w-none text-[1rem] leading-7 text-text-primary sm:text-[1.03rem]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                components={{
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");

                    if (match) {
                      return (
                        <code className={`${className || ""} hljs`} {...props}>
                          {children}
                        </code>
                      );
                    }

                    return (
                      <code
                        className="rounded bg-background px-1.5 py-0.5 font-mono text-[0.9em] text-accent"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }) => {
                    const getTextContent = (node: any): string => {
                      if (typeof node === "string") {
                        return node;
                      }

                      if (!node?.props?.children) {
                        return "";
                      }

                      if (Array.isArray(node.props.children)) {
                        return node.props.children.map(getTextContent).join("");
                      }

                      return getTextContent(node.props.children);
                    };

                    const getLanguage = (node: any): string => {
                      const className = node?.props?.className as string | undefined;
                      if (className) {
                        const match = /language-(\w+)/.exec(className);
                        if (match) {
                          return match[1];
                        }
                      }

                      if (!node?.props?.children) {
                        return "";
                      }

                      if (Array.isArray(node.props.children)) {
                        for (const child of node.props.children) {
                          const language = getLanguage(child);
                          if (language) {
                            return language;
                          }
                        }
                        return "";
                      }

                      return getLanguage(node.props.children);
                    };

                    const codeText = getTextContent(children);
                    const language = getLanguage(children);

                    return (
                      <div className="group relative my-5 overflow-hidden rounded-xl border border-border bg-background">
                        {language && (
                          <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                            <span>{language}</span>
                          </div>
                        )}
                        <pre className="m-0 overflow-x-auto bg-transparent p-4 text-text-primary" {...props}>
                          {children}
                        </pre>
                        <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <CopyButton text={codeText} hasLanguageLabel={Boolean(language)} />
                        </div>
                      </div>
                    );
                  },
                  h1: ({ children, ...props }) => (
                    <h1 className="mb-5 mt-8 text-2xl font-semibold text-text-primary" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 className="mb-4 mt-7 text-xl font-semibold text-text-primary" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 className="mb-3 mt-6 text-lg font-semibold text-text-primary" {...props}>
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }) => (
                    <p className="mb-4 last:mb-0" {...props}>
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="my-4 list-disc space-y-2 pl-5" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="my-4 list-decimal space-y-2 pl-5" {...props}>
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="my-4 border-l-4 border-border pl-4 italic text-text-secondary"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
                  div: ({ children, ...props }) => {
                    const ariaHidden = props["aria-hidden"];
                    if (ariaHidden === "true" || ariaHidden === true) {
                      return null;
                    }

                    return <div {...props}>{children}</div>;
                  },
                  span: ({ children, ...props }) => {
                    const ariaHidden = props["aria-hidden"];
                    if (ariaHidden === "true" || ariaHidden === true) {
                      return null;
                    }

                    return <span {...props}>{children}</span>;
                  },
                  a: ({ children, href, ...props }) => (
                    <a
                      href={href}
                      className="font-medium text-accent underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {displayedContent}
              </ReactMarkdown>
            </div>

            {message.cancelled && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-error">
                <span className="h-1.5 w-1.5 rounded-full bg-error" />
                <span>Generation stopped</span>
              </div>
            )}

            <div className="mt-5 flex items-center gap-2 border-t border-border pt-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                className="rounded-lg border border-border bg-background p-2 text-text-muted transition-colors hover:text-text-primary"
                onClick={() => onCopyResponse(message.content)}
                aria-label="Copy assistant response"
              >
                <FaRegCopy size={13} />
              </button>
              <button
                type="button"
                className="rounded-lg border border-border bg-background p-2 text-text-muted transition-colors hover:text-text-primary"
                onClick={() => onBranchFromMessage(index)}
                aria-label="Branch from this response"
              >
                <FaCodeBranch size={13} />
              </button>

              <div className="ml-auto flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-text-muted">
                {totalTokens > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                    <TbAlphabetLatin size={11} />
                    {totalTokens}
                  </span>
                )}
                {tokensPerSecond > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                    <GoCpu size={11} />
                    {tokensPerSecond} T/S
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  },
);

MessageComponent.displayName = "MessageComponent";

export default MessageComponent;
