"use client";

import { memo, useMemo } from "react";
import { FaRegCopy, FaCheck } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import CopyButton from "./CopyButton";
import ImageDisplay from "./ImageDisplay";
import { GoCpu } from "react-icons/go";
import { TbAlphabetLatin } from "react-icons/tb";

import { Cascadia_Code } from "next/font/google";

const cascadiaCode = Cascadia_Code({
  weight: ["400", "600"],
  subsets: ["latin"],
});

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
      [message.content]
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
        <div className="w-full border-b border-gray-700/30 bg-[#212121]">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex justify-end">
              <div className="max-w-[90%]">
                {message.images && message.images.length > 0 && (
                  <ImageDisplay images={message.images} />
                )}
                <div className="bg-[#2f2f2f] rounded-3xl px-5 py-3 text-white whitespace-pre-wrap break-words leading-7">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="w-full">
            <div className="prose prose-invert prose-lg max-w-full w-full leading-7 overflow-x-auto">
              {message.reasoning && (
                <div className="mb-4">
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
                    <span className="font-semibold text-sm">Reasoning</span>
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
                      <code
                        className={`${className} ${cascadiaCode.className}  hljs`}
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      // <SyntaxHighlighter style={dark} language={language}>
                      //   {String(children).replace(/\n$/, "")}
                      // </SyntaxHighlighter>
                      <code
                        className=" p-1 rounded-md text-md text-blue-200 shadow-sm"
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
                          <div className="flex justify-between items-center bg-gradient-to-r from-neutral-900/80 to-neutral-800/80 px-4 py-2.5 text-xs text-gray-300 font-semibold uppercase tracking-wider border border-gray-600/40 border-b-0 rounded-t-xl backdrop-blur-sm">
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              {language}
                            </span>
                          </div>
                        )}

                        <pre
                          className={`bg-neutral-800/90 border border-neutral-700/50 p-4 overflow-x-auto mt-0 ${
                            language
                              ? "rounded-t-none rounded-b-lg"
                              : "rounded-lg"
                          } text-gray-100`}
                          {...props}
                        >
                          {children}
                        </pre>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <CopyButton
                            text={codeText}
                            hasLanguageLabel={!!language}
                          />
                        </div>
                      </div>
                    );
                  },
                  ul: ({ children, ...props }) => (
                    <ul className="my-4 space-y-2 list-none" {...props}>
                      {children}
                    </ul>
                  ),

                  ol: ({ children, ...props }) => (
                    <ol className="my-4 space-y-2 list-none" {...props}>
                      {children}
                    </ol>
                  ),

                  li: ({ children, ...props }) => (
                    <li
                      className="text-md text-gray-100 relative before:content-['▸'] before:text-blue-400 before:font-bold before:absolute before:-left-4 before:-top-0.5"
                      {...props}
                    >
                      {children}
                    </li>
                  ),
                  strong: ({ children, ...props }) => (
                    <strong
                      className="font-bold text-white text-md  rounded"
                      {...props}
                    >
                      {children}
                    </strong>
                  ),
                  em: ({ children, ...props }) => (
                    <em
                      className="italic text-blue-200 text-md font-medium"
                      {...props}
                    >
                      {children}
                    </em>
                  ),
                  h1: ({ children, ...props }) => (
                    <h1
                      className="text-3xl font-bold text-white mb-6 mt-8 border-b-2 border-gradient-to-r from-blue-400 to-purple-400 pb-3 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-400 after:to-purple-400 after:rounded-full"
                      {...props}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2
                      className="text-2xl font-bold text-white mb-4 mt-6 border-b border-gray-600/60 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-1/3 after:h-0.5 after:bg-gradient-to-r after:from-blue-400 after:to-transparent after:rounded-full"
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3
                      className="text-xl font-semibold text-white mb-3 mt-5 pl-3 border-l-4 border-blue-400/60 bg-blue-400/5 py-2 rounded-r"
                      {...props}
                    >
                      {children}
                    </h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4
                      className="text-lg font-semibold text-gray-100 mb-2 mt-4 pl-2 border-l-2 border-purple-400/60"
                      {...props}
                    >
                      {children}
                    </h4>
                  ),
                  h5: ({ children, ...props }) => (
                    <h5
                      className="text-base font-semibold text-gray-200 mb-2 mt-3 uppercase tracking-wide"
                      {...props}
                    >
                      {children}
                    </h5>
                  ),
                  h6: ({ children, ...props }) => (
                    <h6
                      className="text-sm font-semibold text-gray-300 mb-2 mt-2 opacity-80"
                      {...props}
                    >
                      {children}
                    </h6>
                  ),
                  a: ({ children, href, ...props }) => (
                    <a
                      href={href}
                      className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 underline-offset-2 transition-all duration-200 text-md font-medium hover:bg-blue-400/10 px-1 rounded"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="border-l-4 border-blue-400 pl-6 pr-4 py-4 my-6 italic text-gray-200 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-r-lg shadow-lg backdrop-blur-sm text-md relative"
                      {...props}
                    >
                      <div className="relative">
                        <span className="absolute -top-4 -left-4 text-4xl text-blue-400/60 font-serif">
                          &ldquo;
                        </span>
                        {children}
                      </div>
                    </blockquote>
                  ),

                  // Handle block math
                  div: ({ children, className, ...props }) => {
                    // Hide elements that are marked as aria-hidden (raw LaTeX)
                    if (props["aria-hidden"] === "true") {
                      return null;
                    }

                    return <div {...props}>{children}</div>;
                  },

                  // Handle inline math - hide raw LaTeX spans
                  // span: ({ children, className, ...props }) => {
                  //   // Hide elements that are marked as aria-hidden (raw LaTeX)
                  //   if (props["aria-hidden"] === "true") {
                  //     return null;
                  //   }

                  //   return <span {...props}>{children}</span>;
                  // },

                  p: ({ children, ...props }) => {
                    return (
                      <p
                        {...props}
                        className="mb-3 mt-2 text-md leading-relaxed text-gray-100"
                      >
                        {children}
                      </p>
                    );
                  },

                  table: ({ children, ...props }) => {
                    return (
                      <div className="overflow-x-auto w-full my-6 rounded-lg border border-neutral-700/50">
                        <table
                          className="w-full border-collapse bg-neutral-800/40"
                          {...props}
                        >
                          {children}
                        </table>
                      </div>
                    );
                  },

                  thead: ({ children, ...props }) => (
                    <thead
                      className="bg-neutral-700/50 border-b border-neutral-600/50"
                      {...props}
                    >
                      {children}
                    </thead>
                  ),

                  th: ({ children, ...props }) => (
                    <th
                      className="px-4 py-3 text-center  text-gray-200 text-sm font-semibold"
                      {...props}
                    >
                      {children}
                    </th>
                  ),

                  td: ({ children, ...props }) => (
                    <td
                      className="px-4 py-3 text-gray-300 border-b border-neutral-700/30 hover:bg-neutral-700/30 transition-colors duration-150 text-center"
                      {...props}
                    >
                      {children}
                    </td>
                  ),

                  tr: ({ children, ...props }) => (
                    <tr
                      className="hover:bg-neutral-700/20 transition-colors duration-150 "
                      {...props}
                    >
                      {children}
                    </tr>
                  ),

                  hr: ({ children, ...props }) => (
                    <hr
                      className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-400/60 to-transparent"
                      {...props}
                    />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              <div className="flex flex-row items-center gap-2 mt-4 pt-2 border-t border-gray-700/30">
                <button
                  className="p-2 rounded-lg text-gray-400 hover:bg-[#3f3f3f] hover:text-white transition-colors"
                  title="Copy to clipboard"
                  onClick={(e) => {
                    onCopyResponse(message.content);
                  }}
                >
                  <FaRegCopy size={14} />
                </button>
                <div className="flex-1"></div>
                <div className="flex flex-row items-center gap-2">
                  {tokens > 0 && (
                    <span className="text-xs text-gray-500 flex flex-row items-center gap-1.5 px-2 py-1 rounded">
                      <TbAlphabetLatin size={14} /> {tokens}
                    </span>
                  )}
                  {Number(tokensPerSecond) > 0 && (
                    <span className="text-xs text-gray-500 flex flex-row items-center gap-1.5 px-2 py-1 rounded">
                      <GoCpu size={14} />
                      {tokensPerSecond} t/s
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
