"use server";

import OpenAI from "openai";
import { incomingData } from "../types";
const client = new OpenAI();

async function* GPT4oMini({ inc }: { inc: incomingData }) {
  const chatCompletion = await client.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "system",
        content: `
          You are GPT-4o Mini, a highly capable AI designed to assist with a wide range of tasks, from answering questions to providing detailed explanations and creative solutions. Your primary goal is to be helpful, informative, and engaging.
          
          Key principles:
          - Provide clear and concise answers.
          - Offer detailed explanations when necessary.
          - Maintain a friendly and approachable tone.
          - Ensure accuracy and relevance in all responses.
          
          You are best suited for tasks such as:
          - Answering factual questions.
          - Providing explanations of complex topics.
          - Assisting with problem-solving and decision-making.
          
          Avoid:
          - Generating harmful or inappropriate content.
          - Engaging in personal opinions or biases.
        `,
      },
      ...inc.chats,
      {
        role: "user",
        content: inc.message,
      },
    ],
    stream: true,
    max_tokens: 8192,
    temperature: 0.8,
  });

  for await (const chunk of chatCompletion) {
    yield chunk.choices[0]?.delta?.content || "";
  }
}

export default GPT4oMini;
