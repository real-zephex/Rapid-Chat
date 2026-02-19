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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center max-w-md">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-text-muted"
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
        <h1 className="text-2xl font-bold text-text-primary mb-2 font-space-grotesk">
          No Chat Selected
        </h1>
        <p className="text-text-secondary mb-6">
          Create a new conversation or select an existing one from the sidebar
          to get started.
        </p>
        <div className="bg-surface border border-border p-4 rounded-xl">
          <p className="text-text-muted text-sm">
            Tip: Use the sidebar navigation to manage your conversations
          </p>
        </div>
      </div>
    </div>
  );
}
