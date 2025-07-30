import { GoogleGenAI } from "@google/genai";
import { incomingData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function* Gemma3({ inc }: { inc: incomingData }) {
  const systemPrompt = {
    responseMimeType: "text/plain",
    maxOutputTokens: 8192,
  };
  const contents = inc.chats
    ? [
        ...inc.chats.map((chat) => ({
          role: chat.role === "assistant" ? "model" : "user",
          parts: [{ text: chat.content }],
        })),
        {
          role: "user",
          parts: [
            { text: inc.message },
            ...(inc.imageData
              ? inc.imageData.map((img) => ({
                  inlineData: {
                    data: Buffer.from(img.data).toString("base64"),
                    mimeType: img.mimeType,
                  },
                }))
              : []),
          ],
        },
      ]
    : [
        {
          role: "user",
          parts: [{ text: inc.message }],
          ...(inc.imageData
            ? inc.imageData.map((img) => ({
                inlineData: {
                  data: Buffer.from(img.data).toString("base64"),
                  mimeType: img.mimeType,
                },
              }))
            : []),
        },
      ];

  const stream = await ai.models.generateContentStream({
    model: "gemma-3-27b-it",
    config: systemPrompt,
    contents,
  });

  for await (const chunk of stream) {
    yield chunk.text || "";
  }
}

export default Gemma3;
