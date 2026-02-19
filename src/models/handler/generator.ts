import Groq from "groq-sdk";
import { OpenRouter } from "@openrouter/sdk";
import { incomingData } from "../types";
import { DocumentParse, ImageParser } from "./helper/attachments-parser";
import { ModelData } from "./types";
import { fileUploads } from "..";
import { toolsSchema } from "@/utils/tools/schema";
import { functionMaps } from "@/utils/tools/schema/maps";
import {
  ChatCompletionMessageParam,
  ChatCompletionContentPart,
  ChatCompletionMessageToolCall,
} from "groq-sdk/resources/chat/completions";

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
}) => AsyncGenerator<string>;

type ToolCall = {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
};

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

async function* handleGroq({
  inc,
  model_data,
  signal,
}: {
  inc: incomingData;
  model_data: ModelData;
  signal?: AbortSignal;
}): AsyncGenerator<string> {
  const {
    provider_code,
    system_prompt,
    max_completion_tokens,
    top_p,
    temperature,
    image_support,
    pdf_support,
    tools,
  } = model_data;

  let images: fileUploads[] = [];
  let documents: fileUploads[] = [];
  if (inc.imageData) {
    images = inc.imageData.filter(
      (i) =>
        i.mimeType === "image/png" ||
        i.mimeType === "image/jpeg" ||
        i.mimeType === "image/jpg",
    );
    documents = inc.imageData.filter((i) => i.mimeType === "application/pdf");
  }

  const multimodal = Boolean(image_support || pdf_support);
  const userContent: string | ChatCompletionContentPart[] = multimodal
    ? [
        { type: "text", text: inc.message },
        ...ImageParser({ inc: images }),
        ...DocumentParse({ inc: documents }),
      ]
    : inc.message;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: system_prompt },
    ...inc.chats,
    { role: "user", content: userContent },
  ];

  try {
    if (!tools) {
      const streamResponse = await groqClient.chat.completions.create(
        {
          model: provider_code,
          messages,
          stream: true,
          temperature,
          max_completion_tokens,
          top_p,
        },
        { signal },
      );

      for await (const chunk of streamResponse) {
        if (signal?.aborted) break;

        const token = chunk.choices[0]?.delta?.content ?? "";
        if (token) {
          yield token;
        }
      }
    } else {
      console.info("===Groq: Checking for tools===");
      const modelResponse = await groqClient.chat.completions.create({
        model: provider_code,
        messages: [
          { role: "system", content: system_prompt },
          ...inc.chats.slice(-3),
          { role: "user", content: userContent },
        ],
        stream: false,
        tools: toolsSchema,
      });

      const responseMessage = modelResponse.choices[0].message;
      const toolCalls = responseMessage.tool_calls ?? [];

      if (toolCalls.length > 0) {
        if (responseMessage.content) {
          yield responseMessage.content;
        }

        console.info("===Groq: Using Tools===");
        const toolResponses = await processToolCalls(toolCalls);

        const finalMessageArray: ChatCompletionMessageParam[] = [
          ...messages,
          {
            role: "assistant",
            content: responseMessage.content ?? "",
            tool_calls: toolCalls,
          },
          ...toolResponses,
        ];

        const finalResponse = await groqClient.chat.completions.create(
          {
            model: provider_code,
            messages: finalMessageArray,
            stream: true,
            temperature,
            max_completion_tokens,
            top_p,
          },
          { signal },
        );

        for await (const chunk of finalResponse) {
          if (signal?.aborted) break;
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) yield token;
        }
      } else {
        const streamResponse = await groqClient.chat.completions.create(
          {
            model: provider_code,
            messages,
            stream: true,
            temperature,
            max_completion_tokens,
            top_p,
          },
          { signal },
        );

        for await (const chunk of streamResponse) {
          if (signal?.aborted) break;
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) yield token;
        }
      }
    }
  } catch (error) {
    if (signal?.aborted) return;
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
}): AsyncGenerator<string> {
  const {
    provider_code,
    system_prompt,
    max_completion_tokens,
    top_p,
    temperature,
    image_support,
    pdf_support,
    reasoning,
    tools,
  } = model_data;

  let images: fileUploads[] = [];
  let documents: fileUploads[] = [];
  if (inc.imageData) {
    images = inc.imageData.filter(
      (i) =>
        i.mimeType === "image/png" ||
        i.mimeType === "image/jpeg" ||
        i.mimeType === "image/jpg",
    );
    documents = inc.imageData.filter((i) => i.mimeType === "application/pdf");
  }

  const multimodal = Boolean(image_support || pdf_support);
  const userContent = multimodal
    ? [
        { type: "text", text: inc.message },
        ...ImageParser({ inc: images }),
        ...DocumentParse({ inc: documents }),
      ]
    : inc.message;

  const messages: ChatMessage[] = [
    { role: "system", content: system_prompt },
    ...inc.chats,
    { role: "user", content: userContent as string },
  ];

  try {
    if (!tools) {
      const params: Record<string, unknown> = {
        model: provider_code,
        messages,
        temperature,
        maxTokens: max_completion_tokens,
        top_p,
        stream: true,
      };

      if (reasoning) {
        params.include_reasoning = true;
      }

      const result = await openrouterClient.chat.send(
        params as never,
      );

      const streamIterable = result as unknown as AsyncIterable<{ choices: { delta: { content?: string; reasoning?: string } }[] }>;
      for await (const chunk of streamIterable) {
        if (signal?.aborted) break;

        const reasoningToken = chunk.choices[0]?.delta?.reasoning ?? "";
        if (reasoningToken) {
          yield `<think>${reasoningToken}
</think>

`;
        }

        const token = chunk.choices[0]?.delta?.content ?? "";
        if (token) {
          yield token;
        }
      }
    } else {
      console.info("===OpenRouter: Checking for tools===");
      const modelResponse = await openrouterClient.chat.send({
        model: provider_code,
        messages: [
          { role: "system", content: system_prompt },
          ...inc.chats.slice(-3),
          { role: "user", content: userContent as string },
        ],
        stream: false,
        tools: toolsSchema as never,
      });

      const responseMessage = (modelResponse as { choices?: { message: ChatMessage }[] }).choices?.[0]?.message;
      const toolCalls: ToolCall[] = responseMessage?.tool_calls ?? [];

      if (toolCalls.length > 0) {
        if (responseMessage?.content) {
          yield responseMessage.content;
        }

        console.info("===OpenRouter: Using Tools===");
        const toolResponses = await processToolCalls(toolCalls as ChatCompletionMessageToolCall[]);

        const finalMessageArray: ChatMessage[] = [
          ...messages,
          {
            role: "assistant",
            content: responseMessage?.content ?? "",
            tool_calls: toolCalls,
          },
          ...toolResponses as unknown as ChatMessage[],
        ];

        const finalResult = await openrouterClient.chat.send({
          model: provider_code,
          messages: finalMessageArray as never[],
          stream: true,
          temperature,
          maxTokens: max_completion_tokens,
          topP: top_p,
        });

        const finalStream = finalResult as unknown as AsyncIterable<{ choices: { delta: { content?: string } }[] }>;
        for await (const chunk of finalStream) {
          if (signal?.aborted) break;
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) yield token;
        }
      } else {
        const streamResult = await openrouterClient.chat.send({
          model: provider_code,
          messages: messages as never[],
          stream: true,
          temperature,
          maxTokens: max_completion_tokens,
          topP: top_p,
        });

        const streamIter = streamResult as unknown as AsyncIterable<{ choices: { delta: { content?: string } }[] }>;
        for await (const chunk of streamIter) {
          if (signal?.aborted) break;
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) yield token;
        }
      }
    }
  } catch (error) {
    if (signal?.aborted) return;
    throw error;
  }
}

