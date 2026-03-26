import ModelProvider, { cancelModelRun, type GenerationEvent } from "@/models";
import { saveChats } from "@/utils/indexedDB";

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: { mimeType: string; data: Uint8Array }[];
  reasoning?: string;
  startTime?: number;
  endTime?: number;
  cancelled?: boolean;
};

type UpdateCallback = (messages: Message[]) => void;

type GenerationTask = {
  chatId: string;
  abortId: string;
  promise: Promise<void>;
  cancelRequested: boolean;
  latestMessages: Message[];
};

const HISTORY_WINDOW_SIZE = 24;
const UPDATE_INTERVAL_MS = 90;
const PERSIST_INTERVAL_MS = 1200;

class GenerationManager {
  private activeTasks = new Map<string, GenerationTask>();
  private listeners = new Map<string, Set<UpdateCallback>>();

  async startGeneration(
    chatId: string,
    input: string,
    selectedModel: string,
    images: { mimeType: string; data: Uint8Array }[],
    abortId: string,
    initialMessages: Message[],
  ) {
    const existingTask = this.activeTasks.get(chatId);
    if (existingTask) {
      await this.stopGeneration(chatId);
      try {
        await existingTask.promise;
      } catch {
        // Existing task already handled its own error state.
      }
    }

    const task: GenerationTask = {
      chatId,
      abortId,
      promise: Promise.resolve(),
      cancelRequested: false,
      latestMessages: initialMessages,
    };

    this.activeTasks.set(chatId, task);
    task.promise = this.runGeneration({
      chatId,
      input,
      selectedModel,
      images,
      abortId,
      initialMessages,
      task,
    });

    try {
      await task.promise;
    } finally {
      if (this.activeTasks.get(chatId) === task) {
        this.activeTasks.delete(chatId);
      }
    }
  }

  async stopGeneration(chatId: string) {
    const task = this.activeTasks.get(chatId);
    if (!task) {
      return false;
    }

    task.cancelRequested = true;
    await cancelModelRun(task.abortId);
    return true;
  }

  private async runGeneration({
    chatId,
    input,
    selectedModel,
    images,
    abortId,
    initialMessages,
    task,
  }: {
    chatId: string;
    input: string;
    selectedModel: string;
    images: { mimeType: string; data: Uint8Array }[];
    abortId: string;
    initialMessages: Message[];
    task: GenerationTask;
  }) {
    let assistantContent = "";
    let assistantReasoning = "";
    let currentMessages: Message[] = [
      ...initialMessages,
      { role: "assistant", content: "", reasoning: "" },
    ];
    let pendingEventBuffer = "";
    let hasDoneEvent = false;
    const decoder = new TextDecoder();
    const startTime = Date.now();

    const updateAssistantMessage = (
      overrides?: Partial<Omit<Message, "role">>,
    ) => {
      const nextMessages = [...currentMessages];

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
        reasoning: assistantReasoning,
        ...overrides,
      };

      if (
        nextMessages.length > 0 &&
        nextMessages[nextMessages.length - 1].role === "assistant"
      ) {
        nextMessages[nextMessages.length - 1] = assistantMessage;
      } else {
        nextMessages.push(assistantMessage);
      }

      currentMessages = nextMessages;
    };

    const flushMessages = async ({ force }: { force: boolean }) => {
      updateAssistantMessage();
      this.publishUpdate(task, currentMessages);

      if (force) {
        await this.safePersist(chatId, currentMessages);
      }
    };

