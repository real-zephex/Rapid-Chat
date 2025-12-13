import { toolsSchema } from "@/utils/tools/schema";
import { functionMaps } from "@/utils/tools/schema/maps";
import Groq from "groq-sdk";
import { OpenRouter } from "@openrouter/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { incomingData } from "../types";
import { DocumentParse, ImageParser } from "./helper/attachments-parser";
import { ModelData } from "./types";
import { fileUploads } from "..";

// ============================================
// Native SDK Clients
// ============================================

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const openrouterClient = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const googleClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// ============================================
// Provider-specific handlers
// ============================================

type ProviderHandler = (params: {
  inc: incomingData;
  model_data: ModelData;
  signal?: AbortSignal;
}) => AsyncGenerator<string>;

// Groq SDK Handler with reasoning support
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
        i.mimeType === "image/jpg"
    );
    documents = inc.imageData.filter((i) => i.mimeType === "application/pdf");
  }

  const multimodal = Boolean(image_support || pdf_support);
  const userContent: string | any[] = multimodal
    ? [
        { type: "text", text: inc.message },
        ...ImageParser({ inc: images, provider: "groq" }),
        ...DocumentParse({ inc: documents, provider: "groq" }),
      ]
    : inc.message;

  const messages: any[] = [
    { role: "system", content: system_prompt },
    ...inc.chats,
    { role: "user", content: userContent },
  ];

  // Build params with reasoning support
  const params: any = {
    model: provider_code,
    messages,
    temperature,
    max_completion_tokens,
    top_p,
    stream: true,
  };

  // Add reasoning format for reasoning models (returns reasoning in message.reasoning)
  if (reasoning) {
    params.reasoning_format = "parsed";
  }

  try {
    if (!tools) {
      const chatStream = await groqClient.chat.completions.create(params, {
        signal,
      } as any);

      for await (const chunk of chatStream as any) {
        if (signal?.aborted) break;
        
        // Handle reasoning content if present
        const reasoningToken = chunk?.choices?.[0]?.delta?.reasoning ?? "";
        if (reasoningToken) {
          yield `<think>${reasoningToken}</think>`;
        }
        
        const token = chunk?.choices?.[0]?.delta?.content ?? "";
        if (token) {
          yield token;
        }
      }
    } else {
      // Tool calling flow
      console.info("===Groq: Checking for tools===");
      const modelResponse = await groqClient.chat.completions.create({
        model: provider_code,
        messages: [
          { role: "system", content: system_prompt },
          ...inc.chats.slice(-3),
          { role: "user", content: userContent as any },
        ],
        stream: false,
        tools: toolsSchema,
      });

      const responseMessage = modelResponse.choices[0].message;
      const toolCalls = responseMessage.tool_calls || [];

      if (toolCalls.length > 0) {
        if (responseMessage.content) {
          yield responseMessage.content;
        }

        console.info("===Groq: Using Tools===");
        const toolResponses = await processToolCalls(toolCalls);

        const finalMessageArray: any[] = [
          ...messages,
          { role: "assistant", content: responseMessage.content ?? "", tool_calls: toolCalls },
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
          { signal } as any
        );

        for await (const chunk of finalResponse as any) {
          if (signal?.aborted) break;
          const token = chunk?.choices?.[0]?.delta?.content ?? "";
          if (token) yield token;
        }
      } else {
        // No tools used, stream response
        const streamResponse = await groqClient.chat.completions.create(
          { model: provider_code, messages, stream: true, temperature, max_completion_tokens, top_p },
          { signal } as any
        );

        for await (const chunk of streamResponse as any) {
          if (signal?.aborted) break;
          const token = chunk?.choices?.[0]?.delta?.content ?? "";
          if (token) yield token;
        }
      }
    }
  } catch (error) {
    if (signal?.aborted) return;
    throw error;
  }
}

