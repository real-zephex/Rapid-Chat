"use client";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import Image from "next/image";
import { models } from "../utils/model-list";
import {
  deleteChat,
  deleteTab,
  retrieveChats,
  saveChats,
} from "@/utils/indexedDB";
import {
  FaArrowCircleDown,
  FaArrowCircleRight,
  FaCopy,
  FaUpload,
} from "react-icons/fa";
import ModelProvider from "@/models";
import rehypeKatex from "rehype-katex";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { processMessageContent } from "@/utils/responseCleaner";
import { useRouter } from "next/navigation";

const modelInformation: Record<string, string> = {
  scout: "Accurate & reliable general knowledge",
  // compound: "Fast and reliable model (with internet access)",
  llama_instant: "Ultra-fast & conversational",
  flash: "Direct & concise for quick facts",
  qwen: "Deep reasoning & expert analysis",
  devstral: "Coding assistant & practical solutions",
  // deepseek: "Deep learning optimized model",
  // phi4: "Advanced AI model (overthinks)",
  // phi4plus: "Enhanced version of Phi4 (overthinks even more)",
  // sarvam: "Sarvam model (Multilingual)",
};

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: { mimeType: string; data: Uint8Array }[];
  reasoning?: string;
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
      } right-2 p-2 rounded-md bg-gray-700/80 hover:bg-gray-600/90 transition-all duration-200 z-10 opacity-60 hover:opacity-100`}
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

// Utility function to convert Uint8Array to data URL for display
const arrayBufferToDataUrl = (data: Uint8Array, mimeType: string): string => {
  const blob = new Blob([new Uint8Array(data)], { type: mimeType });
  return URL.createObjectURL(blob);
};

// Component for displaying images
const ImageDisplay = ({
  images,
}: {
  images: { mimeType: string; data: Uint8Array }[];
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-2">
      {images.map((image, index) => {
        const dataUrl = arrayBufferToDataUrl(image.data, image.mimeType);
        return (
          <div key={index} className="relative">
            <Image
              src={dataUrl}
              alt={`Uploaded image ${index + 1}`}
              width={300}
              height={200}
              className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-600"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "300px",
                maxHeight: "192px",
              }}
              unoptimized={true} // Required for blob URLs
              onLoad={() => {
                // Clean up the object URL after the image loads
                setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// Component for image preview while typing
const ImagePreview = ({
  images,
  onRemove,
}: {
  images: { mimeType: string; data: Uint8Array }[];
  onRemove: (index: number) => void;
}) => {
  if (images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-neutral-800/50 rounded-lg mb-2">
      {images.map((image, index) => {
        const dataUrl = arrayBufferToDataUrl(image.data, image.mimeType);
        return (
          <div key={index} className="relative">
            <Image
              src={dataUrl}
              alt={`Preview ${index + 1}`}
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded border border-gray-500"
              unoptimized={true} // Required for blob URLs
              onLoad={() => {
                setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
              }}
            />
            <button
              onClick={() => onRemove(index)}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              title="Remove image"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
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
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  // Images
  const [images, setImages] = useState<
    { mimeType: string; data: Uint8Array }[]
  >([]);

  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const loadChats = async () => {
      const chats = await retrieveChats(id);
      setMessages(chats);
    };
    loadChats();
  }, [id]);

  useEffect(() => {
    window.addEventListener("offline", () => {
      setIsLoading(true);
    });

    window.addEventListener("online", () => {
      setIsLoading(false);
    });

    return () => {
      window.removeEventListener("offline", () => {
        setIsLoading(true);
      });
      window.removeEventListener("online", () => {
        setIsLoading(false);
      });
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [isLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      ...(images.length > 0 && { images: [...images] }), // Include images if any
    };
    saveChats(id, [...messages, userMessage]);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const prevChats = await retrieveChats(id);
      const response = await ModelProvider({
        type: model,
        query: input,
        chats: prevChats.map((msg) => {
          return {
            role: msg.role,
            content: msg.content,
          };
        }),
        imageData: images,
      });

      if (!(response instanceof ReadableStream)) {
        throw new Error("Expected a ReadableStream response");
      }

      const reader = response.getReader();

      let assistantMessage = "";
      let lastDisplayContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text =
          typeof value === "string" ? value : new TextDecoder().decode(value);
        assistantMessage += text;

        const { displayContent, reasoning } =
          processMessageContent(assistantMessage);

        if (displayContent !== lastDisplayContent) {
          lastDisplayContent = displayContent;

          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: displayContent,
              reasoning: reasoning || "",
            };
            saveChats(id, newMessages);
            return newMessages;
          });
        }
      }

      const { displayContent, reasoning } =
        processMessageContent(assistantMessage);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: displayContent,
          reasoning: reasoning || "",
        };
        saveChats(id, newMessages);
        return newMessages;
      });
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
      setImages([]); // Clear images after processing
    }
  }

  function handleModelChange(event: React.ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    const target = event.target as HTMLSelectElement;

    const model = target.value;
    setModel(model);
  }

  const handleCopyResponse = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Error copying response:", error);
      // Handle the error as needed, e.g., show a notification
    }
  };

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const file = event.target.files;
      const fileArray = Array.from(file);

      if (fileArray.length > 5) {
        alert("You can only upload a maximum of 5 images at a time.");
        event.target.value = ""; // Clear the input
        return;
      }
      const validFiles = fileArray.filter((f) => {
        return f.type.startsWith("image/") && checkFileSize(f);
      });
      if (validFiles.length == 0) {
        alert("No valid image files selected.");
        event.target.value = ""; // Clear the input
        return;
      }
      const arraizedImages = await Promise.all(
        validFiles.map(async (f) => {
          const buffer = await f.arrayBuffer();
          return {
            mimeType: f.type,
            data: new Uint8Array(buffer),
          };
        })
      );
      setImages(arraizedImages);
      event.target.value = ""; // Clear the input after successful processing
    }
  }

  function checkFileSize(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      return false;
    }
    return true;
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-20px)] relative">
      {/* Delete Button */}

      <div className="absolute top-0 left-0 m-4 z-20">
        <button
          className="bg-bg/50 p-2 rounded-lg active:scale-95 transition-transform duration-200 hover:bg-bg/70 hover:shadow-lg shadow-gray-500/20"
          onClick={() => {
            deleteChat(id);
            deleteTab(id);
            window.dispatchEvent(new Event("new-tab"));
            router.push("/");
          }}
        >
          <RiDeleteBin2Fill size={20} color="red" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-48">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-full lg:max-w-[70%] p-4 shadow-sm ${
                  message.role === "user"
                    ? "bg-neutral-700 text-white rounded-2xl rounded-br-lg"
                    : "bg-neutral-800 text-white rounded-2xl rounded-bl-lg"
                }`}
              >
                {message.role === "user" ? (
                  <div className="text-white whitespace-pre-wrap text-lg leading-7">
                    {message.images && message.images.length > 0 && (
                      <ImageDisplay images={message.images} />
                    )}
                    {message.content}
                  </div>
                ) : (
                  <div className="prose prose-invert prose-lg max-w-none leading-7">
                    {message.content ? (
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
                                const el = document.getElementById(
                                  `reasoning-${index}`
                                );
                                if (el) {
                                  el.style.display =
                                    el.style.display === "none"
                                      ? "block"
                                      : "none";
                                  const arrow = document.getElementById(
                                    `arrow-${index}`
                                  );
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
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
                              const language = match ? match[1] : "";
                              return match ? (
                                <code
                                  className={`${className} hljs`}
                                  {...props}
                                >
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
                                    for (const child of element.props
                                      .children) {
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
                        <div className="flex flex-row items-center gap-2 mt-4">
                          <button
                            className="flex flex-row items-center gap-2 bg-neutral-700/60 hover:bg-neutral-600/80 h-9 px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                            onClick={(e) => {
                              handleCopyResponse(message.content);
                              e.currentTarget.innerHTML = "Copied";
                              // e.currentTarget.disabled = true;
                            }}
                            id={new Date().getTime().toString()}
                            ref={copyButtonRef}
                          >
                            <FaCopy size={12} />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 select-none">
                        <div className="flex flex-row items-center select-none">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-neutral-600/80 mr-3 text-xs font-medium">
                            AI
                          </div>
                          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                            {model}
                          </span>
                        </div>
                        <div className="w-32 rounded-full h-2 animate-pulse bg-neutral-700/60"></div>
                        <div className="w-40 rounded-full h-2 animate-pulse bg-neutral-700/60"></div>
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
      <div className="absolute bottom-0 left-0 bg-[#313131] max-w-full w-full lg:w-1/2 rounded-t-xl p-2 lg:translate-x-1/2 border-b-0 border border-gray-500 z-50">
        <form onSubmit={handleSubmit}>
          <ImagePreview images={images} onRemove={removeImage} />
          <textarea
            className="w-full bg-bg/30 rounded-t-xl text-white outline-none resize-none p-3 text-base placeholder-gray-300 placeholder:opacity-50"
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
                className="bg-neutral-800 text-white rounded-lg px-4 h-full py-2 outline-none max-w-md w-full"
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
            <div className="flex flex-row items-center gap-2">
              {model === "flash" && (
                <label
                  className="bg-bg px-4 h-full py-2 rounded-lg text-white hover:bg-cyan-300 transition-colors duration-300 hover:text-black cursor-pointer"
                  title="Upload file"
                  htmlFor="fileInput"
                >
                  <input
                    name="file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileChange}
                    multiple
                  />
                  <FaUpload />
                </label>
              )}

              <button
                className="bg-bg  px-4 h-full py-2 rounded-lg text-white hover:bg-amber-300 transition-colors duration-300 hover:text-black"
                onClick={() => scrollToBottom()}
                title="Scroll to bottom"
              >
                <FaArrowCircleDown size={21} />
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading ? "bg-teal-700" : "bg-bg hover:bg-teal-600"
                } text-white rounded-lg px-4 h-full py-2 transition-colors duration-300 `}
              >
                {isLoading ? "..." : <FaArrowCircleRight size={21} />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
