import ChatInterface from "@/ui/chat-interface";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="rounded-xl w-full overflow-y-auto relative border border-white/10 shadow-2xl  backdrop-blur-md bg-neutral-900">
      {/* <div className="w-full bg-black/80 px-2 py-1 font-mono line-clamp-1">
        Chat ID: <code>{id}</code>
      </div> */}
      <ChatInterface id={id} />
    </div>
  );
}