// OpenRouter SDK Handler with reasoning support
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
        i.mimeType === "image/jpg"
    );
    documents = inc.imageData.filter((i) => i.mimeType === "application/pdf");
  }

  const multimodal = Boolean(image_support || pdf_support);
  const userContent: string | any[] = multimodal
    ? [
        { type: "text", text: inc.message },
        ...ImageParser({ inc: images, provider: "openrouter" }),
        ...DocumentParse({ inc: documents, provider: "openrouter" }),
      ]
    : inc.message;

  const messages: any[] = [
    { role: "system", content: system_prompt },
    ...inc.chats,
    { role: "user", content: userContent },
  ];

  const params: any = {
    model: provider_code,
    messages,
    temperature,
    maxTokens: max_completion_tokens,
    top_p,
    stream: true,
  };

  // Add reasoning support for OpenRouter
  if (reasoning) {
    params.include_reasoning = true;
  }

  try {
    if (!tools) {
      const result = await openrouterClient.chat.send(params);

      for await (const chunk of result as any) {
        if (signal?.aborted) break;
        
        // Handle reasoning content for OpenRouter
        const reasoningToken = chunk?.choices?.[0]?.delta?.reasoning ?? "";
        if (reasoningToken) {
          yield `<think>${reasoningToken}</think>`;
        }
        
        const token = chunk?.choices?.[0]?.delta?.content ?? "";
        if (token) {
          yield token;
        }
      }
    } else {
      // Tool calling for OpenRouter
      console.info("===OpenRouter: Checking for tools===");
      const modelResponse = await openrouterClient.chat.send({
        model: provider_code,
        messages: [
          { role: "system", content: system_prompt },
          ...inc.chats.slice(-3),
          { role: "user", content: userContent as any },
        ],
        stream: false,
        tools: toolsSchema as any,
      });

      const responseMessage = (modelResponse as any).choices?.[0]?.message;
      const toolCalls = responseMessage?.tool_calls || [];

      if (toolCalls.length > 0) {
        if (responseMessage.content) {
          yield responseMessage.content;
        }

        console.info("===OpenRouter: Using Tools===");
        const toolResponses = await processToolCalls(toolCalls);

        const finalMessageArray: any[] = [
          ...messages,
          { role: "assistant", content: responseMessage.content ?? "", tool_calls: toolCalls },
          ...toolResponses,
        ];

        const finalResult = await openrouterClient.chat.send({
          model: provider_code,
          messages: finalMessageArray,
          stream: true,
          temperature,
          maxTokens: max_completion_tokens,
          topP: top_p,
        });

        for await (const chunk of finalResult as any) {
          if (signal?.aborted) break;
          const token = chunk?.choices?.[0]?.delta?.content ?? "";
          if (token) yield token;
        }
      } else {
        // No tools, stream
        const streamResult = await openrouterClient.chat.send({
          model: provider_code,
          messages,
          stream: true,
          temperature,
          maxTokens: max_completion_tokens,
          topP: top_p,
        });

        for await (const chunk of streamResult as any) {
          if (signal?.aborted) break;
          const token = chunk?.choices?.[0]?.delta?.content ?? "";
          if (token) yield token;
        }
      }
    }
  } catch (error) {
    if (signal?.aborted) return;
    throw error;
  }
}

// Google Generative AI Handler
async function* handleGoogle({
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
    temperature,
    image_support,
    pdf_support,
  } = model_data;

  let images: fileUploads[] = [];
  let documents: fileUploads[] = [];
  if (inc.imageData) {
    images = inc.imageData.filter(
      (i) =>
        i.mimeType === "image/png" ||
        i.mimeType === "image/jpeg" ||
        i.mimeType === "image/jpg"
    );
    documents = inc.imageData.filter((i) => i.mimeType === "application/pdf");
  }

  const model = googleClient.getGenerativeModel({
    model: provider_code,
    systemInstruction: system_prompt,
    generationConfig: {
      maxOutputTokens: max_completion_tokens,
      temperature,
    },
  });

  // Convert chat history to Google format
  const history = inc.chats.map((chat) => ({
    role: chat.role === "assistant" ? "model" : "user",
    parts: [{ text: chat.content }],
  }));

  const chat = model.startChat({ history });

  // Build user message parts
  const parts: any[] = [{ text: inc.message }];

  // Add images if multimodal
  if (image_support && images.length > 0) {
    for (const img of images) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: Buffer.from(img.data).toString("base64"),
        },
      });
    }
  }

  // Add PDFs if supported
  if (pdf_support && documents.length > 0) {
    for (const doc of documents) {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: Buffer.from(doc.data).toString("base64"),
        },
      });
    }
  }

  try {
    const result = await chat.sendMessageStream(parts);

    for await (const chunk of result.stream) {
      if (signal?.aborted) break;
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    if (signal?.aborted) return;
    throw error;
  }
}

// ============================================
// Tool processing helper
// ============================================

async function processToolCalls(toolCalls: any[]) {
  const toolResponses = [];

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

// ============================================
// Provider registry
// ============================================

const providerHandlers: Record<string, ProviderHandler> = {
  groq: handleGroq,
  openrouter: handleOpenRouter,
  google: handleGoogle,
};

// ============================================
// Main Handler
// ============================================

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
      `Unsupported provider: "${model_data.provider}". Supported: ${Object.keys(providerHandlers).join(", ")}`
    );
  }

  try {
    yield* handler({ inc, model_data, signal });
  } catch (error: any) {
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
