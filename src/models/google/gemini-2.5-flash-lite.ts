import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function* FlashLite(message: string) {
  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash-lite-preview-06-17",
    contents: message,
  });

  for await (const chunk of stream) {
    yield chunk.text || "";
  }
}

export default FlashLite;
