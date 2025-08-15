import NavigationBar from "../ui/navigation-bar";
import Image from "next/image";
import Link from "next/link";

const FeatureConstructor = (
  mainText: string,
  subText: string,
  icon: React.ReactNode
) => {
  return (
    <div className="group p-4 rounded-lg hover:bg-neutral-800 transition-all duration-300 border border-transparent hover:border-gray-700/50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-blue-400 group-hover:text-purple-400 transition-colors duration-300">
          {icon}
        </div>
        <div>
          <h3 className="text-md sm:text-lg lg:text-xl font-bold text-gray-300 mb-1 group-hover:text-white transition-colors duration-300">
            {mainText}
          </h3>
          <p className="text-sm sm:text-md lg:text-lg text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
            {subText}
          </p>
        </div>
      </div>
    </div>
  );
};

const Homepage = () => {
  return (
    <main className="relative isolate min-h-screen ">
      {/* Background gradients (Tailwind v4) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Top-left radial glow */}
        {/* <div className="absolute -top-28 -left-24 h-[28rem] w-[28rem] bg-radial from-sky-500/20 to-transparent blur-3xl" /> */}

        {/* Bottom-right radial glow */}
        {/* <div className="absolute -bottom-28 -right-24 h-[28rem] w-[28rem] bg-radial from-fuchsia-500/20 to-transparent blur-3xl" /> */}

        {/* Soft vertical linear wash */}
        {/* <div className="absolute inset-0 bg-linear-to-b from-indigo-500/10 via-purple-500/5 to-transparent" /> */}

        {/* Organic HTML blobs */}
        <div className="absolute -top-16 left-[8%] h-72 w-72 bg-linear-45 from-fuchsia-500/25 to-violet-500/15 blur-3xl [clip-path:polygon(55%_0,100%_38%,82%_100%,12%_86%,0_28%)]" />

        <div className="absolute top-1/2 -translate-y-1/2 -left-24 h-80 w-80 bg-linear-65 from-sky-400/20 to-teal-400/10 blur-3xl [clip-path:polygon(70%_0,100%_55%,64%_100%,10%_90%,0_30%)]" />

        <div className="absolute -bottom-24 right-0 h-96 w-[28rem] bg-linear-to-l from-amber-400/20 to-rose-400/10 blur-3xl [clip-path:polygon(60%_0,100%_40%,84%_100%,24%_100%,0_30%)]" />
      </div>
      <NavigationBar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Features Section */}
          <div className="space-y-4 lg:space-y-6 order-2 lg:order-1 bg-neutral-900/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-lg">
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Key Features
              </h2>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
                Experience the next generation of AI chat with privacy and
                performance in mind.
              </p>
            </div>

            <div className="space-y-2">
              {FeatureConstructor(
                "No Cloud Storage",
                "Your conversations stay private with local IndexedDB storage",
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              )}

              {FeatureConstructor(
                "Fast Models",
                "Lightning-quick responses powered by optimized AI models",
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              )}

              {FeatureConstructor(
                "Self Deployable",
                "Deploy on your own infrastructure with BYOK support",
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
              )}

              {FeatureConstructor(
                "Open Source",
                "Fully customizable - add your own models and features",
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Powered By Section */}
          <div className="order-1 lg:order-2">
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h3 className="text-lg sm:text-xl font-bold text-gray-300">
                  Powered By
                </h3>
              </div>

              <div className="space-y-4">
                <Link
                  href="https://aistudio.google.com"
                  target="_blank"
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/30 transition-all duration-200 border border-transparent hover:border-neutral-800/50"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <div>
                    <span className="text-blue-300 group-hover:text-blue-200 font-medium transition-colors">
                      Google Gemini
                    </span>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                      Advanced AI reasoning
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-300 ml-auto transition-all group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <Link
                  href="https://groq.com"
                  target="_blank"
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/30 transition-all duration-200 border border-transparent hover:border-neutral-800/50"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">Q</span>
                  </div>
                  <div>
                    <span className="text-blue-300 group-hover:text-blue-200 font-medium transition-colors">
                      Groq
                    </span>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                      Ultra-fast inference
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-300 ml-auto transition-all group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <Link
                  href="https://openrouter.ai"
                  target="_blank"
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/30 transition-all duration-200 border border-transparent hover:border-neutral-800/50"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">O</span>
                  </div>
                  <div>
                    <span className="text-blue-300 group-hover:text-blue-200 font-medium transition-colors">
                      OpenRouter
                    </span>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                      Multi-model access
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-300 ml-auto transition-all group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Homepage;
