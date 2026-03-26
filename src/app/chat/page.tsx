import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | Rapid Chat",
  description:
    "Start a new AI conversation. Experience lightning-fast conversations with multiple AI models in one unified interface.",
  keywords: [
    "AI chat",
    "new conversation",
    "artificial intelligence",
    "chatbot",
    "AI assistant",
  ],
  openGraph: {
    title: "Chat | Rapid Chat",
    description:
      "Start a new AI conversation. Experience lightning-fast conversations with multiple AI models in one unified interface.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Chat | Rapid Chat",
    description:
      "Start a new AI conversation. Experience lightning-fast conversations with multiple AI models in one unified interface.",
  },
};

export default async function ChatPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="mb-2 text-2xl font-semibold text-text-primary">
          No Chat Selected
        </h1>
        <p className="mb-6 text-text-secondary">
          Create a new conversation or select an existing one from the sidebar
          to get started.
        </p>
        <div className="rounded-xl border border-border bg-background p-4 text-left">
          <p className="text-sm text-text-muted">Tip: Press Ctrl+B to toggle the sidebar quickly.</p>
        </div>
      </div>
    </div>
  );
}
