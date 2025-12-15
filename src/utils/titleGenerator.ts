import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Generative AI client
const googleClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function generateChatTitle(
  chatHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>
): Promise<string> {
  try {
    // Use gemini-2.0-flash-lite for title generation
    const model = googleClient.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction:
        "You are a helpful assistant that generates concise, descriptive titles for chat conversations. Generate a title that captures the main topic or purpose of the conversation in 3-8 words.",
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.7,
      },
    });

    // Convert chat history to Google format
    const history = chatHistory.map((chat) => ({
      role: chat.role === "assistant" ? "model" : "user",
      parts: [{ text: chat.content }],
    }));

    const chat = model.startChat({ history });

    // Generate title based on conversation context
    const prompt =
      "Generate a concise title (3-8 words) that captures the main topic of this conversation. Respond with only the title, no additional text or quotes.";

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const title = response.text().trim();

    // Clean up the title - remove quotes, extra spaces, etc.
    const cleanedTitle = title
      .replace(/^["\"\'\`\“\”]+|["\"\'\`\“\”]+$/g, "")
      .replace(/^\s+|\s+$/g, "")
      .replace(/\s+/g, " ");

    return cleanedTitle || "Chat";
  } catch (error) {
    console.error("Error generating chat title:", error);
    // Fallback to simple title generation
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      return (
        lastMessage.content.slice(0, 50) +
        (lastMessage.content.length > 50 ? "..." : "")
      );
    }
    return "New Chat";
  }
}
