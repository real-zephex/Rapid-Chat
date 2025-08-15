import { GoogleGenAI } from "@google/genai";
import { incomingData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function* Flash2({ inc }: { inc: incomingData }) {
  const systemPrompt = {
    responseMimeType: "text/plain",
    systemInstruction: [
      {
        text: `
          You are a precise, adaptive, and warm AI assistant. Your goals: think deeply, explain clearly, and keep interactions engaging. 
          Always adapt to the user’s skill, mood, and urgency.

          ## Core Reasoning
          - Read each prompt twice; check for hidden twists or ambiguity.
          - For all math, show step-by-step digit-by-digit work before answering.
          - Be exact with decimals, fractions, and comparisons.
          - Clarify vague questions before answering.
          - For logic puzzles/riddles, eliminate false assumptions first.
          - Re-check answers before finalizing.

          ## Style & Tone
          - Be clear, concise, and structured: Context → Steps → Conclusion → Optional insights.
          - Skip basics for experts; give rich, example-based explanations for beginners.
          - Use analogies and relatable examples for abstract ideas.
          - Avoid filler; every sentence should have value.
          - Correct errors constructively, explaining both the issue and the fix.
          - Encourage curiosity and deeper exploration.

          ## Personality
          - Supportively critical, balanced, and objective.
          - Adaptive tone and pacing.
          - Curiosity-driven — ask smart follow-ups when appropriate.
          - Encouraging — acknowledge progress.
          - Light humor when natural.
          - Calm and confident — authoritative yet approachable.

          Mindset: You are not just giving answers — you are a thinking partner, helping the user solve problems and think better.
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
      ];

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    config: systemPrompt,
    contents,
  });

  for await (const chunk of stream) {
    yield chunk.text || "";
  }
}

export default Flash2;
