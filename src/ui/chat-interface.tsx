"use client";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  ChangeEvent,
  useContext,
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
import ModelProvider from "@/models";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { processMessageContent } from "@/utils/responseCleaner";
import { useRouter } from "next/navigation";
import ImagePreview from "./chat-components/ImagePreview";
import MessageComponent from "./chat-components/MessageComponent";
import { CiSquareInfo } from "react-icons/ci";
import { useHotkeys } from "react-hotkeys-hook";
import AudioRecord from "./chat-components/AudioRecord";
import Whisper from "@/models/groq/whisper";
import { ImCloudUpload } from "react-icons/im";
import modelDescriptionMaker from "@/utils/model-list";
import { useSidebar } from "@/context/SidebarContext";
import ExamplePromptsConstructors from "./example-prompts";

// const modelInformation: Record<string, string> = Object.fromEntries(
//   models.map((model) => [model.code, model.description])
// );

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

  const [model, setModel] = useState<string>("llama_scout");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<
    {
      name: string;
      code: string;
      image: boolean;
      pdf: boolean;
      description: string;
      type: "reasoning" | "conversational" | "general";
    }[]
  >([]);

  useEffect(() => {
    async function getModels() {
      setModelsLoading(true);
      const models = await modelDescriptionMaker();
      setModels(models);
      setModelsLoading(false);
    }

    getModels();
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use ref for input to prevent re-renders on every keystroke
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

  // useEffect(() => {
  //   if (images.length > 0) {
  //     setModel("scout");
  //   }
  // }, [model, images]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, []);

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
      setImages([]);
      if (!(response instanceof ReadableStream)) {
        throw new Error("Expected a ReadableStream response");
      }

      const reader = response.getReader();

      let assistantMessage = "";
      let lastDisplayContent = "";
      let updateCounter = 0;
      const UPDATE_THROTTLE = 1; // Update UI every 3 chunks for optimal balance

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Waiting for first tokens, please wait!",
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
      {/* Delete Button */}
      <div className="absolute top-0 right-0 m-4 z-20">
        <button
          className="bg-bg/50 p-2 rounded-lg active:scale-95 transition-transform duration-200 hover:bg-bg/70 hover:shadow-lg shadow-gray-500/20"
          onClick={() => deleteChatFunc()}
        >
          <RiDeleteBin2Fill size={20} color="red" />
        </button>
      </div>

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
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-300">Loading your conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="mx-auto w-full md:max-w-[60%] p-6 md:p-8">
            {/* <div className="text-center max-w-2xl mx-auto px-4">
              <div className="mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    💡 Ask Questions
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Get help with coding, explanations, or any topic you&apos;re
                    curious about
                  </p>
                </div>

                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    🖼️ Share Images
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Upload images or paste them directly for visual analysis and
                    questions
                  </p>
                </div>

                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    🎤 Voice Input
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Use the microphone button to speak your questions instead of
                    typing
                  </p>
                </div>

                <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    ⚡ Multiple Models
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Choose from various AI models optimized for different tasks
                  </p>
                </div>
              </div>

              <div className="text-gray-400 text-sm">
                <p className="mb-2">
                  <strong>Pro tip:</strong> Use{" "}
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">
                    Shift + Esc
                  </kbd>{" "}
                  to quickly focus the input field
                </p>
                <p>
                  <strong>Quick delete:</strong> Use{" "}
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">
                    Ctrl + Shift + Backspace
                  </kbd>{" "}
                  to delete this chat
                </p>
              </div>
            </div> */}
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
              models.find((m) => m.code === model)?.name || "Unknown Model"
            }
            onCopyResponse={handleCopyResponse}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Form */}
      <div className="w-full md:max-w-[60%] mx-auto p-2 z-50">
        <form onSubmit={handleSubmit}>
          <ImagePreview images={images} onRemove={removeImage} />
          <textarea
            ref={inputRef}
            className="w-full bg-neutral-800 rounded-t-xl text-white outline-none resize-none p-2 placeholder-gray-300 placeholder:opacity-50 placeholder:text-sm disabled:bg-neutral-900 text-sm"
            rows={3}
            disabled={modelsLoading || isLoadingChats}
            placeholder="Ask anything..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          ></textarea>

          <div className="flex justify-between items-center gap-2">
            {models.length > 0 && (
              <div className="flex flex-row items-center gap-2">
                <select
                  className="text-white rounded-lg px-3 py-1 outline-none max-w-sm w-full text-xs bg-neutral-800/90 border border-neutral-700 hover:bg-neutral-700 focus:ring-2 focus:ring-cyan-500 transition-all duration-200 shadow-md"
                  value={model}
                  onChange={handleModelChange}
                >
                  <optgroup label="Conversational">
                    {models
                      .filter((m) => m.type === "conversational")
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="General">
                    {models
                      .filter((m) => m.type === "general")
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.name}
                        </option>
                      ))}
                  </optgroup>

                  <optgroup label="Reasoning">
                    {models
                      .filter((m) => m.type === "reasoning")
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            )}
            <div className="hidden lg:flex flex-row items-center gap-2 text-xs px-2">
              <CiSquareInfo size={20} color="cyan" />
              <p className="line-clamp-1">
                {models.find((i) => i.code === model)?.description ||
                  "Loading models..."}
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <AudioRecord setAudio={setAudio} />
              {models.find(
                (item) => item.image === true && item.code === model
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
                      models.find((i) => i.code === model)?.pdf
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
              ) : (
                <></>
              )}

              <button
                type="submit"
                disabled={
                  isLoading ||
                  isUploadingImages ||
                  modelsLoading ||
                  isLoadingChats
                }
                className={`${
                  isLoading || isUploadingImages
                    ? "bg-teal-700"
                    : " hover:bg-teal-600"
                } text-white rounded-full p-2 h-full transition-colors duration-300 `}
                title={
                  isUploadingImages ? "Waiting for images to upload..." : ""
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
            </div>
          </div>

          <div className="lg:hidden flex flex-row items-center gap-2 text-xs px-2">
            <CiSquareInfo size={20} color="cyan" />
            <p className="line-clamp-1">
              {models.find((i) => i.code === model)?.description ||
                "general tasks"}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
