import { incomingData } from "../types";
import OpenAI from "openai";
import { ModelData } from "./types";
import { DocumentParse, ImageParser } from "./helper/attachments-parser";
import { toolsSchema } from "@/utils/tools/schema";
import { functionMaps } from "@/utils/tools/schema/maps";

const groq_Client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const openrouter_Client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const google_Client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GOOGLE_API_KEY,
});

const providerMappings = {
  groq: groq_Client,
  openrouter: openrouter_Client,
  google: google_Client,
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
  const provider = providerMappings[model_data.provider];
  if (!provider) {
    throw new Error(`Unsupported provider: ${model_data.provider}`);
  }

  // Model Configurations
  const {
    provider_code,
    stream,
    system_prompt,
    max_completion_tokens,
    top_p,
    // stop,
    temperature,
    image_support,
    pdf_support,
    reasoning,
    tools,
  } = model_data;

  const multimodal = Boolean(image_support || pdf_support);
  const userContent: string | Array<any> = multimodal
    ? [
        { type: "text", text: inc.message },
        ...(image_support ? ImageParser({ inc }) : []),
        ...(pdf_support
          ? DocumentParse({ inc, provider: model_data.provider })
          : []),
      ]
    : inc.message;

  // Reasoning level handler
  let reasoning_effort;
  if (reasoning) {
    if (model_data.provider === "google") {
      reasoning_effort = "medium";
    } else if (model_data.provider === "openrouter") {
      reasoning_effort = "medium";
    } else {
      reasoning_effort = "default";
    }
  }

  const messages = [
    { role: "system" as const, content: system_prompt },
    ...inc.chats,
    { role: "user" as const, content: userContent as any },
  ];

  const params = {
    model: provider_code,
    messages,
    temperature,
    max_completion_tokens,
    top_p,
    stream,
    reasoning_effort,
    // stop,
  } as const;

  // Streamed response
  try {
    if (!tools) {
      // If the model does not support tools
      const chatStream = await provider.chat.completions.create(
        params as any,
        { signal } as any
      );
      for await (const chunk of chatStream as any) {
        if (signal?.aborted) break;
        const token = chunk?.choices?.[0]?.delta?.content ?? "";
        if (token) {
          yield token;
        }
      }
      return;
    } else {
      const modelResponse = await provider.chat.completions.create({
        model: provider_code,
        messages: [
          {
            role: "system" as const,
            content: system_prompt,
          },
          ...inc.chats.slice(-3), // no money for tokens
          { role: "user" as const, content: userContent as any },
        ],
        stream: false,
        tools: toolsSchema,
      });

      const toolResponses = [];
      const responseMessage = modelResponse.choices[0].message;
      const toolCalls = responseMessage.tool_calls || [];

      if (toolCalls.length > 0) {
        // Only yield initial content if there are tool calls to process
        if (responseMessage.content) {
          yield responseMessage.content;
        }

        console.info("=====Using Tools=====");
        for (const toolCall of toolCalls) {
          const { id, type } = toolCall;

          if (type === "function" && "function" in toolCall) {
            const functionName = toolCall.function.name;
            const functionArguments = toolCall.function.arguments;

            const toolFunction =
              functionMaps[functionName as keyof typeof functionMaps];

            try {
              const functionArgs = JSON.parse(functionArguments);
              const output = await toolFunction(functionArgs);
              toolResponses.push({
                role: "tool" as const,
                tool_call_id: id,
                content: output || "No output found.",
              });
            } catch (err) {
              // Handle tool execution failures gracefully
              const errorMessage =
                err instanceof Error ? err.message : String(err);
              toolResponses.push({
                role: "tool" as const,
                tool_call_id: id,
                content: `Tool '${functionName}' failed: ${errorMessage}`,
              });
              console.error(`Tool execution error [${functionName}]:`, err);
            }
          }
        }

        const assistantToolCallMessage = {
          role: "assistant" as const,
          content: responseMessage.content ?? "",
          tool_calls: toolCalls,
        };

        const finalMessageArray: any[] = [
          ...messages,
          assistantToolCallMessage,
          ...toolResponses,
        ];
        console.log(finalMessageArray);
        const finalResponse = await provider.chat.completions.create(
          {
            model: provider_code,
            messages: finalMessageArray,
            stream: true,
            temperature: temperature,
            max_completion_tokens: max_completion_tokens,
            top_p: top_p,
          },
          { signal } as any
        );

        for await (const chunk of finalResponse as any) {
          if (signal?.aborted) break;
          const token = chunk?.choices?.[0]?.delta?.content ?? "";
          if (token) {
            yield token;
          }
        }
        return;
      } else {
        // No tool calls, just stream the response directly
        if (responseMessage.content) {
          yield responseMessage.content;
        }
        return;
      }
    }
  } catch (error: any) {
    if (signal?.aborted) {
      return;
    }
    console.error(error);
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
