"use client";

import { useModel } from "@/context/ModelContext";
import { useSidebar } from "@/context/SidebarContext";
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
  useMemo,
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

type Pane = "primary" | "secondary";

interface ChatInterfaceProps {
  id: string;
  pane?: Pane;
  isSplitView?: boolean;
  isActivePane?: boolean;
  onActivatePane?: () => void;
  onDeleteChat?: () => void;
}

const CHAT_MODEL_PREFERENCES_KEY = "rapid-chat-model-preferences";

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

const MessagesContainer = memo(
  ({
    messages,
    model,
    onCopyResponse,
    onBranchFromMessage,
    messageRefs,
    isSplitView,
  }: {
    messages: Message[];
    model: string;
    onCopyResponse: (content: string) => Promise<boolean>;
    onBranchFromMessage: (index: number) => void;
    messageRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
    isSplitView: boolean;
  }) => {
    return (
      <div
        className={`mx-auto w-full ${
          isSplitView ? "max-w-none" : "max-w-5xl"
        }`}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            ref={(element) => {
              if (element) {
                messageRefs.current.set(index, element);
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
              isSplitView={isSplitView}
            />
          </div>
        ))}
      </div>
    );
  },
);
MessagesContainer.displayName = "MessagesContainer";

const ChatInterface = ({
  id,
  pane = "primary",
  isSplitView = false,
  isActivePane = true,
  onActivatePane,
  onDeleteChat,
}: ChatInterfaceProps) => {
  const { refreshTitles } = useSidebar();
  const { selectedModel: defaultSelectedModel, models } = useModel();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [images, setImages] = useState<{ mimeType: string; data: Uint8Array }[]>(
    [],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();
  const paneLabel = pane === "primary" ? "Left" : "Right";
  const fileInputId = `chat-file-input-${pane}-${id}`;

  const persistModelPreference = useCallback(
    (modelCode: string) => {
      try {
        const raw = localStorage.getItem(CHAT_MODEL_PREFERENCES_KEY);
        const parsed = raw
          ? (JSON.parse(raw) as Record<string, string>)
          : ({} as Record<string, string>);

        parsed[id] = modelCode;
        localStorage.setItem(CHAT_MODEL_PREFERENCES_KEY, JSON.stringify(parsed));
      } catch (error) {
        console.error("Failed to persist model preference:", error);
      }
    },
    [id],
  );

  const handleModelChange = useCallback(
    (modelCode: string) => {
      setSelectedModel(modelCode);
      persistModelPreference(modelCode);
    },
    [persistModelPreference],
  );

  useEffect(() => {
    if (models.length === 0) {
      return;
    }

    const fallbackModelCode = models.some(
      (model) => model.code === defaultSelectedModel,
    )
      ? defaultSelectedModel
      : models[0].code;

    let preferredModelCode = fallbackModelCode;

    try {
      const raw = localStorage.getItem(CHAT_MODEL_PREFERENCES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        const savedModelCode = parsed[id];

        if (
          savedModelCode &&
          models.some((model) => model.code === savedModelCode)
        ) {
          preferredModelCode = savedModelCode;
        }
      }
    } catch (error) {
      console.error("Failed to read model preference:", error);
    }

    setSelectedModel(preferredModelCode);
  }, [defaultSelectedModel, id, models]);

  const selectedModelInfo = useMemo(
    () => models.find((item) => item.code === selectedModel),
    [models, selectedModel],
  );
  const supportsImageUploads = Boolean(selectedModelInfo?.image);
  const supportsPdfUploads = Boolean(selectedModelInfo?.pdf);
  const uploadAccept = [
    supportsImageUploads ? "image/png,image/jpeg,image/jpg" : "",
    supportsPdfUploads ? "application/pdf" : "",
  ]
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    if (images.length === 0) {
      return;
    }

    const filteredImages = images.filter((file) => {
      if (file.mimeType.startsWith("image/")) {
        return supportsImageUploads;
      }

      if (file.mimeType === "application/pdf") {
        return supportsPdfUploads;
      }

      return false;
    });

    if (filteredImages.length !== images.length) {
      setImages(filteredImages);
    }
  }, [images, supportsImageUploads, supportsPdfUploads]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const scrollToMessage = useCallback((index: number) => {
    const messageElement = messageRefs.current.get(index);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((previous) => previous.filter((_, current) => current !== index));
  }, []);

  const checkFileSize = useCallback((file: File) => {
    return file.size <= 10 * 1024 * 1024;
  }, []);

  const isAttachmentSupported = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        return supportsImageUploads;
      }

      if (file.type === "application/pdf") {
        return supportsPdfUploads;
      }

      return false;
    },
    [supportsImageUploads, supportsPdfUploads],
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) {
        return;
      }

      if (!supportsImageUploads && !supportsPdfUploads) {
        alert("The selected model does not support image or PDF uploads.");
        event.target.value = "";
        return;
      }

      setIsUploadingImages(true);
      try {
        const files = Array.from(event.target.files);

        if (files.length > 5) {
          alert("You can only upload a maximum of 5 files at a time.");
          event.target.value = "";
          return;
        }

        const validFiles = files.filter(
          (file) => isAttachmentSupported(file) && checkFileSize(file),
        );

        if (validFiles.length === 0) {
          if (supportsImageUploads && !supportsPdfUploads) {
            alert("The selected model supports image uploads only.");
          } else if (!supportsImageUploads && supportsPdfUploads) {
            alert("The selected model supports PDF uploads only.");
          } else {
            alert("No valid files selected for this model.");
          }
          event.target.value = "";
          return;
        }

        const loadedFiles = await Promise.all(
          validFiles.map(async (file) => {
            const buffer = await file.arrayBuffer();
            return {
              mimeType: file.type,
              data: new Uint8Array(buffer),
            };
          }),
        );

        setImages(loadedFiles);
        event.target.value = "";
      } catch (error) {
        console.error("Error uploading files:", error);
        alert("Error uploading files. Please try again.");
      } finally {
        setIsUploadingImages(false);
      }
    },
    [
      checkFileSize,
      isAttachmentSupported,
      supportsImageUploads,
      supportsPdfUploads,
    ],
  );

  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      if (!isActivePane) {
        return;
      }

      try {
        if (event.target === inputRef.current || isEditableTarget(event.target)) {
          return;
        }

        if (!event.clipboardData) {
          return;
        }

        if (!supportsImageUploads) {
          return;
        }

        const files: File[] = [];
        const items = event.clipboardData.items;

        for (const item of items) {
          if (!item.type.startsWith("image/")) {
            continue;
          }

          const file = item.getAsFile();
          if (file && checkFileSize(file)) {
            files.push(file);
          }
        }

        if (files.length === 0) {
          return;
        }

        event.preventDefault();
        const pastedFiles = await Promise.all(
          files.map(async (file) => {
            const buffer = await file.arrayBuffer();
            return {
              mimeType: file.type,
              data: new Uint8Array(buffer),
            };
          }),
        );

        setImages((previous) => [...previous, ...pastedFiles]);
      } catch (error) {
        console.error("Error handling paste:", error);
      }
    },
    [checkFileSize, isActivePane, supportsImageUploads],
  );

  const handleDragAndDrop = useCallback(
    async (event: React.DragEvent<HTMLElement>) => {
      if (!isActivePane) {
        return;
      }

      try {
        event.preventDefault();

        if (!supportsImageUploads && !supportsPdfUploads) {
          return;
        }

        const droppedFiles = event.dataTransfer.files;
        if (!droppedFiles || droppedFiles.length === 0) {
          return;
        }

        const uploads: File[] = [];
        for (const file of droppedFiles) {
          if (isAttachmentSupported(file) && checkFileSize(file)) {
            uploads.push(file);
          }
        }

        if (uploads.length === 0) {
          return;
        }

        const loadedUploads = await Promise.all(
          uploads.map(async (file) => {
            const buffer = await file.arrayBuffer();
            return {
              mimeType: file.type,
              data: new Uint8Array(buffer),
            };
          }),
        );

        setImages((previous) => [...previous, ...loadedUploads]);
      } catch (error) {
        console.error("Error handling drag and drop:", error);
      }
    },
    [
      checkFileSize,
      isActivePane,
      isAttachmentSupported,
      supportsImageUploads,
      supportsPdfUploads,
    ],
  );

  const handleStopGeneration = useCallback(async () => {
    if (!generationManager.isGenerating(id)) {
      setIsLoading(false);
      return;
    }

    await generationManager.stopGeneration(id);
    setIsLoading(false);

    const updatedMessages = await retrieveChats(id);
    setMessages(updatedMessages);
  }, [id]);

  const handleCopyResponse = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error("Error copying response:", error);
      return false;
    }
  }, []);

  const handleBranchFromMessage = useCallback(
    async (messageIndex: number) => {
      const branchId = uuidv4();
      const branchMessages = messages.slice(0, messageIndex + 1);

      await saveChats(branchId, branchMessages);
      await addTabs(branchId);
      refreshTitles();
      router.push(`/chat/${branchId}`);
    },
    [messages, refreshTitles, router],
  );

  const deleteChatFunc = useCallback(async () => {
    await deleteChat(id);
    await deleteTab(id);
    await refreshTitles();

    if (onDeleteChat) {
      onDeleteChat();
      return;
    }

    router.push("/chat");
  }, [id, onDeleteChat, refreshTitles, router]);

  const setAudio = async (file: Blob | null) => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    setVoiceLoading(true);

    try {
      if (file === null) {
        input.value =
          "Please record at least 2 seconds and less than 3 minutes of audio.";
        handleSize();
      } else {
        input.value = "Transcribing audio...";
        const text = await Whisper(file);
        input.value = text.toString();
        handleSize();
      }
    } catch (error) {
      console.error("Error while transcribing audio.", error);
      input.value = "";
    } finally {
      setVoiceLoading(false);
    }
  };

  const onClickExample = (text: string) => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.value = text;
    input.focus();
    setInputValue(text);
    handleSize();
  };

  function handleSize() {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.style.height = "0px";
    input.style.height = `${input.scrollHeight}px`;
    setInputValue(input.value);
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const input = inputRef.current?.value.trim() || "";
    if (!input || isLoading || isUploadingImages || !selectedModel) {
      return;
    }

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
    const abortId = uuidv4();

    const imagesToSend = [...images];
    setImages([]);

    generationManager
      .startGeneration(
        id,
        input,
        selectedModel,
        imagesToSend,
        abortId,
        updatedMessages,
      )
      .finally(() => {
        setIsLoading(false);
        if (updatedMessages.length <= 2) {
          void refreshTitles();
        }
      });
  };

  useEffect(() => {
    const loadChats = async () => {
      setIsLoadingChats(true);

      try {
        const chats = await retrieveChats(id);
        setMessages(chats);

        if (generationManager.isGenerating(id)) {
          setIsLoading(true);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadChats();
  }, [id]);

  useEffect(() => {
    const handleGenerationUpdate = (updatedMessages: Message[]) => {
      setMessages(updatedMessages);
      setIsLoading(generationManager.isGenerating(id));
    };

    generationManager.subscribeToUpdates(id, handleGenerationUpdate);

    return () => {
      generationManager.unsubscribeFromUpdates(id, handleGenerationUpdate);
    };
  }, [id]);

  useEffect(() => {
    if (!isActivePane) {
      return;
    }

    const listener = (event: ClipboardEvent) => {
      void handlePaste(event);
    };

    window.addEventListener("paste", listener);
    return () => {
      window.removeEventListener("paste", listener);
    };
  }, [handlePaste, isActivePane]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    // Sticky scroll logic: only auto-scroll if the user is already at the bottom
    const container = scrollContainerRef.current;
    if (container && isLoading) {
      const threshold = 100; // px
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
      
      if (!isAtBottom) {
        return;
      }
    }

    scrollToBottom(isLoading ? "auto" : "smooth");
  }, [isLoading, messages, scrollToBottom]);

  useHotkeys(
    "shift+esc",
    (event) => {
      event.preventDefault();
      inputRef.current?.focus();
    },
    { enabled: isActivePane },
    [isActivePane],
  );

  useHotkeys(
    "esc",
    (event) => {
      if (!isLoading) {
        return;
      }

      event.preventDefault();
      void handleStopGeneration();
    },
    { enabled: isActivePane },
    [handleStopGeneration, isActivePane, isLoading],
  );

  useHotkeys(
    "ctrl+shift+backspace",
    (event) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      void deleteChatFunc();
    },
    { enabled: isActivePane },
    [deleteChatFunc, isActivePane],
  );

  useHotkeys(
    "delete",
    (event) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      void deleteChatFunc();
    },
    { enabled: isActivePane && !isLoading },
    [deleteChatFunc, isActivePane, isLoading],
  );

  if (!id) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-secondary">No chat ID provided.</p>
      </div>
    );
  }

  return (
    <section
      className={`relative flex h-full min-h-0 flex-col overflow-hidden border-l border-transparent transition-colors ${
        isActivePane ? "bg-background" : "bg-background/70"
      }`}
      onMouseDown={() => onActivatePane?.()}
      onFocusCapture={() => onActivatePane?.()}
      onDrop={(event) => {
        void handleDragAndDrop(event);
      }}
      onDragOver={(event) => {
        if (!isActivePane) {
          return;
        }
        event.preventDefault();
      }}
      aria-label={isSplitView ? `${paneLabel} chat panel` : "Chat panel"}
    >
      {isSplitView && (
        <div
          className={`flex items-center justify-between border-b border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
            isActivePane
              ? "bg-accent text-background"
              : "bg-surface text-text-secondary"
          }`}
        >
          <span>{paneLabel} Pane</span>
          <span className="font-mono text-[10px] opacity-80">{id.slice(0, 8)}</span>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {messages.length > 0 && !isSplitView && (
          <div className="absolute right-3 top-1/2 z-10 hidden max-h-[55%] -translate-y-1/2 flex-col gap-2 overflow-y-auto rounded-full border border-border bg-surface/85 p-2 backdrop-blur-sm lg:flex">
            {messages
              .map((message, index) => ({ message, index }))
              .filter(({ message }) => message.role === "user")
              .map(({ index }) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => scrollToMessage(index)}
                  className="h-2 w-2 rounded-full bg-text-muted transition-colors hover:bg-accent"
                  aria-label={`Jump to prompt ${Math.floor(index / 2) + 1}`}
                />
              ))}
          </div>
        )}

        {messages.length > 0 && (
          <button
            type="button"
            className="absolute bottom-40 right-4 z-10 rounded-full border border-border bg-surface p-2 text-text-secondary shadow-sm transition-colors hover:bg-surface-hover hover:text-text-primary"
            onClick={() => scrollToBottom("smooth")}
            aria-label="Scroll to latest message"
          >
            <FaArrowCircleDown size={18} />
          </button>
        )}

        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="flex h-full items-center justify-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
              <p className="text-sm text-text-secondary">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-5 py-10">
              <h1 className="mb-8 text-center text-3xl font-semibold text-text-primary md:text-4xl">
                Ask anything. Compare fast.
              </h1>
              <div className="grid w-full max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
                <ExamplePromptsConstructors
                  text="Summarize this architecture and list bottlenecks for performance."
                  onClick={onClickExample}
                />
                <ExamplePromptsConstructors
                  text="Draft a migration plan from REST polling to SSE streaming."
                  onClick={onClickExample}
                />
                <ExamplePromptsConstructors
                  text="Refactor this component for accessibility and keyboard flow."
                  onClick={onClickExample}
                />
                <ExamplePromptsConstructors
                  text="Write tests for this utility with edge cases and failure paths."
                  onClick={onClickExample}
                />
              </div>
            </div>
          ) : (
            <div className="px-3 pb-10 pt-5 sm:px-4">
              <MessagesContainer
                messages={messages}
                model={selectedModelInfo?.name || "Unknown Model"}
                onCopyResponse={handleCopyResponse}
                onBranchFromMessage={handleBranchFromMessage}
                messageRefs={messageRefs}
                isSplitView={isSplitView}
              />
            </div>
          )}
          <div ref={messagesEndRef} className="h-56" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background via-background/80 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4">
        <form
          onSubmit={handleSubmit}
          className={`pointer-events-auto mx-auto w-full ${
            isSplitView ? "max-w-2xl" : "max-w-4xl"
          }`}
        >
          <ImagePreview images={images} onRemove={removeImage} />

          <div
            className={`relative rounded-2xl border p-2 shadow-[0_12px_40px_rgba(17,24,39,0.12)] transition-shadow ${
              isActivePane
                ? "border-border bg-background/95 backdrop-blur"
                : "border-border bg-background/90"
            }`}
          >
            <div
              className={`pointer-events-none absolute right-3 top-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary transition-opacity duration-200 ${
                isLoading ? "opacity-100" : "opacity-0"
              }`}
              aria-live="polite"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span>Generating</span>
            </div>

            <textarea
              ref={inputRef}
              rows={1}
              disabled={isLoadingChats || voiceLoading || isLoading}
              onInput={handleSize}
              placeholder="Type your message"
              aria-label="Message input"
              className={`max-h-64 min-h-[48px] w-full resize-none bg-transparent px-3 py-2 text-base text-text-primary outline-none placeholder:text-text-muted disabled:opacity-60 ${
                isLoading ? "animate-pulse" : ""
              }`}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                  return;
                }

                if (
                  event.ctrlKey &&
                  event.shiftKey &&
                  event.key === "Backspace"
                ) {
                  event.preventDefault();
                  void deleteChatFunc();
                }
              }}
            />

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/80 px-1 pt-2">
              <ModelSelector
                selectedModel={selectedModel}
                onChangeModel={handleModelChange}
              />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    void deleteChatFunc();
                  }}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-error"
                  aria-label="Delete chat"
                >
                  <RiDeleteBin2Fill size={16} />
                </button>

                <AudioRecord setAudio={setAudio} />

                {(supportsImageUploads || supportsPdfUploads) && (
                  <label
                    htmlFor={fileInputId}
                    className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                    aria-label="Upload files"
                  >
                    <input
                      id={fileInputId}
                      name="file"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept={uploadAccept}
                    />
                    <FaUpload size={14} />
                  </label>
                )}

                {isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      void handleStopGeneration();
                    }}
                    className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                    aria-label="Stop generation"
                  >
                    <FaStop size={17} />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    isUploadingImages ||
                    !inputValue.trim() ||
                    !selectedModel
                  }
                  className={`rounded-xl p-2.5 transition-colors ${
                    isLoading ||
                    isUploadingImages ||
                    !inputValue.trim() ||
                    !selectedModel
                      ? "cursor-not-allowed text-text-muted"
                      : "bg-accent text-background hover:bg-accent-strong"
                  }`}
                  aria-label="Send message"
                >
                  {isUploadingImages ? (
                    <ImCloudUpload size={18} />
                  ) : isLoading ? (
                    <span className="block h-[18px] w-[18px] animate-spin rounded-full border-2 border-text-muted border-t-text-primary" />
                  ) : (
                    <FaArrowCircleRight size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </section>
  );
};

export default ChatInterface;
