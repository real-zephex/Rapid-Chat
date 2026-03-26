import ChatWorkspace from "@/ui/chat-workspace";
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ split?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const splitValue = Array.isArray(query.split) ? query.split[0] : query.split;

  return (
    <div className="w-full">
      <ChatWorkspace id={id} splitId={splitValue} />
    </div>
  );
}
