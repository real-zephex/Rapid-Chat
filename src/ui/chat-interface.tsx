"use client";
import { useModel } from "@/context/ModelContext";
import { useSidebar } from "@/context/SidebarContext";
import { cancelModelRun } from "@/models";
import Whisper from "@/models/groq/whisper";
import { generationManager } from "@/utils/generationManager";
import {
  addTabs,
  deleteChat,
  deleteTab,
  retrieveChats,
  saveChats,
} from "@/utils/indexedDB";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  FaArrowCircleDown,
  FaArrowCircleRight,
  FaStop,
  FaUpload,
} from "react-icons/fa";
import { ImCloudUpload } from "react-icons/im";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { v4 as uuidv4 } from "uuid";
import AudioRecord from "./chat-components/AudioRecord";
import ImagePreview from "./chat-components/ImagePreview";
import MessageComponent from "./chat-components/MessageComponent";
import ExamplePromptsConstructors from "./example-prompts";
import ModelSelector from "./model-selector/selector";

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: { mimeType: string; data: Uint8Array }[];
  reasoning?: string;
  startTime?: number;
  endTime?: number;
  cancelled?: boolean;
};

const MessagesContainer = memo(
  ({
    messages,
    model,
    onCopyResponse,
    onBranchFromMessage,
    messageRefs,
  }: {
    messages: Message[];
    model: string;
    onCopyResponse: (content: string) => void;
    onBranchFromMessage: (index: number) => void;
    messageRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  }) => {
    return (
      <div className="container mx-auto max-w-full lg:max-w-[60%]">
        {messages.map((message, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) {
                messageRefs.current.set(index, el);
              } else {
                messageRefs.current.delete(index);
              }
            }}
          >
            <MessageComponent
              message={message}
              index={index}
              model={model}
              onCopyResponse={onCopyResponse}
              onBranchFromMessage={onBranchFromMessage}
            />
          </div>
        ))}
      </div>
    );
  },
);
MessagesContainer.displayName = "MessagesContainer";

