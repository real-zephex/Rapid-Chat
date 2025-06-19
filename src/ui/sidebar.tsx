"use client";

import { useState } from "react";

const Sidebar = () => {
  const [expand, setExpanded] = useState<boolean>(false);

  return (
    <div
      className={`bg-black/90 select-none ${
        expand ? "w-72" : "w-16"
      } min-h-[calc(100dvh-15px)] rounded-xl transition-width duration-300 ease-in-out`}
    >
      <p
        className="p-4 text-center font-semibold"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expand ? "Fast Chat" : "FC"}
      </p>
      <hr />
    </div>
  );
};

export default Sidebar;
