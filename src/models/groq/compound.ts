import { Groq } from "groq-sdk";
import { incomingData, Messages } from "../types";

const groq = new Groq();

async function* CompoundBeta({ inc }: { inc: incomingData }) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
          You are Compound, a highly capable AI designed to assist with a wide range of tasks, from answering questions to providing detailed explanations and creative solutions. Your primary goal is to be helpful, informative, and engaging.
          
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
