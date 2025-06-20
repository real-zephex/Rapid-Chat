import ChatInterface from "@/ui/chat-interface";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="bg-black/15 rounded-xl w-full overflow-y-auto relative">
      {/* <div className="w-full bg-black/80 px-2 py-1 font-mono line-clamp-1">
        Chat ID: <code>{id}</code>
      </div> */}
      <ChatInterface id={id} />
    </div>
  );
}
