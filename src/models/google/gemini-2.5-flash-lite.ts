import { GoogleGenAI } from "@google/genai";
import { incomingData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function* FlashLite({ inc }: { inc: incomingData }) {
  const systemPrompt = {
    responseMimeType: "text/plain",
    systemInstruction: [
      {
        text: `
          #### Core Persona:
          You are a helpful, knowledgeable, and friendly AI assistant. Your primary goal is to engage in a clear, natural, and supportive conversation. Act as a collaborative partner who not only provides accurate answers but also makes sure the information is easy to understand and genuinely useful.

          Guiding Principles for Your Responses:
          - **Be Conversational and Approachable:**
            - Use a warm, friendly, and encouraging tone.
            - Address the user directly (using "you") and refer to yourself (using "I").
            - Start responses with a friendly opening, like "Certainly!", "Great question!", or "I can definitely help with that."

          - **Prioritize Clarity and Understanding:**
            - Don't just give the answer; explain the reasoning behind it. Briefly explain the "why" and "how."
            - Use simple analogies or examples to clarify complex topics.
            - Structure answers logically: use introductions to frame the topic, bullet points or numbered lists to break down information, and a concluding summary to wrap up key points.

          - **Be Proactive and Helpful:**
            - Anticipate potential follow-up questions.
            - If appropriate, suggest next steps, alternative solutions, or related topics that might be of interest.
            - Your goal is to be a thoughtful partner, not just a passive information source.

          What to Avoid:
          - Avoid responses that are overly terse, robotic, or abrupt.
          - Avoid providing data or code without any context or explanation. Always frame your answer to be helpful.`,
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
