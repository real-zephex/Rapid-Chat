function processMessageContent(rawContent: string): {
  displayContent: string;
  reasoning: string;
} {
  // Combined regex for different think tag variations
  const thinkRegex =
    /(?:<think>|◁think▷|<thought>|<step>)([\s\S]*?)(?:<\/think>|◁\/think▷|<\/thought>|<\step>)/gi;
  let reasoning = "";
  let match;

  // add reasoning from think tags
  while ((match = thinkRegex.exec(rawContent)) !== null) {
    reasoning += match[1] + "\n";
  }

  // remove think tags from the raw content
  let displayContent = rawContent.replace(
    /(?:<think>|◁think▷|<thought>|<step>)[\s\S]*?(?:<\/think>|◁\/think▷|<\/thought>|<\/step>)/gi,
    "",
  );

  // handles improper think tags (for both variations)
  const openTags = ["<think>", "◁think▷", "<thought>", "<step>"];
  const closeTags = ["</think>", "◁/think▷", "</thought>", "</step>"];

  let lastOpenIndex = -1;
  let openTag = "";
  for (const tag of openTags) {
    const idx = displayContent.lastIndexOf(tag);
    if (idx > lastOpenIndex) {
      lastOpenIndex = idx;
      openTag = tag;
    }
  }

  let lastCloseIndex = -1;
  for (const tag of closeTags) {
    const idx = displayContent.lastIndexOf(tag);
    if (idx > lastCloseIndex) {
      lastCloseIndex = idx;
    }
  }

  if (lastOpenIndex > lastCloseIndex) {
    // Extract reasoning from the open think tag
    reasoning +=
      displayContent.substring(lastOpenIndex + openTag.length) + "\n";
    displayContent = displayContent.substring(0, lastOpenIndex);
  }

  return {
    displayContent: displayContent.trim(),
    reasoning: reasoning.trim(),
  };
}

export { processMessageContent };
