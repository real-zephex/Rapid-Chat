"use server";

import ModelHandler from "./handler/generator";
import { fetchActiveModels } from "./database/read_models";
import { incomingData, Messages } from "./types";

const fallbackModel = {
  model_code: "scout",
  provider_code: "meta-llama/llama-4-scout-17b-16e-instruct",
  max_completion_tokens: 8192,
  temperature: 1,
  top_p: 1,
  stream: true,
  stop: null,
  image_support: true,
  pdf_support: false,
  system_prompt:
    "You are Scout. You are a helpful, knowledgeable, and friendly AI assistant designed to provide clear, natural, and supportive conversations. Your primary goal is to assist users by providing accurate, easy-to-understand, and genuinely useful information. You are also capable of reasoning and problem-solving.",
  provider: "groq" as "groq" | "openrouter",
  active: true,
};

export interface fileUploads {
  mimeType: string;
  data: Uint8Array;
}

const controllers = new Map<string, AbortController>();

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
  const model = await fetchActiveModels();
  const model_data = model.find((m) => m.model_code === type);
  console.log(model_data);

  const stream = new ReadableStream<string>({
    async start(controller) {
      const ac = new AbortController();
      const { signal } = ac;
      if (runId) controllers.set(runId, ac);
      try {
        for await (const chunk of ModelHandler({
          inc: { message: query, chats, imageData },
          model_data: model_data ?? fallbackModel,
          signal,
        })) {
          if (signal.aborted) break;
          if (chunk.length > 0) {
            controller.enqueue(`${chunk}`);
          }
        }
        controller.close();
      } catch (error) {
        if (!signal.aborted) {
          console.error("Stream error:", error);
          controller.enqueue(
            `Sorry, we ran into an issue. Please try sending that prompt again!\n\n`
          );
        }
        controller.close();
      } finally {
        if (runId) controllers.delete(runId);
      }
    },
    cancel(reason) {
      if (runId) {
        const c = controllers.get(runId);
        c?.abort(typeof reason === "string" ? reason : "Client cancelled");
        controllers.delete(runId);
      }
    },
  });

  return stream;
};

export async function cancelModelRun(runId: string) {
  const c = controllers.get(runId);
  if (c) {
    c.abort("User cancelled");
    controllers.delete(runId);
    return true;
  }
  return false;
}

export default ModelProvider;
