import { Groq } from "groq-sdk";
import { Messages } from "../types";

const groq = new Groq();

async function* LlamaInstant81(message: string, chats: Messages[]) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      ...chats,
      {
        role: "user",
        content: message,
      },
    ],
    model: "llama-3.1-8b-instant",
    temperature: 1,
    max_completion_tokens: 131072,
    top_p: 1,
    stream: true,
    stop: null,
  });

  for await (const chunk of chatCompletion) {
    yield chunk.choices[0]?.delta?.content || "";
  }
}

export default LlamaInstant81;
