"use server";

// import FlashLite from "./google/gemini-2.5-flash-lite";
// import LlamaScout from "../../archive/groq/llama-scout";
// import Qwen from "../../archive/groq/qwen";
// import Deepseek from "./openrouter/deepseek";
// import Devstral from "../../archive/openrouter/devstral";
// import Phi4 from "./openrouter/phi-4-reasoning";
// import Phi4Plus from "./openrouter/phi-4-reasoning-plus";
// import Sarvam from "./openrouter/sarvam";
// import LlamaInstant from "../../archive/groq/llama-8.1b-instant";
// import GPT4oMini from "./openai/gpt-4o-mini";
// import Sarvam from "./openrouter/sarvam";
// import VeniceUncensored from "../../archive/openrouter/venice_uncensored";
// import Deepseek from "../../archive/openrouter/deepseek";
// import Gemma3 from "./google/gemma3";
// import Flash2 from "./google/gemini-2.0-flash";
// import gptOSS from "../../archive/groq/gpt-oss";
// import gptOSSfree from "../../archive/openrouter/gpt-oss-20b";

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

type ModelFunction = ({ inc }: { inc: incomingData }) => AsyncIterable<string>;

export interface fileUploads {
  mimeType: string;
  data: Uint8Array;
}

// const mappings: Record<string, ModelFunction> = {
//   llama_instant: LlamaInstant,
//   flash: FlashLite,
//   flash_2: Flash2,
//   qwen: Qwen,
//   scout: LlamaScout,
//   devstral: Devstral,
//   gpt4oMini: GPT4oMini,
//   venice_uncensored: VeniceUncensored,
//   deepseek: Deepseek,
//   gptOss: gptOSS,
//   gptOssFree: gptOSSfree,
// };

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
