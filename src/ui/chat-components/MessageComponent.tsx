"use client";

import { memo, useMemo } from "react";
import { FaRegCopy, FaCodeBranch } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import CopyButton from "./CopyButton";
import ImageDisplay from "./ImageDisplay";
import { GoCpu } from "react-icons/go";
import { TbAlphabetLatin } from "react-icons/tb";
import { JetBrains_Mono } from "next/font/google";
import { useSmoothStream } from "@/hooks/useSmoothStream";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
});

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: { mimeType: string; data: Uint8Array }[];
  reasoning?: string;
  startTime?: number;
  endTime?: number;
  cancelled?: boolean;
};

const MessageComponent = memo(
  ({
    message,
    index,
    model,
    onCopyResponse,
    onBranchFromMessage,
  }: {
    message: Message;
    index: number;
    model: string;
    onCopyResponse: (content: string) => void;
    onBranchFromMessage: (index: number) => void;
  }) => {
    const isUser = message.role === "user";
    const isStreaming = !message.endTime && !message.cancelled && !isUser;

    const displayedContent = useSmoothStream(message.content, isStreaming);
    const displayedReasoning = useSmoothStream(
      message.reasoning || "",
      isStreaming
    );

    const reasoningTokens = useMemo(() => {
      if (!message.reasoning) return 0;
      return message.reasoning
        .split(/[ \t\n\r\f.,!?;:"'’“”(){}\[\]-]+/)
        .filter(Boolean).length;
    }, [message.reasoning]);

    const tokens = useMemo(
      () =>
        message.content
          .split(/[ \t\n\r\f.,!?;:"'’“”(){}\[\]-]+/)
          .filter(Boolean).length + reasoningTokens,
      [message.content, reasoningTokens]
    );

    const tokensPerSecond = useMemo(() => {
      if (message.endTime && message.startTime) {
        const duration = (message.endTime - message.startTime) / 1000;
        return duration > 0 ? (tokens / duration).toFixed(2) : 0;
      }
      return 0;
    }, [message.endTime, message.startTime, tokens]);

    if (isUser) {
      return (
        <div className="w-full bg-transparent group">
          <div className="max-w-4xl mx-auto px-4 py-8 flex justify-end">
            <div className="max-w-[85%] flex flex-col items-end">
              {message.images && message.images.length > 0 && (
                <div className="mb-4">
                  <ImageDisplay images={message.images} />
                </div>
              )}
              <div className="text-text-primary text-lg whitespace-pre-wrap break-words leading-relaxed text-right">
                {message.content}
              </div>
              <div className="flex flex-row items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-all"
                  title="Copy to clipboard"
                  onClick={() => onCopyResponse(message.content)}
                >
                  <FaRegCopy size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full bg-transparent group">
        <div className="max-w-4xl mx-auto px-4 py-8 flex justify-start">
          <div className="max-w-full w-full">
            <div className="prose prose-invert prose-lg max-w-none w-full leading-relaxed overflow-x-auto text-text-primary">
              {displayedReasoning && (
                <div className="mb-6 bg-surface/30 border border-border/50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => {
                      const el = document.getElementById(`reasoning-${index}`);
                      if (el) {
                        el.style.display =
                          el.style.display === "none" ? "block" : "none";
                        const arrow = document.getElementById(`arrow-${index}`);
                        if (arrow) {
                          arrow.style.transform =
                            el.style.display === "none"
                              ? "rotate(0deg)"
                              : "rotate(90deg)";
                        }
                      }
                    }}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 text-text-muted hover:text-text-secondary hover:bg-surface/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        id={`arrow-${index}`}
                        className="w-3.5 h-3.5 transition-transform duration-300 ease-out"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                      <span className="font-semibold text-xs tracking-wider uppercase">Thought Process</span>
                    </div>
                  </button>
                  <div
                    id={`reasoning-${index}`}
                    className="px-4 pb-4 text-sm text-text-muted italic leading-relaxed border-t border-border/30 pt-3"
                    style={{ display: "none" }}
                  >
                    {displayedReasoning}
                  </div>
                </div>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                components={{
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <code
                        className={`${className} ${jetbrainsMono.className} hljs`}
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code
                        className="bg-surface px-1.5 py-0.5 rounded text-accent text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }) => {
                    const getTextContent = (element: any): string => {
                      if (typeof element === "string") return element;
                      if (element?.props?.children) {
                        if (Array.isArray(element.props.children)) {
                          return element.props.children
                            .map(getTextContent)
                            .join("");
                        }
                        return getTextContent(element.props.children);
                      }
                      return "";
                    };
                    const getLanguage = (element: any): string => {
                      if (element?.props?.className) {
                        const match = /language-(\w+)/.exec(
                          element.props.className
                        );
                        return match ? match[1] : "";
                      }
                      if (element?.props?.children) {
                        if (Array.isArray(element.props.children)) {
                          for (const child of element.props.children) {
                            const lang = getLanguage(child);
                            if (lang) return lang;
                          }
                        } else {
                          return getLanguage(element.props.children);
                        }
                      }
                      return "";
                    };
                    const codeText = getTextContent(children);
                    const language = getLanguage(children);
                    return (
                      <div className="relative group my-6">
                        {language && (
                          <div className="flex justify-between items-center bg-surface border-x border-t border-border px-4 py-2 text-[10px] text-text-muted font-bold uppercase tracking-widest rounded-t-lg">
                            <span>{language}</span>
                          </div>
                        )}
                        <pre
                          className={`bg-surface border border-border p-5 overflow-x-auto mt-0 ${
                            language ? "rounded-t-none rounded-b-lg" : "rounded-lg"
                          }`}
                          {...props}
                        >
                          {children}
                        </pre>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton
                            text={codeText}
                            hasLanguageLabel={!!language}
                          />
                        </div>
                      </div>
                    );
                  },
                  h1: ({ children, ...props }) => (
                    <h1 className="text-2xl font-bold text-text-primary mb-6 mt-10 tracking-tight" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 className="text-xl font-bold text-text-primary mb-4 mt-8 tracking-tight" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 className="text-lg font-semibold text-text-primary mb-3 mt-6" {...props}>
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }) => (
                    <p className="mb-5 last:mb-0" {...props}>{children}</p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="my-5 space-y-2 list-disc pl-5" {...props}>{children}</ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="my-5 space-y-2 list-decimal pl-5" {...props}>{children}</ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="text-text-primary pl-1" {...props}>{children}</li>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote className="border-l-4 border-border pl-6 my-6 italic text-text-secondary" {...props}>
                      {children}
                    </blockquote>
                  ),
                  hr: ({ ...props }) => (
                    <hr className="my-10 border-border" {...props} />
                  ),
                  a: ({ children, href, ...props }) => (
                    <a href={href} className="text-accent hover:underline underline-offset-4 font-medium" target="_blank" rel="noopener noreferrer" {...props}>
                      {children}
                    </a>
                  ),
                }}
              >
                {displayedContent}
              </ReactMarkdown>

              {message.cancelled && (
                <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 bg-error/5 border border-error/20 rounded-lg text-error text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  <div className="size-1.5 rounded-full bg-error animate-pulse"></div>
                  <span>Generation Stopped</span>
                </div>
              )}

              <div className="flex flex-row items-center gap-2 mt-8 pt-4 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-all"
                  title="Copy to clipboard"
                  onClick={() => onCopyResponse(message.content)}
                >
                  <FaRegCopy size={13} />
                </button>
                <button
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-all"
                  title="Branch from this message"
                  onClick={() => onBranchFromMessage(index)}
                >
                  <FaCodeBranch size={13} />
                </button>
                <div className="flex-1"></div>
                <div className="text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-4">
                  {tokens > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface/50 border border-border/30">
                      <TbAlphabetLatin size={12} className="text-text-muted/60" />
                      <span>{tokens}</span>
                    </div>
                  )}
                  {Number(tokensPerSecond) > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface/50 border border-border/30">
                      <GoCpu size={12} className="text-text-muted/60" />
                      <span>{tokensPerSecond} T/S</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
MessageComponent.displayName = "MessageComponent";

export default MessageComponent;
