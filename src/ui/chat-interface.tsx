"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import { models } from "../utils/model-list";
import { retrieveChats, saveChats } from "@/utils/localStoraage";
import { FaArrowCircleRight } from "react-icons/fa";
import ModelProvider from "@/models";
import rehypeKatex from "rehype-katex";

const modelInformation: Record<string, string> = {
  scout: "All round fast model",
  compound: "Fast and reliable model",
  flash: "Lightweight and efficient",
  qwen: "High performance model",
  devstral: "Developer-friendly model",
  deepseek: "Deep learning optimized model",
  phi4: "Advanced AI model (overthinks)",
  phi4plus: "Enhanced version of Phi4 (overthinks even more)",
  sarvam: "Sarvam model (Multilingual)",
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Copy button component for code blocks
const CopyButton = ({
  text,
  hasLanguageLabel,
}: {
  text: string;
  hasLanguageLabel?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`absolute ${
        hasLanguageLabel ? "top-14" : "top-2"
      } right-2 p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors z-10`}
      title={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="m5,15 L5,5 A2,2 0 0,1 7,3 L17,3"></path>
        </svg>
      )}
    </button>
  );
};

const ChatInterface = ({ id }: { id: string }) => {
  if (!id) {
    return;
  }

  const [model, setModel] = useState<string>("scout");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [isLoading]);

  useEffect(() => {
    const chats = retrieveChats(id);
    setMessages(chats);
  }, []);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    console.log(id);

    const userMessage: Message = { role: "user", content: input };
    saveChats(id, [...messages, userMessage]);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const prevChats = retrieveChats(id);
      const response = await ModelProvider({
        type: model,
        query: input,
        chats: prevChats,
      });

      if (!(response instanceof ReadableStream)) {
        throw new Error("Expected a ReadableStream response");
      }

      const reader = response.getReader();
      let assistantMessage = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text =
          typeof value === "string" ? value : new TextDecoder().decode(value);
        assistantMessage += text;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: assistantMessage,
          };
          saveChats(id, newMessages);
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleModelChange(event: React.ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    const target = event.target as HTMLSelectElement;

    const model = target.value;
    setModel(model);
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-20px)]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-48">
        <div className="container mx-auto max-w-6xl">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-full lg:max-w-[70%] p-3 ${
                  message.role === "user"
                    ? "bg-neutral-500 text-white rounded-l-xl rounded-br-xl"
                    : "bg-neutral-800 text-white rounded-r-xl rounded-bl-xl"
                }`}
              >
                {message.role === "user" ? (
                  <div className="text-white whitespace-pre-wrap text-lg leading-7">
                    {message.content}
                  </div>
                ) : (
                  <div className="prose prose-invert prose-lg max-w-none leading-7">
                    {message.content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeHighlight, rehypeKatex]}
                        components={{
                          code: ({ node, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
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
                                  <div className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-t-lg border border-gray-700 border-b-0">
                                    <span className="text-sm text-gray-300 font-medium">
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
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="w-30 rounded-xl h-2 animate-pulse bg-neutral-700"></div>
                        <div className="w-40 rounded-xl h-2 animate-pulse bg-neutral-700"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-full lg:max-w-[70%] p-3 bg-neutral-800 text-white rounded-r-xl rounded-bl-xl">
                <div className="text-lg text-white">Loading...</div>
              </div>
            </div>
          )} */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input Form */}
      <div className="absolute bottom-0 left-0 bg-black/30 backdrop-blur-2xl max-w-full w-full lg:w-1/2 rounded-t-xl p-2 lg:translate-x-1/2 border-b-0 border border-gray-500">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-black/30 rounded-t-xl text-white outline-none resize-none p-3 text-base placeholder-gray-300 placeholder:opacity-50"
            rows={3}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          ></textarea>
          <div className="flex justify-between items-center gap-2 mt-2 ">
            <div className="flex flex-row items-center gap-2">
              <select
                className="bg-neutral-900 text-white rounded-lg px-4 h-full py-2 outline-none max-w-md w-full"
                value={model}
                onChange={handleModelChange}
              >
                {models.map((model) => (
                  <option value={model} key={model} className="text-md">
                    {model} -{" "}
                    {modelInformation[model] || "No description available"}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`${
                isLoading ? "bg-teal-700" : "bg-neutral-900 hover:bg-teal-600"
              } text-white rounded-lg px-4 h-full py-2 transition-colors duration-300 `}
            >
              {isLoading ? "Sending..." : <FaArrowCircleRight size={21} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
