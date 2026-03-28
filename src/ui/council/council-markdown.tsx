import { type Components } from "react-markdown";
import CopyButton from "@/ui/chat-components/CopyButton";

const getTextContent = (node: unknown): string => {
  if (typeof node === "string") return node;
  if (!node || typeof node !== "object") return "";
  const n = node as { props?: { children?: unknown } };
  if (!n.props?.children) return "";
  if (Array.isArray(n.props.children)) {
    return n.props.children.map(getTextContent).join("");
  }
  return getTextContent(n.props.children);
};

const getLanguage = (node: unknown): string => {
  if (!node || typeof node !== "object") return "";
  const n = node as { props?: { className?: string; children?: unknown } };
  const className = n.props?.className;
  if (className) {
    const match = /language-(\w+)/.exec(className);
    if (match) return match[1];
  }
  if (!n.props?.children) return "";
  if (Array.isArray(n.props.children)) {
    for (const child of n.props.children) {
      const lang = getLanguage(child);
      if (lang) return lang;
    }
    return "";
  }
  return getLanguage(n.props.children);
};

export const councilMarkdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="mb-4 mt-6 text-xl font-semibold text-text-primary" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mb-3 mt-5 text-lg font-semibold text-text-primary" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold text-text-primary" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-3 last:mb-0 text-sm leading-relaxed text-text-primary" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-3 list-disc space-y-1.5 pl-5 text-sm text-text-primary" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-5 text-sm text-text-primary" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-sm leading-relaxed text-text-primary" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-3 border-l-4 border-border pl-4 italic text-text-secondary text-sm"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: ({ ...props }) => <hr className="my-6 border-border" {...props} />,
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded bg-background px-1.5 py-0.5 font-mono text-[0.9em] text-accent"
          {...props}
        >
          {children}
        </code>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  },
  pre: ({ children, ...props }) => {
    const codeText = getTextContent(children);
    const language = getLanguage(children);

    return (
      <div className="group relative my-3 overflow-hidden rounded-xl border border-border bg-background first:mt-2 last:mb-1">
        {language && (
          <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            <span>{language}</span>
          </div>
        )}
        <pre
          className={`chat-code-pre m-0 overflow-x-auto bg-transparent text-text-primary ${
            language ? "px-4 pb-3 pt-2.5" : "p-4"
          }`}
          {...props}
        >
          {children}
        </pre>
        <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <CopyButton text={codeText} hasLanguageLabel={Boolean(language)} />
        </div>
      </div>
    );
  },
  table: ({ children, ...props }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm text-text-primary" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border-b border-border bg-surface-hover px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-b border-border px-3 py-2 text-sm text-text-primary" {...props}>
      {children}
    </td>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="font-medium text-accent underline-offset-2 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-text-primary" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-text-secondary" {...props}>
      {children}
    </em>
  ),
  div: ({ children, ...props }) => {
    const ariaHidden = (props as Record<string, unknown>)["aria-hidden"];
    if (ariaHidden === "true" || ariaHidden === true) return null;
    return <div {...props}>{children}</div>;
  },
  span: ({ children, ...props }) => {
    const ariaHidden = (props as Record<string, unknown>)["aria-hidden"];
    if (ariaHidden === "true" || ariaHidden === true) return null;
    return <span {...props}>{children}</span>;
  },
};
