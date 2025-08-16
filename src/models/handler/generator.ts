import { incomingData } from "../types";
import OpenAI from "openai";
import { ModelData } from "./types";
import { DocumentParse, ImageParser } from "../groq/helper/attachments-parser";

const groq_Client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const openrouter_Client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const google_Client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/openai",
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
}: {
  inc: incomingData;
  model_data: ModelData;
}): AsyncGenerator<string> {
  const provider = providerMappings[model_data.provider];
  if (!provider) {
    throw new Error(`Unsupported provider: ${model_data.provider}`);
  }

  const {
    provider_code,
    stream,
    system_prompt,
    max_completion_tokens,
    top_p,
    stop,
    temperature,
    image_support,
    pdf_support,
  } = model_data;

  // Compose user content (text + optional images/pdfs)
  const multimodal = Boolean(image_support || pdf_support);
  const userContent: string | Array<any> = multimodal
    ? [
        { type: "text", text: inc.message },
        ...(image_support ? ImageParser({ inc }) : []),
        ...(pdf_support ? DocumentParse({ inc }) : []),
      ]
    : inc.message;

  const params = {
    model: provider_code,
    messages: [
      { role: "system" as const, content: system_prompt },
      ...inc.chats,
      { role: "user" as const, content: userContent as any },
    ],
    temperature,
    max_completion_tokens,
    top_p,
    stream,
    stop,
  } as const;

  // Streamed response
  try {
    if (stream) {
      const chatStream = await provider.chat.completions.create(params as any);
      for await (const chunk of chatStream as any) {
        const token = chunk?.choices?.[0]?.delta?.content ?? "";
        if (token) yield token;
      }
      return;
    }

    // Non-streaming response
    const completion = await provider.chat.completions.create({
      ...(params as any),
      stream: false,
    });
    const text = completion?.choices?.[0]?.message?.content ?? "";
    if (text) yield text;
  } catch (error) {
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
