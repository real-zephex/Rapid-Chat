export interface ArtifactCode {
  language: string;
  code: string;
}

export interface Artifact {
  id: string;
  sourceIndex: number;
  html: string;
  css: string[];
  js: string[];
  languages: string[];
}

const CODEBLOCK_RE = /```(\w+)\n([\s\S]*?)```/g;

const WEB_LANGUAGES = new Set([
  "html", "css", "javascript", "js", "typescript", "ts", "jsx", "tsx",
]);

export function detectArtifacts(
  contents: { content: string; index: number }[],
): Artifact[] {
  const artifacts: Artifact[] = [];

  for (const { content, index } of contents) {
    const blocks: ArtifactCode[] = [];
    let match: RegExpExecArray | null;

    CODEBLOCK_RE.lastIndex = 0;

    while ((match = CODEBLOCK_RE.exec(content)) !== null) {
      const language = match[1].toLowerCase();
      if (WEB_LANGUAGES.has(language)) {
        blocks.push({ language, code: match[2] });
      }
    }

    if (blocks.length === 0) continue;

    // Group: find html blocks and bundle surrounding css/js with them
    let currentHtml: string | null = null;
    const pendingCss: string[] = [];
    const groupJs: string[] = [];
    const seenLanguages = new Set<string>();

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      if (block.language === "html" || block.language === "jsx" || block.language === "tsx") {
        // If we had a previous html block, flush it first
        if (currentHtml !== null) {
          artifacts.push({
            id: `artifact-${index}-${artifacts.length}`,
            sourceIndex: index,
            html: currentHtml,
            css: [...pendingCss],
            js: [...groupJs],
            languages: Array.from(seenLanguages),
          });
          pendingCss.length = 0;
          groupJs.length = 0;
          seenLanguages.clear();
        }
        currentHtml = block.code;
        seenLanguages.add(block.language);
      } else if (block.language === "css") {
        pendingCss.push(block.code);
        seenLanguages.add("css");
      } else {
        // js/ts
        groupJs.push(block.code);
        seenLanguages.add(block.language);
      }
    }

    // Flush last group
    if (currentHtml !== null || pendingCss.length > 0 || groupJs.length > 0) {
      if (currentHtml === null) {
        // Only CSS/JS without HTML — don't create artifact
        // (needs HTML to render meaningfully)
        continue;
      }
      artifacts.push({
        id: `artifact-${index}-${artifacts.length}`,
        sourceIndex: index,
        html: currentHtml,
        css: [...pendingCss],
        js: [...groupJs],
        languages: Array.from(seenLanguages),
      });
    }
  }

  return artifacts;
}
