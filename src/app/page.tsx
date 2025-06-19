import GetStarted from "@/ui/get-started";
import { FaBolt } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="backdrop-blur-md bg-black/75 rounded-xl w-full overflow-y-auto border border-white/10 shadow-2xl">
      <div className="relative w-full min-h-[calc(100dvh-15px)] flex flex-col items-center justify-center p-8 lg:p-28 gap-8">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-teal-500/10 rounded-xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] rounded-xl" />

        {/* Content with relative positioning to appear above gradients */}
        <div className="relative space-y-6 max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              Welcome to Rapid Chat
            </h1>
            <FaBolt className="text-teal-200 animate-pulse" size={24} />
          </div>

          <p className="tracking-wide text-base lg:text-xl text-gray-300/90 leading-relaxed max-w-2xl mx-auto">
            My attempt at making{" "}
            <span className="font-semibold text-teal-200">
              superfast AI interfaces
            </span>{" "}
            so you don&#39;t have to wait for LLMs to respond.
          </p>

          <div className="mt-12">
            <GetStarted />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-8 right-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
