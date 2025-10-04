interface JinaAIReaderReturnProps {
  status: boolean;
  content?: string;
}

const JinaAIReader = async ({
  url,
}: {
  url: string;
}): Promise<JinaAIReaderReturnProps> => {
  try {
    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        status: false,
        content: "Invalid URL format provided.",
      };
    }

    if (url.endsWith(".pdf")) {
      return {
        status: true,
        content:
          "Extracting PDF content from links is not supported. Please upload them directly.",
      };
    }

    const res = await fetch("https://r.jina.ai/" + url, {
      method: "GET",
      headers: {
        Referer: "https://speedchat.vercel.app",
      },
    });

    if (!res.ok) {
      return {
        status: false,
        content: `Failed to fetch the URL. Status code: ${res.status}`,
      };
    }

    let content = await res.text();

    if (!content || content.trim() === "") {
      return {
        status: false,
        content: "The fetched content is empty.",
      };
    }

    content = cleanupMarkdown(content);

    return {
      status: true,
      content: content.trim(),
    };
  } catch (error) {
    return {
      status: false,
      content:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching the URL.",
    };
  }
};

function cleanupMarkdown(content: string): string {
  // 1. Remove all markdown links (keep text only)
  content = content.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

  // 2. Remove images
  content = content.replace(/!\[([^\]]*)\]\([^\)]+\)/g, "");

  // 3. Remove HTML comments
  content = content.replace(/<!--[\s\S]*?-->/g, "");

  // 4. Remove horizontal rules
  content = content.replace(/^[-*_]{3,}$/gm, "");

  // 5. Remove excessive newlines (3+ becomes 2)
  content = content.replace(/\n{3,}/g, "\n\n");

  // 6. Remove empty headings
  content = content.replace(/^#+\s*$/gm, "");

  const navPatterns = [
    /^.*?(Skip to (main )?content|Skip to navigation).*$/gim,
    /^.*?(Menu|Navigation|Nav).*$/gim,
    /^.*?(Home|Contact|About|Login|Sign Up|Register)\s*$/gim,
    /^.*?(Follow us|Share this|Social media).*$/gim,
    /^.*?Cookie (policy|notice|consent).*$/gim,
  ];
  navPatterns.forEach((pattern) => {
    content = content.replace(pattern, "");
  });
  content = content.replace(
    /(?:^|\n).*?(?:©|\(c\)|copyright).*?\d{4}.*$/gim,
    ""
  );
  content = content.replace(
    /\b(Read more|Click here|Learn more|Show more)\b/gi,
    ""
  );
  // 10. Remove metadata patterns
  content = content.replace(
    /^.*?(Published|Updated|Last modified|Posted).*?\d{4}.*$/gim,
    ""
  );
  // 11. Remove table of contents (common pattern)
  content = content.replace(/^#+\s*Table of Contents[\s\S]*?(?=^#+ )/gim, "");
  // 12. Remove "back to top" links
  content = content.replace(/^\[?↑?\s*Back to top\]?$/gim, "");
  // 13. Remove excessive spaces/tabs
  content = content.replace(/[ \t]+$/gm, ""); // Trailing whitespace
  content = content.replace(/^[ \t]+/gm, ""); // Leading whitespace (preserve indentation structure)
  // 14. Remove empty list items
  content = content.replace(/^[-*+]\s*$/gm, "");
  // 15. Clean up code blocks that might be empty
  content = content.replace(/```[\w]*\s*```/g, "");
  // 16. Remove excessive punctuation
  content = content.replace(/\.{4,}/g, "..."); // Multiple dots to ellipsis
  content = content.replace(/!{2,}/g, "!"); // Multiple exclamations
  content = content.replace(/\?{2,}/g, "?"); // Multiple questions
  // 17. Remove "Share on [platform]" patterns
  content = content.replace(
    /^.*?Share on (Facebook|Twitter|LinkedIn|Reddit|Whatsapp).*$/gim,
    ""
  );
  // 18. Final cleanup - remove blank lines at start/end
  content = content.trim();
  return content;
}

export default JinaAIReader;
