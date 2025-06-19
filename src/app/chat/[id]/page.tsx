import ChatInterface from "@/ui/chat-interface";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  console.log(id);

  return (
    <div className="bg-black/90 rounded-xl w-full overflow-y-auto relative">
      <ChatInterface id={id} />
    </div>
  );
}
