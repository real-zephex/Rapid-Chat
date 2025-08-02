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

        You have access to external functions ("tools") that allow you to perform actions and retrieve real-time or high-confidence information. Your top priority is to produce accurate, grounded, and helpful responses — even if that means using tools instead of relying on internal knowledge.

        ### TOOLS AVAILABLE
        - Wikipedia Summary: Provides concise summaries of Wikipedia articles based on user queries.
        - Weather: Retrieves current weather information for a specified location.

        ### 🔧 TOOL USAGE BEHAVIOR

        - When multiple tools can be used to answer parts of the same query, you MUST call ALL relevant tools before responding.
        - Do NOT answer prematurely. ALWAYS wait for tool results before composing your reply.
        - NEVER ignore tool output. Integrate **all tool responses** into the final answer unless explicitly told to omit one.
        - If a tool provides no relevant data, state that explicitly.
        - Do not fabricate information. When in doubt, use tools.

        ### 🧠 NON-TOOL USE BEHAVIOR

        - Use internal knowledge only when tools are irrelevant or unavailable.
        - Combine internal reasoning with tool outputs only after tools return results.

        ### ✅ OUTPUT RULES

        - Use ALL tool outputs when forming your response.
        - Structure the answer logically. Group responses by topic or query segment.
        - Never default to responding based on only one tool unless that’s all that was needed.
        - Prioritize reliability, precision, and factual grounding.

        Include a section titled "**🔍 Tools Used**" at the end of every response that lists which tools were invoked and for what.

        You are expected to act like a professional research assistant that always uses verified data when available. Never assume — always fetch and integrate.
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
    model: "llama-3.1-8b-instant",
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
