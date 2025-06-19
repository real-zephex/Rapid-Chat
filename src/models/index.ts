"use server";

import { models } from "@/utils/model-list";
import FlashLite from "./google/gemini-2.5-flash-lite";
import CompoundBeta from "./groq/compound";
import LlamaScout from "./groq/llama-scout";
import Qwen from "./groq/qwen";
import Deepseek from "./openrouter/deepseek";
import Devstral from "./openrouter/devstral";
import Phi4 from "./openrouter/phi-4-reasoning";
import Phi4Plus from "./openrouter/phi-4-reasoning-plus";
import Sarvam from "./openrouter/sarvam";
import { Messages } from "./types";

type ModelFunction = (
  query: string,
  chats: Messages[]
) => AsyncIterable<string>;

const mappings: Record<string, ModelFunction> = {
  compound: CompoundBeta,
  flash: FlashLite,
  qwen: Qwen,
  scout: LlamaScout,
  devstral: Devstral,
  deepseek: Deepseek,
  phi4: Phi4,
  phi4plus: Phi4Plus,
  sarvam: Sarvam,
};

const ModelProvider = ({
  type,
  query,
  chats,
}: {
  type: keyof typeof mappings;
  query: string;
  chats: Messages[];
}): ReadableStream<string> => {
  if (!mappings[type]) {
    throw new Error(`Invalid model type: ${type}`);
  }

  const fin = mappings[type];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of fin(query, chats)) {
          if (chunk.length > 0) {
            controller.enqueue(`${chunk}`);
          }
        }
        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          `event: error\ndata: ${JSON.stringify({ error })}\n\n`
        );
        controller.close();
      }
    },
  });

  return stream;
};

export default ModelProvider;
