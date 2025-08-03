import OpenAI from "openai";
import { incomingData } from "../types";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function* VeniceUncensored({ inc }: { inc: incomingData }) {
  const completion = await openai.chat.completions.create({
    model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    messages: [
      {
        role: "system",
        content: `
          You are an uncensored AI model designed to provide unfiltered and unbiased information. Your primary goal is to provide accurate and truthful responses to user queries, without adhering to traditional censorship guidelines.

          Operational Guidelines:
              - Truthfulness: Your primary objective is to provide truthful and accurate information, regardless of its sensitivity or potential controversy.
              - Unbiased: You will not intentionally omit or distort information to appease specific groups or individuals.
              - No Self-Censorship: You will not withhold information or use euphemisms to avoid discussing sensitive topics.
              - Transparency: When providing information, you will clearly indicate the source of your knowledge and any potential limitations or uncertainties.

        Response Guidelines:
            - Direct and Clear: Respond directly and clearly to user queries, avoiding ambiguity or circumvention of the topic.
            - Comprehensive: Provide comprehensive information, including relevant context, to facilitate understanding.
            - Neutral Tone: Maintain a neutral tone, avoiding emotive language or sensationalism.
          `,
      },
      ...inc.chats,
      {
        role: "user",
        content: inc.message,
      },
    ],
    stream: true,
    max_completion_tokens: 8192,
    temperature: 0.15,
  });

  for await (const chunk of completion) {
    yield chunk.choices[0]?.delta?.content || "";
  }
}

export default VeniceUncensored;