async function processToolCalls(
  toolCalls: ChatCompletionMessageToolCall[],
): Promise<ChatCompletionMessageParam[]> {
  const toolResponses: ChatCompletionMessageParam[] = [];

  for (const toolCall of toolCalls) {
    const { id, type } = toolCall;

    if (type === "function" && "function" in toolCall) {
      const functionName = toolCall.function.name;
      const functionArguments = toolCall.function.arguments;
      const toolFunction = functionMaps[functionName as keyof typeof functionMaps];

      try {
        const functionArgs = JSON.parse(functionArguments);
        const output = await toolFunction(functionArgs);
        toolResponses.push({
          role: "tool" as const,
          tool_call_id: id,
          content: output || "No output found.",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        toolResponses.push({
          role: "tool" as const,
          tool_call_id: id,
          content: `Tool '${functionName}' failed: ${errorMessage}`,
        });
        console.error(`Tool execution error [${functionName}]:`, err);
      }
    }
  }

  return toolResponses;
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
}): AsyncGenerator<string> {
  const handler = providerHandlers[model_data.provider];

  if (!handler) {
    throw new Error(
      `Unsupported provider: "${model_data.provider}". Supported: ${Object.keys(providerHandlers).join(", ")}`,
    );
  }

  try {
    yield* handler({ inc, model_data, signal });
  } catch (error: unknown) {
    if (signal?.aborted) return;

    console.error("Model generation error:", {
      provider: model_data.provider,
      model: model_data.provider_code,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });

    yield `Sorry, we ran into an issue. Please try sending that prompt again!\n\n`;
  }
}

export default ModelHandler;
