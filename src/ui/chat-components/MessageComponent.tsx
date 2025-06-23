"use client";

import { memo, useMemo } from "react";
import { FaCopy } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import CopyButton from "./CopyButton";
import ImageDisplay from "./ImageDisplay";
import { GoCpu } from "react-icons/go";
import { TbAlphabetLatin } from "react-icons/tb";

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: { mimeType: string; data: Uint8Array }[];
  reasoning?: string;
  startTime?: number;
  endTime?: number;
};

const MessageComponent = memo(
  ({
    message,
    index,
    model,
    onCopyResponse,
  }: {
    message: Message;
    index: number;
    model: string;
    onCopyResponse: (content: string) => void;
  }) => {
    const isUser = message.role === "user";

    const tokens = useMemo(
      () =>
        message.content
          .split(/[ \t\n\r\f.,!?;:"'’“”(){}\[\]-]+/)
          .filter(Boolean).length,
      [message.content]
    );

    const tokensPerSecond = useMemo(() => {
      if (message.endTime && message.startTime) {
        const duration = (message.endTime - message.startTime) / 1000;
        return duration > 0 ? Math.round(tokens / duration) : 0;
      }
      return 0;
    }, [message.endTime, message.startTime, tokens]);

    if (isUser) {
      return (
        <div className="flex mb-4 justify-end">
          <div className="max-w-full lg:max-w-[70%] p-4 shadow-sm bg-neutral-700 text-white rounded-2xl rounded-br-lg">
            <div className="text-white whitespace-pre-wrap text-lg leading-7">
              {message.images && message.images.length > 0 && (
                <ImageDisplay images={message.images} />
              )}
              {message.content}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex mb-4 justify-start">
        <div className="max-w-full lg:max-w-[70%] p-4 shadow-sm bg-neutral-800 text-white rounded-2xl rounded-bl-lg">
          <div className="prose prose-invert prose-lg max-w-none leading-7">
            <div className="flex flex-col p-1">
              <div className="flex flex-row items-center mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-neutral-600/80 mr-3 text-xs font-medium">
                  AI
                </div>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {model}
                </span>
              </div>
              {message.reasoning && (
                <div className="mt-2 mb-4">
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
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <svg
                      id={`arrow-${index}`}
                      className="w-4 h-4 transition-transform duration-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    <span className="font-semibold">Reasoning</span>
                  </button>
                  <div
                    id={`reasoning-${index}`}
                    className="text-sm text-gray-400 mt-2 pl-6"
                    style={{ display: "none" }}
                  >
                    {message.reasoning}
                  </div>
                </div>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                components={{
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";
                    return match ? (
                      <code className={`${className} hljs`} {...props}>
                        {children}
                      </code>
                    ) : (
                      <code
                        className="bg-neutral-700 px-2 py-1 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }) => {
                    // Extract text content from children for copy functionality
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
                    // Extract language from code element
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
                      <div className="relative group">
                        {language && (
                          <div className="flex justify-between items-center bg-gray-800/90 px-4 py-2 rounded-t-lg border border-gray-700/50 border-b-0">
                            <span className="text-xs text-gray-300 font-medium uppercase tracking-wide">
                              {language}
                            </span>
                          </div>
                        )}
                        <pre
                          className={`bg-gray-900 p-4 overflow-x-auto border border-gray-700 ${
                            language
                              ? "rounded-t-none rounded-b-lg"
                              : "rounded-lg"
                          }`}
                          {...props}
                        >
                          {children}
                        </pre>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton
                            text={codeText}
                            hasLanguageLabel={!!language}
                          />
                        </div>
                      </div>
                    );
                  },
                  li: ({ children, ...props }) => (
                    <li
                      className="text-lg text-white list-disc pl-4 leading-6.5"
                      {...props}
                    >
                      {children}
                    </li>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              <div className="flex flex-row items-center justify-between gap-2 mt-4">
                <button
                  className="flex flex-row items-center gap-2 bg-neutral-700/60 hover:bg-neutral-600/80 h-9 px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                  onClick={(e) => {
                    onCopyResponse(message.content);
                    e.currentTarget.innerHTML = "Copied";
                  }}
                >
                  <FaCopy size={12} />
                  <span>Copy</span>
                </button>
                <div className="flex flex-row items-center gap-2">
                  {tokens > 0 && (
                    <span className="text-xs text-gray-400 flex flex-row items-center gap-1 bg-white/10 p-1 rounded-lg">
                      <TbAlphabetLatin /> {tokens} tokens
                    </span>
                  )}
                  {tokensPerSecond > 0 && (
                    <span className="text-xs text-gray-400 flex flex-row items-center gap-1 bg-white/10 p-1 rounded-lg">
                      <GoCpu />
                      {tokensPerSecond} tokens/sec
                    </span>
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
