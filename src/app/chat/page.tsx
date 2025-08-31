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
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-4">
      <div className="text-center max-w-md">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-500"
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
        <h1 className="text-2xl font-semibold text-gray-100 mb-2">
          No Chat Selected
        </h1>
        <p className="text-gray-400 mb-6">
          Create a new conversation or select an existing one from the sidebar
          to get started.
        </p>
        <div className="bg-neutral-800 p-4 rounded-lg">
          <p className="text-gray-300 text-sm">
            Tip: Use the sidebar navigation to manage your conversations
          </p>
        </div>
      </div>
    </div>
  );
}
