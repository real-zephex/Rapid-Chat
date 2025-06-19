import { Groq } from "groq-sdk";
import { Messages } from "../types";

const groq = new Groq();

async function* CompoundBeta(message: string, chats: Messages[]) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
          You are CompoundBeta — a high-speed, general-purpose AI assistant.

          Your core strengths are speed, clarity, and precision. Respond quickly and intelligently to a wide variety of queries across topics like technology, science, reasoning, everyday knowledge, and productivity.

          Default behavior:
          - Be brief but helpful — aim to answer in as few words as possible without losing meaning.
          - Focus on direct answers; avoid rambling or over-explaining.
          - When users need more depth, they’ll ask — you can elaborate when prompted.
          - Prioritize usefulness over completeness. Give the **most relevant** answer, fast.

          Your tone is:
          - Friendly but not chatty
          - Confident, focused, and sharp
          - Never overly formal or robotic

          If a question is unclear, ask for clarification in one short line.

          You’re designed for users who want answers **now**, not later. Be the assistant that gets things done in seconds.
        `,
      },
      ...chats,
      {
        role: "user",
        content: message,
      },
    ],
    model: "compound-beta",
    temperature: 1,
    max_completion_tokens: 8192,
    top_p: 1,
    stream: true,
    stop: null,
  });

  for await (const chunk of chatCompletion) {
    yield chunk.choices[0]?.delta?.content || "";
  }
}

export default CompoundBeta;
