import ChatInterface from "@/ui/chat-interface";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="bg-black/20 rounded-xl w-full overflow-y-auto relative flex flex-col  gap-1">
      <div className="w-full bg-black/80 p-4 font-mono">
        Chat ID: <code>{id}</code>
      </div>
      <ChatInterface id={id} />
    </div>
  );
}
