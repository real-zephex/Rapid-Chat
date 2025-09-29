"use client";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  ChangeEvent,
} from "react";
import {
  addTabs,
  deleteChat,
  deleteTab,
  retrieveChats,
  saveChats,
} from "@/utils/indexedDB";
import {
  FaArrowCircleDown,
  FaArrowCircleRight,
  FaUpload,
} from "react-icons/fa";
import ModelProvider, { cancelModelRun } from "@/models";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { processMessageContent } from "@/utils/responseCleaner";
import { useRouter } from "next/navigation";
import ImagePreview from "./chat-components/ImagePreview";
import MessageComponent from "./chat-components/MessageComponent";
import { useHotkeys } from "react-hotkeys-hook";
import AudioRecord from "./chat-components/AudioRecord";
import Whisper from "@/models/groq/whisper";
import { ImCloudUpload } from "react-icons/im";
import { ModelInformation } from "@/utils/model-list";
import { useSidebar } from "@/context/SidebarContext";
import ExamplePromptsConstructors from "./example-prompts";
import ModelSelector from "./model-selector/selector";
import { useModel } from "@/context/ModelContext";
import { v4 as uuidv4 } from "uuid";

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
      <div className="container mx-auto max-w-full lg:max-w-[60%]">
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

  const { refreshTitles } = useSidebar();
  const { selectedModel, models } = useModel();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const abortRef = useRef<boolean>(false);
  const runIdRef = useRef<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);


  useHotkeys("shift+esc", (e) => {
    e.preventDefault();
    inputRef.current?.focus();
  });

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

  // Fetching models here
  useEffect(() => {
    const loadChats = async () => {
      setIsLoadingChats(true);
      try {
        const chats = await retrieveChats(id);
        setMessages(chats);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setIsLoadingChats(false);
      }
    };
    loadChats();
  }, [id]);

  useEffect(() => {
    const handleOffline = () => setIsLoading(true);
    const handleOnline = () => setIsLoading(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const stopStreaming = useCallback(async () => {
    try {
      abortRef.current = true;
      const runId = runIdRef.current;
      if (readerRef.current) {
        await readerRef.current.cancel("User interrupted");
      }
      if (runId) {
        // Best-effort server-side abort
        await cancelModelRun(runId);
      }
    } catch (err) {
      console.error("Error cancelling stream:", err);
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      runIdRef.current = null;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = inputRef.current?.value.trim() || "";
    if (!input || isLoading || isUploadingImages) return;

    if (images.length > 5) {
      alert("You can only upload a maximum of 5 files at a time.");
      setImages([]);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      ...(images.length > 0 && { images: [...images] }), // Include images if any
    };
    if (messages.length === 0) {
      await addTabs(id);
      refreshTitles();
    }
    saveChats(id, [...messages, userMessage]);
    setMessages((prev) => [...prev, userMessage]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setIsLoading(true);
    setIsStreaming(true);
    abortRef.current = false;

    try {
      const prevChats = await retrieveChats(id);
      const runId = uuidv4();
      runIdRef.current = runId;
      const response = await ModelProvider({
        type: selectedModel,
        query: input,
        chats: prevChats.map((msg) => {
          return {
            role: msg.role,
            content: msg.content,
          };
        }),
        imageData: images,
        runId,
      });
      setImages([]);
      if (!(response instanceof ReadableStream)) {
        throw new Error("Expected a ReadableStream response");
      }

      const reader = response.getReader();
      readerRef.current = reader;

      let assistantMessage = "";
      let lastDisplayContent = "";
      let updateCounter = 0;
      const UPDATE_THROTTLE = 1;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Waiting for first tokens, please wait!",
        },
      ]);

      const startTime = performance.now();
      while (true) {
        if (abortRef.current) break;
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
      setIsStreaming(false);
      readerRef.current = null;
      runIdRef.current = null;
    }
  };

  // const handleModelChange = useCallback(
  //   (event: React.ChangeEvent<HTMLSelectElement>) => {
  //     event.preventDefault();
  //     const target = event.target as HTMLSelectElement;
  //     const model = target.value;
  //     setModel(model);
  //   },
  //   []
  // );

  const handleCopyResponse = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Error copying response:", error);
    }
  }, []);

  const checkFileSize = useCallback((file: File) => {
    // wanted size in MB * bytes * kilobytes
    if (file.size > 10 * 1024 * 1024) {
      return false;
    }
    return true;
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        setIsUploadingImages(true);
        try {
          const file = event.target.files;
          const fileArray = Array.from(file);

          if (fileArray.length > 5) {
            alert("You can only upload a maximum of 5 files at a time.");
            event.target.value = "";
            return;
          }
          const validFiles = fileArray.filter((f) => {
            return (
              (f.type.startsWith("image/") || f.type === "application/pdf") &&
              checkFileSize(f)
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

  // Function to handle paste
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      // Allow native paste behavior in textarea
      try {
        if (e.target === inputRef.current) {
          return;
        }

        console.info("Pasting content from clipboard...");

        e.preventDefault();

        if (!e.clipboardData) {
          console.warn("No clipboard data available.");
          return;
        }

        const files: File[] = [];
        const items = e.clipboardData.items;
        if (!items) {
          console.warn("No items in clipboard data.");
          return;
        }
        console.info(`${items.length} items found in clipboard`);
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file && checkFileSize(file)) {
              files.push(file);
            }
          }
        }

        if (files.length === 0) {
          console.warn("No valid image files found in clipboard.");
          return;
        }

        console.info(`Processing ${files.length} valid images...`);
        const arraizedImages = await Promise.all(
          files.map(async (file) => {
            const buffer = await file.arrayBuffer();
            return {
              mimeType: file.type,
              data: new Uint8Array(buffer),
            };
          })
        );

        setImages((prev) => [...prev, ...arraizedImages]);
      } catch (error) {
        console.error("Error handling paste:", error);
        alert("Error handling paste. Please try again.");
      }
    },
    [checkFileSize]
  );

  // Function to handle Drag and Drop
  const handleDragAndDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      try {
        console.info("Drag and Drop deteched.");
        e.preventDefault();

        const files = e.dataTransfer.files;
        if (!files || files.length === 0) {
          console.warn("No files dropped.");
          return;
        }

        const uploads: File[] = [];
        for (const file of files) {
          if (
            (file.type.startsWith("image/") ||
              file.type === "application/pdf") &&
            checkFileSize(file)
          ) {
            if (checkFileSize(file)) {
              uploads.push(file);
            }
          }
        }

        const arraizedImages = await Promise.all(
          uploads.map(async (file) => {
            const buffer = await file.arrayBuffer();
            return {
              mimeType: file.type,
              data: new Uint8Array(buffer),
            };
          })
        );

        setImages((prev) => [...prev, ...arraizedImages]);
      } catch (error) {
        console.error("Error handling drag and drop:", error);
        alert("Error handling drag and drop. Please try again.");
      }
    },
    [checkFileSize]
  );

  const setAudio = async (file: Blob | null) => {
    const input = inputRef.current!;

    if (file === null) {
      input.value =
        "Please make sure that the audio is larger than 2 seconds and less than 3 minutes long. This feature costs significantly more so please use it responsibly.";
    } else {
      const text = await Whisper(file);
      input.value = text.toString();

      //   text || "Sorry but this feature is currently disabled.";
      // inputRef.current.focus();
      // const url = URL.createObjectURL(file);
    }
  };

  // Delete chat hotkey
  useHotkeys("ctrl+shift+backspace", (e) => {
    e.preventDefault();
    deleteChatFunc();
  });

  function deleteChatFunc() {
    deleteChat(id);
    deleteTab(id);
    refreshTitles();
    router.push("/chat");
  }

  function onClickExample(text: string) {
    console.log(text);
    const input = inputRef.current;
    if (input) {
      input.value = text;
      input.focus();
    }
  }

  return (
    <div
      className="flex flex-col h-[calc(100dvh-10px)] relative"
      onDrop={handleDragAndDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <ModelSelector />
      {/* Delete Button */}
      <div className="absolute top-0 right-0 m-4 z-20">
        <button
          className="bg-bg/50 p-2 rounded-lg active:scale-95 transition-transform duration-200 hover:bg-bg/70 hover:shadow-lg shadow-gray-500/20"
          onClick={() => deleteChatFunc()}
        >
          <RiDeleteBin2Fill size={20} color="red" />
        </button>
      </div>

      {/* Scroll Button */}
      <button
        className="fixed right-0 bottom-0 m-4 rounded-full text-white hover:bg-amber-300 transition-colors duration-300 hover:text-black hidden md:block"
        onClick={() => scrollToBottom()}
        title="Scroll to bottom"
      >
        <FaArrowCircleDown size={16} />
      </button>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-6 ">
        {isLoadingChats ? (
          <div className="flex items-center justify-center h-full gap-4">
            <div className="animate-spin rounded-full size-5 border-b-2 border-white "></div>
            <p className="text-gray-300">Loading your conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="mx-auto w-full md:max-w-[60%] p-6 md:p-8">
            <h2 className="font-semibold text-2xl">
              How can I help you today?
            </h2>
            <div className="bborder-0 h-px bg-gradient-to-r from-gray-400/60 to-transparent my-4" />
            <div className="flex flex-col gap-2 items-center">
              <ExamplePromptsConstructors
                text="Write a short story about a robot discovering emotions."
                onClick={onClickExample}
              />
              <ExamplePromptsConstructors
                text="Help me outline a sci-fi novel set in a post-apocalyptic world."
                onClick={onClickExample}
              />{" "}
              <ExamplePromptsConstructors
                text="Create a character profile for a complex villain with sympathetic motives."
                onClick={onClickExample}
              />{" "}
              <ExamplePromptsConstructors
                text="Give me 5 creative writing prompts for flash fiction."
                onClick={onClickExample}
              />
            </div>
          </div>
        ) : (
          <MessagesContainer
            messages={messages}
            model={
              models.find((m) => m.code === selectedModel)?.name ||
              "Unknown Model"
            }
            onCopyResponse={handleCopyResponse}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Form */}
      <div className="w-full md:max-w-[60%] mx-auto p-2 relative">
        <form onSubmit={handleSubmit}>
          <ImagePreview images={images} onRemove={removeImage} />
          <textarea
            ref={inputRef}
            className={`w-full bg-neutral-800 rounded-t-xl text-white outline-none resize-none p-2 placeholder-gray-300 placeholder:opacity-50 placeholder:text-sm disabled:bg-neutral-900 text-sm ${
              isLoading ? "animate-pulse" : ""
            }`}
            rows={3}
            disabled={isLoadingChats}
            placeholder="Ask anything..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          ></textarea>
          {isLoading && (
            <div className="absolute -top-1 left-0 flex items-center gap-2 text-xs text-black bg-lime-300 px-2 rounded-xl animate-bounce">
              <div className="animate-spin rounded-full size-2 border-b-2 border-black "></div>
              <p>Generating response...</p>
            </div>
          )}
          <div className="absolute -top-1 right-0 bg-neutral-300/30 rounded-xl flex flex-row items-center gap-2">
            <AudioRecord setAudio={setAudio} />
            {models.find(
              (item) => item.image === true && item.code === selectedModel
            ) ? (
              <label
                className="h-full p-2 rounded-full text-white hover:bg-cyan-300 transition-colors duration-300 hover:text-black cursor-pointer"
                title="Upload file"
                htmlFor="fileInput"
              >
                <input
                  name="file"
                  type="file"
                  accept={`image/png, image/jpeg, image/jpg, ${
                    models.find((i) => i.code === selectedModel)?.pdf
                      ? "application/pdf"
                      : ""
                  }`}
                  className="hidden"
                  id="fileInput"
                  onChange={handleFileChange}
                  multiple
                />
                <FaUpload size={14} />
              </label>
            ) : null}
            {isStreaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full px-3 py-1 text-xs"
                title="Stop generation"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || isUploadingImages || isLoadingChats}
                className={`${
                  isLoading || isUploadingImages
                    ? "bg-teal-700"
                    : " hover:bg-teal-600"
                } text-white rounded-full p-2 h-full transition-colors duration-300 `}
                title={
                  isUploadingImages ? "Waiting for images to upload..." : "Send"
                }
              >
                {isLoading ? (
                  <ImCloudUpload size={14} />
                ) : isUploadingImages ? (
                  "⏳"
                ) : (
                  <FaArrowCircleRight size={14} />
                )}
              </button>
            )}
          </div>
          {/* 
          
           
            

            </div>
          </div> */}

          {/* <div className="lg:hidden flex flex-row items-center gap-2 text-xs px-2">
            <CiSquareInfo size={20} color="cyan" />
            <p className="line-clamp-1">
              {models.find((i) => i.code === model)?.description ||
                "general tasks"}
            </p>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
