"use server";

import FlashLite from "./google/gemini-2.5-flash-lite";
// import CompoundBeta from "./groq/compound";
import LlamaScout from "./groq/llama-scout";
import Qwen from "./groq/qwen";
// import Deepseek from "./openrouter/deepseek";
import Devstral from "./openrouter/devstral";
// import Phi4 from "./openrouter/phi-4-reasoning";
// import Phi4Plus from "./openrouter/phi-4-reasoning-plus";
// import Sarvam from "./openrouter/sarvam";
import { incomingData, Messages } from "./types";
import LlamaInstant from "./groq/archive/llama-8.1b-instant";
import GPT4oMini from "./openai/gpt-4o-mini";
// import Sarvam from "./openrouter/sarvam";
import VeniceUncensored from "./openrouter/venice_uncensored";
// import CompoundBeta from "./groq/compound";
import Deepseek from "./openrouter/deepseek";
// import Gemma3 from "./google/gemma3";
import Flash2 from "./google/gemini-2.0-flash";
import gptOSS from "./groq/gpt-oss";
import gptOSSfree from "./openrouter/gpt-oss-20b";
import ModelHandler from "./handler/generator";
import { fetchActiveModels } from "./database/read_models";
import { ModelData } from "./handler/types";

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
// type ModelFunction = (

// )

const mappings: Record<string, ModelFunction> = {
  llama_instant: LlamaInstant,
  flash: FlashLite,
  flash_2: Flash2,
  // compound: CompoundBeta,
  qwen: Qwen,
  scout: LlamaScout,
  devstral: Devstral,
  gpt4oMini: GPT4oMini,
  venice_uncensored: VeniceUncensored,
  deepseek: Deepseek,
  gptOss: gptOSS,
  gptOssFree: gptOSSfree,
  // gemma3: Gemma3,

  // phi4: Phi4,
  //   phi4plus: Phi4Plus,
  // sarvam: Sarvam,
};

const ModelProvider = async ({
  type,
  query,
  chats,
  imageData,
}: {
  type: keyof typeof mappings;
  query: string;
  chats: Messages[];
  imageData?: fileUploads[];
}): Promise<ReadableStream<string>> => {
  // const fin = ModelHandler();

  const model = await fetchActiveModels();
  const model_data = model.find((m) => m.model_code === type);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of ModelHandler({
          inc: { message: query, chats, imageData },
          model_data: model_data ?? fallbackModel,
        })) {
          if (chunk.length > 0) {
            controller.enqueue(`${chunk}`);
          }
        }
        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          `Sorry, we ran into an issue. Please try sending that prompt again!\n\n`
        );
        controller.close();
      }
    },
  });

  return stream;
};

export default ModelProvider;
