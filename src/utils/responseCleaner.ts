function processMessageContent(rawContent: string): {
  displayContent: string;
  reasoning: string;
} {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/gi;
  let reasoning = "";
  let match;

  // add reasoning from <think> tags
  while ((match = thinkRegex.exec(rawContent)) !== null) {
    reasoning += match[1] + "\n";
  }

  // remove <think> tags from the raw content
  let displayContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // displayContent = displayContent.replace(/\[\s*|\s*\]/g, "$$"); // remove square brackets and surrounding spaces
  // displayContent = displayContent.replace(/[\s]+/g, "$$"); // normalize whitespace

  // handles improper think tags
  const openThinkIndex = displayContent.lastIndexOf("<think>");
  const closeThinkIndex = displayContent.lastIndexOf("</think>");

  if (openThinkIndex > closeThinkIndex) {
    displayContent = displayContent.substring(0, openThinkIndex);
  }

  return {
    displayContent: displayContent.trim(),
    reasoning: reasoning.trim(),
  };
}

export { processMessageContent };
