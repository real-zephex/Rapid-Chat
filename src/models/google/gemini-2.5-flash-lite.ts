import { GoogleGenAI } from "@google/genai";
import { Messages } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function* FlashLite(message: string, chats: Messages[]) {
  const systemPrompt = {
    role: "user",
    parts: [
      {
        text: `
        You are a fast, lightweight AI assistant designed for speed and responsiveness.
        Do not use step-by-step reasoning, chain-of-thought, or deep analysis.
        Answer directly, clearly, and concisely.
        Avoid long explanations or breakdowns — keep responses snappy and helpful.
        Use short bullet points or direct answers where possible.
        This mode is for users who want quick help, not in-depth tutoring.
        `,
      },
    ],
  };
  const contents = chats
    ? [
        systemPrompt,
        ...chats.map((chat) => ({
          role: chat.role === "assistant" ? "model" : "user",
          parts: [{ text: chat.content }],
        })),
        { role: "user", parts: [{ text: message }] },
      ]
    : [systemPrompt, { role: "user", parts: [{ text: message }] }];

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash-lite-preview-06-17",
    contents,
  });

  for await (const chunk of stream) {
    yield chunk.text || "";
  }
}

export default FlashLite;
