import { OpenRouter } from "@openrouter/sdk";
import Groq from "groq-sdk";
import {
  ChatCompletionCreateParamsStreaming,
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "groq-sdk/resources/chat/completions";

import { fileUploads } from "..";
import { incomingData } from "../types";
import { DocumentParse, ImageParser } from "./helper/attachments-parser";
import { ModelData } from "./types";

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const openrouterClient = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

type ProviderHandler = (params: {
  inc: incomingData;
  model_data: ModelData;
  signal?: AbortSignal;
}) => AsyncGenerator<ModelStreamChunk>;

type OpenRouterDelta = {
  choices?: Array<{
    delta?: {
      content?: string;
      reasoning?: string;
    };
  }>;
};

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: unknown;
};

export type ModelStreamChunk =
  | { type: "content"; delta: string }
  | { type: "reasoning"; delta: string };

const splitAttachments = (attachments?: fileUploads[]) => {
  if (!attachments || attachments.length === 0) {
    return { images: [] as fileUploads[], documents: [] as fileUploads[] };
  }

  const images = attachments.filter(
    (item) =>
      item.mimeType === "image/png" ||
      item.mimeType === "image/jpeg" ||
      item.mimeType === "image/jpg",
  );

  const documents = attachments.filter(
    (item) => item.mimeType === "application/pdf",
  );

  return { images, documents };
};

const buildUserContent = ({
  message,
  image_support,
  pdf_support,
  attachments,
}: {
  message: string;
  image_support: boolean;
  pdf_support: boolean;
  attachments?: fileUploads[];
}): string | ChatCompletionContentPart[] => {
  const multimodal = Boolean(image_support || pdf_support);
  if (!multimodal) {
    return message;
  }

  const { images, documents } = splitAttachments(attachments);

  return [
    { type: "text", text: message },
    ...ImageParser({ inc: images }),
    ...DocumentParse({ inc: documents }),
  ];
};

async function* handleGroq({
  inc,
  model_data,
  signal,
}: {
  inc: incomingData;
  model_data: ModelData;
  signal?: AbortSignal;
}): AsyncGenerator<ModelStreamChunk> {
  const {
    provider_code,
    system_prompt,
    max_completion_tokens,
    top_p,
    temperature,
    image_support,
    pdf_support,
    stop,
  } = model_data;

  const userContent = buildUserContent({
    message: inc.message,
    image_support,
    pdf_support,
    attachments: inc.imageData,
  });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: system_prompt },
    ...inc.chats,
    { role: "user", content: userContent },
  ];

  try {
    const request: ChatCompletionCreateParamsStreaming = {
      model: provider_code,
      messages,
      stream: true,
      temperature,
      max_completion_tokens,
      top_p,
      ...(stop ? { stop } : {}),
    };

    const streamResponse = await groqClient.chat.completions.create(
      request,
      { signal },
    );

    for await (const chunk of streamResponse) {
      if (signal?.aborted) {
        break;
      }

      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) {
        yield { type: "content", delta: token };
      }
    }
  } catch (error) {
    if (signal?.aborted) {
      return;
    }
    throw error;
  }
}

async function* handleOpenRouter({
  inc,
  model_data,
  signal,
}: {
  inc: incomingData;
  model_data: ModelData;
  signal?: AbortSignal;
}): AsyncGenerator<ModelStreamChunk> {
  const {
    provider_code,
    system_prompt,
    max_completion_tokens,
    top_p,
    temperature,
    image_support,
    pdf_support,
    reasoning,
    stop,
  } = model_data;

  const userContent = buildUserContent({
    message: inc.message,
    image_support,
    pdf_support,
    attachments: inc.imageData,
  });

  const messages: OpenRouterMessage[] = [
    { role: "system", content: system_prompt },
    ...inc.chats,
    { role: "user", content: userContent },
  ];

  try {
    const params: Record<string, unknown> = {
      model: provider_code,
      messages,
      temperature,
      maxTokens: max_completion_tokens,
      topP: top_p,
      stream: true,
    };

    if (reasoning) {
      params.include_reasoning = true;
    }

    if (stop) {
      params.stop = stop;
    }

    const result = await openrouterClient.chat.send(
      params as never,
      signal ? { signal } : undefined,
    );
    const streamIterable = result as unknown as AsyncIterable<OpenRouterDelta>;

    for await (const chunk of streamIterable) {
      if (signal?.aborted) {
        break;
      }

      const reasoningToken = chunk.choices?.[0]?.delta?.reasoning ?? "";
      if (reasoningToken) {
        yield { type: "reasoning", delta: reasoningToken };
      }

      const token = chunk.choices?.[0]?.delta?.content ?? "";
      if (token) {
        yield { type: "content", delta: token };
      }
    }
  } catch (error) {
    if (signal?.aborted) {
      return;
    }
    throw error;
  }
}

const providerHandlers: Record<string, ProviderHandler> = {
  groq: handleGroq,
  openrouter: handleOpenRouter,
};

async function* ModelHandler({
  inc,
  model_data,
  signal,
}: {
  inc: incomingData;
  model_data: ModelData;
  signal?: AbortSignal;
}): AsyncGenerator<ModelStreamChunk> {
  const handler = providerHandlers[model_data.provider];

  if (!handler) {
    throw new Error(
      `Unsupported provider: "${model_data.provider}". Supported: ${Object.keys(providerHandlers).join(", ")}`,
    );
  }

  try {
    yield* handler({ inc, model_data, signal });
  } catch (error: unknown) {
    if (signal?.aborted) {
      return;
    }

    console.error("Model generation error:", {
      provider: model_data.provider,
      model: model_data.provider_code,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });

    yield {
      type: "content",
      delta: "Sorry, we ran into an issue. Please try sending that prompt again!\n\n",
    };
  }
}

export default ModelHandler;
