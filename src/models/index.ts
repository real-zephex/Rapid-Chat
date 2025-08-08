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
import LlamaInstant from "./groq/llama-8.1b-instant";
import GPT4oMini from "./openai/gpt-4o-mini";
// import Sarvam from "./openrouter/sarvam";
import VeniceUncensored from "./openrouter/venice_uncensored";
// import CompoundBeta from "./groq/compound";
import Deepseek from "./openrouter/deepseek";
// import Gemma3 from "./google/gemma3";
import Flash2 from "./google/gemini-2.0-flash";
import gptOSS from "./groq/gpt-oss";

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
  // gemma3: Gemma3,

  // phi4: Phi4,
  //   phi4plus: Phi4Plus,
  // sarvam: Sarvam,
};

const ModelProvider = ({
  type,
  query,
  chats,
  imageData,
}: {
  type: keyof typeof mappings;
  query: string;
  chats: Messages[];
  imageData?: fileUploads[];
}): ReadableStream<string> => {
  if (!mappings[type]) {
    throw new Error(`Invalid model type: ${type}`);
  }
  const fin = mappings[type];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of fin({
          inc: { message: query, chats, imageData },
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
