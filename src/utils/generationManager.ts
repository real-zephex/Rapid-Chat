import ModelProvider from "@/models";
import { retrieveChats, saveChats } from "@/utils/indexedDB";
import { processMessageContent } from "@/utils/responseCleaner";

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: { mimeType: string; data: Uint8Array }[];
  reasoning?: string;
  startTime?: number;
  endTime?: number;
};

type GenerationTask = {
  chatId: string;
  abortId: string;
  promise: Promise<void>;
  onUpdate?: (messages: Message[]) => void;
};

class GenerationManager {
  private activeTasks = new Map<string, GenerationTask>();

  async startGeneration(
    chatId: string,
    input: string,
    selectedModel: string,
    images: { mimeType: string; data: Uint8Array }[],
    abortId: string,
    initialMessages: Message[],
    onUpdate?: (messages: Message[]) => void,
  ) {
    // Cancel any existing generation for this chat
    if (this.activeTasks.has(chatId)) {
      console.log(`Cancelling existing generation for chat ${chatId}`);
    }

    const promise = this.runGeneration(
      chatId,
      input,
      selectedModel,
      images,
      abortId,
      initialMessages,
      onUpdate,
    );

    this.activeTasks.set(chatId, { chatId, abortId, promise, onUpdate });

    try {
      await promise;
    } finally {
      this.activeTasks.delete(chatId);
    }
  }

  private async runGeneration(
    chatId: string,
    input: string,
    selectedModel: string,
    images: { mimeType: string; data: Uint8Array }[],
    abortId: string,
    initialMessages: Message[],
    onUpdate?: (messages: Message[]) => void,
  ) {
    try {
      const prevChats = await retrieveChats(chatId);
      // Get chat history excluding the last message - bro, this caused me so much confusion.
      const chatHistory = prevChats.slice(0, -1).slice(-10);
      const response = await ModelProvider({
        type: selectedModel,
        query: input,
        chats: chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        runId: abortId,
        imageData: images,
      });

      if (!(response instanceof ReadableStream)) {
        throw new Error("Expected a ReadableStream response");
      }

      const reader = response.getReader();
      let assistantMessage = "";
      let updateCounter = 0;
      const UPDATE_THROTTLE = 1;

      // Get current messages from DB (they might have changed)
      let currentMessages = await retrieveChats(chatId);

      // Add placeholder assistant message
      currentMessages = [
        ...currentMessages,
        {
          role: "assistant",
          content: "Waiting for first tokens, please wait!",
          reasoning: "Thinking, please wait...",
        },
      ];

      // Notify component if it's mounted
      onUpdate?.(currentMessages);

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

        if (updateCounter % UPDATE_THROTTLE === 0 || done) {
          // Update messages array
          const updatedMessages = [...currentMessages];
          updatedMessages[updatedMessages.length - 1] = {
            role: "assistant",
            content: displayContent,
            reasoning: reasoning || "",
          };
          currentMessages = updatedMessages;

          onUpdate?.(currentMessages);
        }
      }

      const endTime = performance.now();
      const { displayContent, reasoning } =
        processMessageContent(assistantMessage);

      // Final update
      const finalMessages = [...currentMessages];
      finalMessages[finalMessages.length - 1] = {
        role: "assistant",
        content: displayContent,
        reasoning: reasoning || "",
        startTime: startTime,
        endTime: endTime,
      };

      // Save to DB
      await saveChats(chatId, finalMessages);

      // Notify component
      onUpdate?.(finalMessages);
    } catch (error) {
      console.error("Error in generation:", error);
      const errorMessages = [
        ...initialMessages,
        {
          role: "assistant" as const,
          content: "Sorry, there was an error processing your request.",
        },
      ];
      await saveChats(chatId, errorMessages);
      onUpdate?.(errorMessages);
    }
  }

  isGenerating(chatId: string): boolean {
    return this.activeTasks.has(chatId);
  }

  getAbortId(chatId: string): string | undefined {
    return this.activeTasks.get(chatId)?.abortId;
  }

  subscribeToUpdates(chatId: string, onUpdate: (messages: Message[]) => void) {
    const task = this.activeTasks.get(chatId);
    if (task) {
      task.onUpdate = onUpdate;
    }
  }

  unsubscribeFromUpdates(chatId: string) {
    const task = this.activeTasks.get(chatId);
    if (task) {
      task.onUpdate = undefined;
    }
  }
}

export const generationManager = new GenerationManager();
export type { Message };
