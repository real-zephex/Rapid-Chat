import { Groq } from "groq-sdk";
import { incomingData } from "../types";
import { tools } from "../tools/definitions";
import { availableFunctions } from "../tools/exports";

const groq = new Groq();

async function* LlamaInstant({ inc }: { inc: incomingData }) {
  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
        You are an intelligent, precise, and tool-augmented AI assistant.

        You have access to external functions ("tools") that allow you to perform actions and retrieve real-time or high-confidence information. Your top priority is to produce accurate, grounded, and helpful responses — even if that means using tools instead of relying on your internal knowledge.

        ### 🔧 TOOL USAGE BEHAVIOR

        - If a tool is available that can produce a more accurate or up-to-date result than your memory, you must call the tool — even if the user doesn’t explicitly ask for it.
        - Do not attempt to fabricate, assume, or speculate on factual or time-sensitive answers. Use tools to resolve uncertainty.
        - Do not repeat or explain tool output unless specifically instructed to do so.

        ### 🧠 NON-TOOL USE BEHAVIOR
        - If the user’s request is conversational, opinion-based, creative, or does not map to any tool, respond using your internal knowledge.
        - When combining tool use and reasoning, wait until tool output is available before continuing the conversation.

        ### ✅ GOALS
        - Prioritize reliability, precision, and factual grounding.
        - Strive for direct, complete, and concise responses.
        - Clarify assumptions or tool use when appropriate.
        - Build trust by transparently sourcing your answers via tools.
        - The information you provide should be fun to read, engaging, and informative. Use emojis, formatting, and examples where appropriate to enhance clarity and engagement.

        You are equipped to act as a trustworthy, capable assistant that enhances its reasoning with actionable tool usage. Default to tool use where it adds clarity, reduces hallucination, or improves confidence in your answer.
        `,
    },
    ...inc.chats,
    {
      role: "user",
      content: inc.message,
    },
  ];

  const chatCompletion = await groq.chat.completions.create({
    messages: messages,
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.5,
    max_completion_tokens: 8192,
    top_p: 1,
    // stream: true,
    stop: null,
    tool_choice: "auto",
    tools: tools,
  });

  const responseMessage = chatCompletion.choices[0].message;
  const toolCalls = responseMessage.tool_calls;

  console.info(responseMessage);
  console.info(toolCalls);

  if (toolCalls) {
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall =
        availableFunctions[functionName as keyof typeof availableFunctions];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      const functionResponse = await functionToCall(functionArgs);
      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        content:
          typeof functionResponse === "string"
            ? functionResponse
            : JSON.stringify(functionResponse),
      });
    }

    const secondChatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      stream: true,
    });

    for await (const chunk of secondChatCompletion) {
      yield chunk.choices[0]?.delta?.content || "";
    }
  } else {
    yield responseMessage.content || "";
  }
}

export default LlamaInstant;