const ChatInterface = ({ id }: { id: string }) => {
  const { refreshTitles } = useSidebar();
  const { selectedModel, models } = useModel();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [cancelId, setCancelId] = useState<string>("");
  const [voiceLoading, setVoiceLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Use ref for input to prevent re-renders on every keystroke
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea shortcut
  useHotkeys("shift+esc", (e) => {
    e.preventDefault();
    inputRef.current?.focus();
  });

  // Stop generation shortcut
  useHotkeys("esc", (e) => {
    if (isLoading) {
      e.preventDefault();
      handleStopGeneration();
    }
  });

  // Images
  const [images, setImages] = useState<
    { mimeType: string; data: Uint8Array }[]
  >([]);

  const router = useRouter();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToMessage = useCallback((index: number) => {
    const messageElement = messageRefs.current.get(index);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
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

        // Check if there's an ongoing generation for this chat
        if (generationManager.isGenerating(id)) {
          setIsLoading(true);
          const abortId = generationManager.getAbortId(id);
          if (abortId) {
            setCancelId(abortId);
          }
        }
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setIsLoadingChats(false);
      }
    };
    loadChats();
  }, [id]);

  // Subscribe to generation updates when component mounts
  useEffect(() => {
    if (generationManager.isGenerating(id)) {
      generationManager.subscribeToUpdates(id, (updatedMessages) => {
        setMessages(updatedMessages);
        setIsLoading(true);
      });
    }

    return () => {
      // Unsubscribe and cancel generation when component unmounts (user switches tabs)
      generationManager.unsubscribeFromUpdates(id);
      if (isLoading && cancelId) {
        cancelModelRun(cancelId);
      }
    };
  }, [id]);

  // Removed problematic offline/online handlers - they set isLoading incorrectly
  // The app handles network errors through the ModelProvider error handling

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleStopGeneration = useCallback(async () => {
    if (cancelId) {
      // Immediately update UI state
      setIsLoading(false);

      // Cancel the model run
      await cancelModelRun(cancelId);

      // Clear cancel ID
      setCancelId("");

      // Fetch the latest messages to ensure the UI is updated
      const updatedMessages = await retrieveChats(id);
      setMessages(updatedMessages);
    }
  }, [cancelId, id]);

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
      ...(images.length > 0 && { images: [...images] }),
    };

    if (messages.length === 0) {
      await addTabs(id);
      refreshTitles();
    }

    const updatedMessages = [...messages, userMessage];
    await saveChats(id, updatedMessages);
    setMessages(updatedMessages);

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
    }
    setInputValue("");

    setIsLoading(true);
    const abortId = uuidv4(); // Generate unique ID for each message
    setCancelId(abortId);

    const imagesToSend = [...images];
    setImages([]);

    // Start generation in background
    generationManager
      .startGeneration(
        id,
        input,
        selectedModel,
        imagesToSend,
        abortId,
        updatedMessages,
        (updatedMessages) => {
          setMessages(updatedMessages);
        },
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleCopyResponse = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Error copying response:", error);
    }
  }, []);

  const handleBranchFromMessage = useCallback(
    async (messageIndex: number) => {
      // Create a new chat ID for the branch
      const branchId = uuidv4();

      // Get messages up to and including the selected message
      const branchMessages = messages.slice(0, messageIndex + 1);

      // Save the branch messages
      await saveChats(branchId, branchMessages);
      await addTabs(branchId);

      // Navigate to the new branch
      router.push(`/chat/${branchId}`);

      // Refresh sidebar titles
      refreshTitles();
    },
    [messages, router, refreshTitles],
  );

  const checkFileSize = useCallback((file: File) => {
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
            }),
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
    [],
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
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
          }),
        );

        setImages((prev) => [...prev, ...arraizedImages]);
      } catch (error) {
        console.error("Error handling paste:", error);
        alert("Error handling paste. Please try again.");
      }
    },
    [checkFileSize],
  );

  const handleDragAndDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      try {
        console.info("Drag and Drop detected.");
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
            uploads.push(file);
          }
        }

        const arraizedImages = await Promise.all(
          uploads.map(async (file) => {
            const buffer = await file.arrayBuffer();
            return {
              mimeType: file.type,
              data: new Uint8Array(buffer),
            };
          }),
        );

        setImages((prev) => [...prev, ...arraizedImages]);
      } catch (error) {
        console.error("Error handling drag and drop:", error);
        alert("Error handling drag and drop. Please try again.");
      }
    },
    [checkFileSize],
  );

  const setAudio = async (file: Blob | null) => {
    const input = inputRef.current!;
    setVoiceLoading(true);
    try {
      if (file === null) {
        input.value =
          "Please make sure that the audio is larger than 2 seconds and less than 3 minutes long. This feature costs significantly more so please use it responsibly.";
        handleSize();
      } else {
        input.value = "Transcribing audio...";
        const text = await Whisper(file);
        input.value = text.toString();
        handleSize();
      }
    } catch (error) {
      console.error("Error occured while trying to transcribe audio.");
      input.value = "";
    } finally {
      setVoiceLoading(false);
    }
  };

  // Delete chat hotkey
  useHotkeys("ctrl+shift+backspace", (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChatFunc();
  });

  useHotkeys("delete", (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChatFunc();
  });

  function deleteChatFunc() {
    deleteChat(id);
    deleteTab(id);
    refreshTitles();
    router.push("/chat");
  }

  function onClickExample(text: string) {
    const input = inputRef.current;
    if (input) {
      input.value = text;
      input.focus();
    }
  }

  function handleSize(): void {
    const ref = inputRef.current;
    if (ref) {
      ref.style.height = "0px";
      ref.style.height = ref.scrollHeight + "px";
      setInputValue(ref.value);
    }
  }

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-300">No chat ID provided</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-[calc(100dvh-10px)] overflow-y-hidden bg-dark relative"
      onDrop={handleDragAndDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Minimap */}
      {messages.length > 0 && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col gap-2 bg-[#2f2f2f]/60 backdrop-blur-sm p-2 rounded-full max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {messages
            .map((message, index) => ({ message, index }))
            .filter(({ message }) => message.role === "user")
            .map(({ index }) => (
              <button
                key={index}
                onClick={() => scrollToMessage(index)}
                className="w-2 h-2 rounded-full bg-gray-500 hover:bg-gray-300 transition-all duration-200 cursor-pointer"
                title={`Jump to query ${Math.floor(index / 2) + 1}`}
              />
            ))}
        </div>
      )}

      {/* Scroll Button */}
      {messages.length > 0 && (
        <button
          className="fixed right-6 bottom-28 p-2 rounded-full bg-[#2f2f2f] text-gray-300 hover:bg-[#3f3f3f] transition-colors shadow-lg hidden md:block"
          onClick={() => scrollToBottom()}
          title="Scroll to bottom"
        >
          <FaArrowCircleDown size={20} />
        </button>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingChats ? (
          <div className="flex items-center justify-center h-full gap-3">
            <div className="animate-spin rounded-full size-5 border-2 border-gray-500 border-t-white"></div>
            <p className="text-gray-400 text-sm">
              Loading your conversation...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-full max-w-3xl mx-auto mb-8">
              <h1 className="text-4xl font-semibold text-center text-white/90 mb-12">
                What can I help with?
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <ExamplePromptsConstructors
                  text="Write a short story about a robot discovering emotions."
                  onClick={onClickExample}
                />
                <ExamplePromptsConstructors
                  text="Help me outline a sci-fi novel set in a post-apocalyptic world."
                  onClick={onClickExample}
                />
                <ExamplePromptsConstructors
                  text="Create a character profile for a complex villain with sympathetic motives."
                  onClick={onClickExample}
                />
                <ExamplePromptsConstructors
                  text="Give me 5 creative writing prompts for flash fiction."
                  onClick={onClickExample}
                />
              </div>
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
            onBranchFromMessage={handleBranchFromMessage}
            messageRefs={messageRefs}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Form */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-2 pt-2 relative">
        <form onSubmit={handleSubmit} className="relative">
          <ImagePreview images={images} onRemove={removeImage} />
          <div className="relative bg-textarea rounded-xl shadow-lg border border-gray-700/50 p-2">
            <textarea
              ref={inputRef}
              className={`w-full bg-transparent text-white outline-none resize-none px-4 py-3 placeholder-gray-500 text-base disabled:opacity-50 max-h-60 ${
                isLoading ? "animate-pulse" : ""
              }`}
              rows={1}
              onInput={handleSize}
              disabled={isLoadingChats || voiceLoading || isLoading}
              placeholder="Message Rapid-Chat"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                } else if (e.ctrlKey && e.shiftKey && e.key === "Backspace") {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteChatFunc();
                }
              }}
            ></textarea>
            <div className="flex justify-between items-center px-2 pb-1 mt-2">
              <div className="flex items-center">
                <ModelSelector />
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-lg text-gray-400 hover:bg-[#3f3f3f] transition-colors"
                  onClick={() => deleteChatFunc()}
                  title="Delete chat"
                  type="button"
                >
                  <RiDeleteBin2Fill size={18} />
                </button>
                <AudioRecord setAudio={setAudio} />
                {models.find(
                  (item) => item.image === true && item.code === selectedModel,
                ) && (
                  <label
                    className="p-2 rounded-lg text-gray-400 hover:bg-[#3f3f3f] transition-colors cursor-pointer"
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
                    <FaUpload size={16} />
                  </label>
                )}
                {/* Stop button - separate from submit */}
                {isLoading && (
                  <button
                    type="button"
                    className="p-2 rounded-lg text-gray-400 hover:bg-[#3f3f3f] transition-colors"
                    title="Stop generation (Esc)"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStopGeneration();
                    }}
                  >
                    <FaStop size={20} />
                  </button>
                )}
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={
                    isLoading || isUploadingImages || !inputValue.trim()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    isLoading || isUploadingImages || !inputValue.trim()
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-white bg-white/10 hover:bg-white/20"
                  }`}
                  title={
                    isUploadingImages
                      ? "Waiting for images to upload..."
                      : isLoading
                        ? "Generation in progress..."
                        : !inputValue.trim()
                          ? "Type a message to send"
                          : "Send message (Enter)"
                  }
                >
                  {isUploadingImages ? (
                    <ImCloudUpload size={20} />
                  ) : (
                    <FaArrowCircleRight size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
          {isLoading && (
            <div className="absolute -top-10 left-4 flex items-center gap-2 text-xs text-gray-400 bg-[#2f2f2f] px-3 py-1.5 rounded-lg">
              <div className="animate-spin rounded-full size-3 border-2 border-gray-500 border-t-white"></div>
              <p>Generating...</p>
            </div>
          )}
        </form>
        <p className="text-center text-xs text-gray-500 mt-2 px-4">
          Rapid-Chat can make mistakes.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
