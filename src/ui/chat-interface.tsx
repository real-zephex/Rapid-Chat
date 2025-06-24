"use client";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  ChangeEvent,
} from "react";
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
import { RiDeleteBin2Fill } from "react-icons/ri";
import { processMessageContent } from "@/utils/responseCleaner";
import { useRouter } from "next/navigation";
import ImagePreview from "./chat-components/ImagePreview";
import MessageComponent from "./chat-components/MessageComponent";

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
  startTime?: number;
  endTime?: number;
};

const MessagesContainer = memo(
  ({
    messages,
    model,
    onCopyResponse,
  }: {
    messages: Message[];
    model: string;
    onCopyResponse: (content: string) => void;
  }) => {
    return (
      <div className="container mx-auto max-w-5xl">
        {messages.map((message, index) => (
          <MessageComponent
            key={index}
            message={message}
            index={index}
            model={model}
            onCopyResponse={onCopyResponse}
          />
        ))}
      </div>
    );
  }
);
MessagesContainer.displayName = "MessagesContainer";

const ChatInterface = ({ id }: { id: string }) => {
  if (!id) {
    return;
  }

  const [model, setModel] = useState<string>("scout");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use ref for input to prevent re-renders on every keystroke
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Images
  const [images, setImages] = useState<
    { mimeType: string; data: Uint8Array }[]
  >([]);

  const router = useRouter();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = inputRef.current?.value.trim() || "";
    if (!input || isLoading || isUploadingImages) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      ...(images.length > 0 && { images: [...images] }), // Include images if any
    };
    saveChats(id, [...messages, userMessage]);
    setMessages((prev) => [...prev, userMessage]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

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
      let updateCounter = 0;
      const UPDATE_THROTTLE = 3; // Update UI every 3 chunks for smoother performance

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sending response, please wait!",
        },
      ]);

      const startTime = performance.now();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text =
          typeof value === "string" ? value : new TextDecoder().decode(value);
        assistantMessage += text;
        updateCounter++;

        const { displayContent, reasoning } =
          processMessageContent(assistantMessage);

        // Throttle updates to prevent excessive re-renders during streaming
        if (
          displayContent !== lastDisplayContent &&
          (updateCounter % UPDATE_THROTTLE === 0 || done)
        ) {
          lastDisplayContent = displayContent;

          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: displayContent,
              reasoning: reasoning || "",
            };
            return newMessages;
          });
        }
      }

      const endTime = performance.now();
      // Final update to ensure we have the complete message
      const { displayContent, reasoning } =
        processMessageContent(assistantMessage);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: displayContent,
          reasoning: reasoning || "",
          startTime: startTime,
          endTime: endTime,
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
  };

  const handleModelChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      event.preventDefault();
      const target = event.target as HTMLSelectElement;
      const model = target.value;
      setModel(model);
    },
    []
  );

  const handleCopyResponse = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Error copying response:", error);
    }
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        setIsUploadingImages(true);
        try {
          const file = event.target.files;
          const fileArray = Array.from(file);

          if (fileArray.length > 5) {
            alert("You can only upload a maximum of 5 images at a time.");
            event.target.value = ""; 
            return;
          }
          const validFiles = fileArray.filter((f) => {
            return (
              f.type.startsWith("image/") ||
              (f.type.startsWith("application/pdf") && checkFileSize(f))
            );
          });
          if (validFiles.length == 0) {
            alert("No valid image files selected.");
            event.target.value = ""; 
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
          event.target.value = ""; 
        } catch (error) {
          console.error("Error uploading images:", error);
          alert("Error uploading images. Please try again.");
        } finally {
          setIsUploadingImages(false);
        }
      }
    },
    []
  );

  const checkFileSize = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      return false;
    }
    return true;
  }, []);

  return (
    <div className="flex flex-col h-[calc(100dvh-10px)] relative">
      {/* Delete Button */}
      <div className="absolute top-0 right-0 m-4 z-20">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-48">
        <MessagesContainer
          messages={messages}
          model={model}
          onCopyResponse={handleCopyResponse}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Form */}
      <div className="absolute bottom-0 lg:bottom-2 left-0 bg-neutral-900/20 backdrop-blur-2xl max-w-full w-full lg:w-1/2 rounded-t-xl lg:rounded-xl p-2 lg:translate-x-1/2  z-50 ">
        <form onSubmit={handleSubmit}>
          <ImagePreview images={images} onRemove={removeImage} />
          <textarea
            ref={inputRef}
            className="w-full bg-neutral-900/50 rounded-t-xl text-white outline-none resize-none p-3 text-base placeholder-gray-300 placeholder:opacity-50 backdrop-blur-2xl"
            rows={3}
            placeholder="Type your message..."
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
                className=" text-white rounded-lg px-4 h-full py-2 outline-none max-w-md w-full text-sm"
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
                  className="px-4 h-full py-2 rounded-lg text-white hover:bg-cyan-300 transition-colors duration-300 hover:text-black cursor-pointer"
                  title="Upload file"
                  htmlFor="fileInput"
                >
                  <input
                    name="file"
                    type="file"
                    accept="image/png, application/pdf, image/jpeg, image/jpg"
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileChange}
                    multiple
                  />
                  <FaUpload size={18} />
                </label>
              )}

              <button
                className="  px-4 h-full py-2 rounded-lg text-white hover:bg-amber-300 transition-colors duration-300 hover:text-black"
                onClick={() => scrollToBottom()}
                title="Scroll to bottom"
              >
                <FaArrowCircleDown size={18} />
              </button>
              <button
                type="submit"
                disabled={isLoading || isUploadingImages}
                className={`${
                  isLoading || isUploadingImages
                    ? "bg-teal-700"
                    : " hover:bg-teal-600"
                } text-white rounded-lg px-4 h-full py-2 transition-colors duration-300 `}
                title={
                  isUploadingImages ? "Waiting for images to upload..." : ""
                }
              >
                {isLoading ? (
                  "..."
                ) : isUploadingImages ? (
                  "⏳"
                ) : (
                  <FaArrowCircleRight size={18} />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