    try {
      const chatHistory = initialMessages
        .slice(0, -1)
        .slice(-HISTORY_WINDOW_SIZE)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const response = await ModelProvider({
        type: selectedModel,
        query: input,
        chats: chatHistory,
        runId: abortId,
        imageData: images,
      });

      if (!(response instanceof ReadableStream)) {
        throw new Error("Expected a ReadableStream response");
      }

      const reader = response.getReader();
      let lastUpdateAt = 0;
      let lastPersistAt = Date.now();

      while (true) {
        if (task.cancelRequested) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunkText =
          typeof value === "string"
            ? value
            : decoder.decode(value, { stream: true });

        if (!chunkText) {
          continue;
        }

        pendingEventBuffer += chunkText;

        let newlineIndex = pendingEventBuffer.indexOf("\n");
        while (newlineIndex !== -1) {
          const rawEvent = pendingEventBuffer.slice(0, newlineIndex).trim();
          pendingEventBuffer = pendingEventBuffer.slice(newlineIndex + 1);

          if (rawEvent) {
            const event = this.parseEvent(rawEvent);
            if (event.type === "content") {
              assistantContent += event.delta;
            } else if (event.type === "reasoning") {
              assistantReasoning += event.delta;
            } else if (event.type === "error") {
              assistantContent += assistantContent
                ? `\n\n${event.message}`
                : event.message;
            } else if (event.type === "done") {
              hasDoneEvent = true;
            }
          }

          newlineIndex = pendingEventBuffer.indexOf("\n");
        }

        const now = Date.now();
        if (now - lastUpdateAt >= UPDATE_INTERVAL_MS) {
          await flushMessages({ force: false });
          lastUpdateAt = now;
        }

        if (now - lastPersistAt >= PERSIST_INTERVAL_MS) {
          await this.safePersist(chatId, currentMessages);
          lastPersistAt = now;
        }
      }

      if (pendingEventBuffer.trim()) {
        const event = this.parseEvent(pendingEventBuffer.trim());
        if (event.type === "content") {
          assistantContent += event.delta;
        } else if (event.type === "reasoning") {
          assistantReasoning += event.delta;
        } else if (event.type === "error") {
          assistantContent += assistantContent
            ? `\n\n${event.message}`
            : event.message;
        } else if (event.type === "done") {
          hasDoneEvent = true;
        }
      }

      const endTime = Date.now();

      if (task.cancelRequested) {
        assistantContent = assistantContent.trim() || "Generation was interrupted.";
        assistantReasoning = assistantReasoning.trim();

        updateAssistantMessage({
          content: assistantContent,
          reasoning: assistantReasoning || "",
          startTime,
          endTime,
          cancelled: true,
        });
      } else {
        assistantContent = assistantContent.trim();
        assistantReasoning = assistantReasoning.trim();

        if (!assistantContent && !assistantReasoning && !hasDoneEvent) {
          assistantContent =
            "Sorry, we ran into an issue. Please try sending that prompt again!";
        }

        updateAssistantMessage({
          content: assistantContent,
          reasoning: assistantReasoning || "",
          startTime,
          endTime,
        });
      }

      await this.safePersist(chatId, currentMessages);
      this.publishUpdate(task, currentMessages);
    } catch (error) {
      console.error("Error in generation:", error);

      const endTime = Date.now();
      assistantContent =
        assistantContent.trim() ||
        (task.cancelRequested
          ? "Generation was interrupted."
          : "Sorry, we ran into an issue. Please try sending that prompt again!");
      assistantReasoning = assistantReasoning.trim();

      updateAssistantMessage({
        content: assistantContent,
        reasoning: assistantReasoning || "",
        startTime,
        endTime,
        cancelled: task.cancelRequested,
      });

      await this.safePersist(chatId, currentMessages);
      this.publishUpdate(task, currentMessages);
    }
  }

  private parseEvent(rawEvent: string): GenerationEvent {
    try {
      const parsed = JSON.parse(rawEvent) as Partial<GenerationEvent>;

      if (parsed.type === "content" && typeof parsed.delta === "string") {
        return { type: "content", delta: parsed.delta };
      }

      if (parsed.type === "reasoning" && typeof parsed.delta === "string") {
        return { type: "reasoning", delta: parsed.delta };
      }

      if (parsed.type === "done") {
        return { type: "done" };
      }

      if (parsed.type === "error" && typeof parsed.message === "string") {
        return { type: "error", message: parsed.message };
      }
    } catch {
      // Fall through to legacy plain-text handling.
    }

    return { type: "content", delta: rawEvent };
  }

  private publishUpdate(task: GenerationTask, messages: Message[]) {
    task.latestMessages = messages;

    const callbacks = this.listeners.get(task.chatId);
    if (!callbacks || callbacks.size === 0) {
      return;
    }

    for (const callback of callbacks) {
      try {
        callback(messages);
      } catch (error) {
        console.error("Error notifying generation subscriber:", error);
      }
    }
  }

  private async safePersist(chatId: string, messages: Message[]) {
    try {
      await saveChats(chatId, messages);
    } catch (error) {
      console.error("Failed to persist chat during generation:", error);
    }
  }

  isGenerating(chatId: string): boolean {
    return this.activeTasks.has(chatId);
  }

  getAbortId(chatId: string): string | undefined {
    return this.activeTasks.get(chatId)?.abortId;
  }

  subscribeToUpdates(chatId: string, onUpdate: UpdateCallback) {
    const listenersForChat = this.listeners.get(chatId) ?? new Set<UpdateCallback>();
    listenersForChat.add(onUpdate);
    this.listeners.set(chatId, listenersForChat);

    const task = this.activeTasks.get(chatId);
    if (task && task.latestMessages.length > 0) {
      onUpdate(task.latestMessages);
    }
  }

  unsubscribeFromUpdates(chatId: string, onUpdate?: UpdateCallback) {
    const listenersForChat = this.listeners.get(chatId);
    if (!listenersForChat) {
      return;
    }

    if (onUpdate) {
      listenersForChat.delete(onUpdate);

      if (listenersForChat.size === 0) {
        this.listeners.delete(chatId);
      }
      return;
    }

    this.listeners.delete(chatId);
  }
}

export const generationManager = new GenerationManager();
export type { Message };
