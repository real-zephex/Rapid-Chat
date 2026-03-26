"use server";

import {
  fetchActiveModelByCode,
  fetchActiveModels,
  incrementModelUsage,
} from "./database/read_models";
import ModelHandler from "./handler/generator";
import { ModelData } from "./handler/types";
import { Messages } from "./types";

type RuntimeModelData = ModelData & { active: boolean };

const fallbackModel: RuntimeModelData = {
  model_code: "scout",
  provider_code: "meta-llama/llama-4-scout-17b-16e-instruct",
  max_completion_tokens: 8192,
  temperature: 1,
  top_p: 1,
  stream: true,
  stop: null,
  image_support: true,
  pdf_support: false,
  reasoning: false,
  system_prompt:
    "You are Scout. You are a helpful, knowledgeable, and friendly AI assistant designed to provide clear, natural, and supportive conversations. Your primary goal is to assist users by providing accurate, easy-to-understand, and genuinely useful information. You are also capable of reasoning and problem-solving.",
  provider: "groq" as "groq" | "openrouter",
  active: true,
};

export interface fileUploads {
  mimeType: string;
  data: Uint8Array;
}

export type GenerationEvent =
  | { type: "content"; delta: string }
  | { type: "reasoning"; delta: string }
  | { type: "done" }
  | { type: "error"; message: string };

const controllers = new Map<string, AbortController>();

const serializeEvent = (event: GenerationEvent) => `${JSON.stringify(event)}\n`;

const ModelProvider = async ({
  type,
  query,
  chats,
  imageData,
  runId,
}: {
  type: string;
  query: string;
  chats: Messages[];
  imageData?: fileUploads[];
  runId?: string;
}): Promise<ReadableStream<string>> => {
  const model = await fetchActiveModelByCode(type);

  if (!model) {
    const models = await fetchActiveModels();
    const fallbackMatch = models.find((item) => item.model_code === type);

    if (fallbackMatch) {
      void incrementModelUsage(type);
      return createReadableStream({
        query,
        chats,
        imageData,
        modelData: fallbackMatch,
        runId,
      });
    }

    return createReadableStream({
      query,
      chats,
      imageData,
      modelData: fallbackModel,
      runId,
    });
  }

  void incrementModelUsage(type);

  return createReadableStream({
    query,
    chats,
    imageData,
    modelData: model,
    runId,
  });
};

const createReadableStream = ({
  query,
  chats,
  imageData,
  modelData,
  runId,
}: {
  query: string;
  chats: Messages[];
  imageData?: fileUploads[];
  modelData: RuntimeModelData;
  runId?: string;
}): ReadableStream<string> => {
  return new ReadableStream<string>({
    async start(controller) {
      const abortController = new AbortController();
      const { signal } = abortController;

      if (runId) {
        controllers.set(runId, abortController);
      }

      try {
        for await (const chunk of ModelHandler({
          inc: { message: query, chats, imageData },
          model_data: modelData,
          signal,
        })) {
          if (signal.aborted) {
            break;
          }

          controller.enqueue(
            serializeEvent(chunk),
          );
        }

        if (!signal.aborted) {
          controller.enqueue(serializeEvent({ type: "done" }));
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Stream error:", error);
          controller.enqueue(
            serializeEvent({
              type: "error",
              message:
                "Sorry, we ran into an issue. Please try sending that prompt again!",
            }),
          );
        }
      } finally {
        if (runId) {
          controllers.delete(runId);
        }

        controller.close();
      }
    },
    cancel() {
      if (runId) {
        void cancelModelRun(runId);
      }
    },
  });
};

export async function cancelModelRun(runId: string) {
  const controller = controllers.get(runId);
  if (controller) {
    controller.abort("User cancelled");
    controllers.delete(runId);
    return true;
  }

  return false;
}

export default ModelProvider;
