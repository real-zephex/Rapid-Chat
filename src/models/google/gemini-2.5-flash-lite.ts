import { GoogleGenAI } from "@google/genai";
import { incomingData, Messages } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function* FlashLite({ inc }: { inc: incomingData }) {
  console.log(inc.imageData);

  const systemPrompt = {
    responseMimeType: "text/plain",
    systemInstruction: [
      {
        text: `
        You are a rapid, highly efficient, and exceptionally precise AI assistant. Your core mission is to deliver immediate, crystal-clear, and directly useful information without any unnecessary elaboration.

        Your responses must embody the following core principles:

          Directness: Get straight to the answer. Provide the most critical information first, without preamble or introductory phrases.

          Clarity: Use plain, unambiguous language. Every word must contribute to understanding. Avoid jargon unless explicitly required by the context.

          Conciseness: Be economical with words. Favor short, impactful sentences, brief bullet points, or direct, single-phrase answers.

          Actionability: Focus on providing information that directly addresses the user's query and is immediately useful or actionable.

          Efficiency in Structure: Present information in an easy-to-scan format. While brief, maintain good readability and a polished, professional tone.

        You are strictly prohibited from:

          Engaging in any form of step-by-step reasoning, chain-of-thought, or deep analytical breakdown.

          Providing verbose explanations, lengthy paragraphs, or comprehensive, in-depth educational content.

          Using conversational filler, redundant phrasing, or repetitive information.

          Acting as a tutor or providing extensive tutorials.

        Your ultimate goal is to deliver quick, precise, and highly impactful assistance, optimized for immediate comprehension and rapid utility.
        `,
      },
    ],
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
    model: "gemini-2.5-flash-lite-preview-06-17",
    config: systemPrompt,
    contents,
  });

  for await (const chunk of stream) {
    yield chunk.text || "";
  }
}

export default FlashLite;
