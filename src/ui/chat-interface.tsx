"use client";
import { useState } from "react";
import { models } from "../utils/model-list";

const ChatInterface = ({ id }: { id: string }) => {
  const [model, setModel] = useState<string>("scout");

  function handleModelChange(event: React.ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    const target = event.target as HTMLSelectElement;

    const model = target.value;
    setModel(model);
  }

  return (
    <div>
      {/* Chat Box */}
      <div className="absolute bottom-0 left-0 bg-black/30 max-w-full w-1/2 rounded-t-xl p-2 translate-x-1/2">
        <textarea
          className="w-full bg-black/60 rounded-t-xl text-white outline-none resize-none p-3 text-base placeholder-gray-300  placeholder:opacity-50"
          rows={4}
          placeholder="Type your message..."
        ></textarea>
        <div className="flex justify-between items-center gap-2 mt-2">
          <select
            className="bg-black/60 text-white rounded-lg px-4 h-full py-2 outline-none"
            value={model}
            onChange={handleModelChange}
          >
            {models.map((model) => (
              <option value={model} key={model} className="text-md">
                {model.toUpperCase()}
              </option>
            ))}
          </select>
          <button className="bg-teal-500 text-white rounded-lg px-4 h-full py-2 hover:bg-teal-600 transition-colors duration-300">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
