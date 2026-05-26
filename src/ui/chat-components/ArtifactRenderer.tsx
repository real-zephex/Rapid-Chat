"use client";
import { memo, useMemo } from "react";

interface ArtifactRendererProps {
  html: string;
  css: string[];
  js: string[];
}

function buildFullDocument(html: string, css: string[], js: string[]): string {
  const styleTag =
    css.length > 0
      ? `<style>\n${css.join("\n\n")}\n</style>`
      : "";

  const scriptTag =
    js.length > 0
      ? `<script>\n${js.join("\n\n")}\n</script>`
      : "";

  // If the html already looks like a full document, inject style/script into <head>
  if (/<html[\s>]/i.test(html) || /<!DOCTYPE/i.test(html)) {
    return html.replace(
      /<\/head>/i,
      `${styleTag}\n${scriptTag}\n</head>`,
    );
  }

  // Otherwise wrap in a minimal document
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${styleTag}
</head>
<body>
${html}
${scriptTag}
</body>
</html>`;
}

const ArtifactRenderer = memo(function ArtifactRenderer({
  html,
  css,
  js,
}: ArtifactRendererProps) {
  const srcdoc = useMemo(
    () => buildFullDocument(html, css, js),
    [html, css, js],
  );

  return (
    <iframe
      sandbox="allow-scripts"
      srcDoc={srcdoc}
      title="Artifact Preview"
      className="h-full w-full border-0"
    />
  );
});

export default ArtifactRenderer;
