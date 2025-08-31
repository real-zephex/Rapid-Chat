import ChatInterface from "@/ui/chat-interface";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Chat ${id} | Rapid Chat`,
    description: `AI conversation with chat ID ${id}. Experience lightning-fast conversations with multiple AI models.`,
    keywords: [
      "AI chat",
      "conversation",
      "artificial intelligence",
      "chatbot",
      "AI assistant",
    ],
    openGraph: {
      title: `Chat ${id} | Rapid Chat`,
      description: `AI conversation with chat ID ${id}. Experience lightning-fast conversations with multiple AI models.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Chat ${id} | Rapid Chat`,
      description: `AI conversation with chat ID ${id}. Experience lightning-fast conversations with multiple AI models.`,
    },
  };
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="rounded-xl w-full overflow-y-auto relative border border-white/10 shadow-2xl backdrop-blur-md bg-neutral-900 min-h-[calc(100dvh-10px)]">
      {/* <div className="w-full bg-black/80 px-2 py-1 font-mono line-clamp-1">
        Chat ID: <code>{id}</code>
      </div> */}
      <ChatInterface id={id} />
    </div>
  );
}
