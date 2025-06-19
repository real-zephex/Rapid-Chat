"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { models } from "../utils/model-list";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const ChatInterface = ({ id }: { id: string }) => {
  const [model, setModel] = useState<string>("scout");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api?model=${model}&message=${encodeURIComponent(input)}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      let assistantMessage = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        assistantMessage += text;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: assistantMessage,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleModelChange(event: React.ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    const target = event.target as HTMLSelectElement;

    const model = target.value;
    setModel(model);
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-12px)]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-48">
        <div className="container mx-auto max-w-6xl">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-full lg:max-w-[70%] p-3 ${
                  message.role === "user"
                    ? "bg-neutral-500 text-white rounded-l-xl rounded-br-xl"
                    : "bg-neutral-800 text-white rounded-r-xl rounded-bl-xl"
                }`}
              >
                {message.role === "user" ? (
                  <div className="text-white whitespace-pre-wrap text-lg leading-7">
                    {message.content}
                  </div>
                ) : (
                  <div className="prose prose-invert prose-lg max-w-none leading-7">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code: ({ node, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          ) : (
                            <code
                              className="bg-neutral-700 px-1 py-0.5 rounded text-md"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children, ...props }) => (
                          <pre
                            className="bg-neutral-900 p-3 rounded-lg overflow-x-auto"
                            {...props}
                          >
                            {children}
                          </pre>
                        ),
                        li: ({ children, ...props }) => (
                          <li
                            className="text-lg text-white list-disc pl-4"
                            {...props}
                          >
                            {children}
                          </li>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input Form */}
      <div className="fixed bottom-0 left-0 bg-black/30 backdrop-blur-2xl max-w-full w-full lg:w-1/2 rounded-t-xl p-2 lg:translate-x-1/2 mb-1.5 ">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-black/60 rounded-t-xl text-white outline-none resize-none p-3 text-base placeholder-gray-300 placeholder:opacity-50"
            rows={3}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          ></textarea>
          <div className="flex justify-between items-center gap-2 mt-2 ">
            <select
              className="bg-black text-white rounded-lg px-4 h-full py-2 outline-none "
              value={model}
              onChange={handleModelChange}
            >
              {models.map((model) => (
                <option value={model} key={model} className="text-md">
                  {model}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isLoading}
              className={`${
                isLoading ? "bg-teal-700" : "bg-teal-500 hover:bg-teal-600"
              } text-white rounded-lg px-4 h-full py-2 transition-colors duration-300 `}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
