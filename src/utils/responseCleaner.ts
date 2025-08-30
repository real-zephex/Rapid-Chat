function processMessageContent(rawContent: string): {
  displayContent: string;
  reasoning: string;
} {
  // Combined regex for different think tag variations
  const thinkRegex = /(?:<think>|◁think▷)([\s\S]*?)(?:<\/think>|◁\/think▷)/gi;
  let reasoning = "";
  let match;

  // add reasoning from think tags
  while ((match = thinkRegex.exec(rawContent)) !== null) {
    reasoning += match[1] + "\n";
  }

  // remove think tags from the raw content
  let displayContent = rawContent.replace(/(?:<think>|◁think▷)[\s\S]*?(?:<\/think>|◁\/think▷)/gi, "");

  // handles improper think tags (for both variations)
  const openThinkIndices = [
    displayContent.lastIndexOf("<think>"),
    displayContent.lastIndexOf("◁think▷")
  ];
  const closeThinkIndices = [
    displayContent.lastIndexOf("</think>"),
    displayContent.lastIndexOf("◁/think▷")
  ];

  const lastOpenIndex = Math.max(...openThinkIndices);
  const lastCloseIndex = Math.max(...closeThinkIndices);

  if (lastOpenIndex > lastCloseIndex) {
    displayContent = displayContent.substring(0, lastOpenIndex);
  }

  return {
    displayContent: displayContent.trim(),
    reasoning: reasoning.trim(),
  };
}

export { processMessageContent };
