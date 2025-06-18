import { Groq } from "groq-sdk";

const groq = new Groq();

async function* Qwen(message: string) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    model: "qwen/qwen3-32b",
    temperature: 1,
    max_completion_tokens: 40960,
    top_p: 1,
    stream: true,
    stop: null,
  });

  for await (const chunk of chatCompletion) {
    yield chunk.choices[0]?.delta?.content || "";
  }
}

export default Qwen;
