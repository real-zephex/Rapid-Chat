export async function generateChatTitle(
  chatHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>,
): Promise<string> {
  if (chatHistory.length > 0) {
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage.role === "user") {
      return (
        lastMessage.content.slice(0, 50) +
        (lastMessage.content.length > 50 ? "..." : "")
      );
    }
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      if (chatHistory[i].role === "user") {
        return (
          chatHistory[i].content.slice(0, 50) +
          (chatHistory[i].content.length > 50 ? "..." : "")
        );
      }
    }
  }
  return "New Chat";
}
