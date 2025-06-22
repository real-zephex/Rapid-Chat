import GetStarted from "@/ui/get-started";
import {
  FaBolt,
  FaShieldAlt,
  FaRocket,
  FaBrain,
  FaCode,
  FaLightbulb,
  FaDatabase,
  FaGlobe,
} from "react-icons/fa";

export default function Home() {
  const features = [
    {
      icon: <FaBolt className="text-yellow-400" size={24} />,
      title: "Lightning Fast",
      description:
        "Ultra-fast streaming responses with instant UI updates. No waiting, just immediate results.",
      highlight: "Answers in milliseconds",
    },
    {
      icon: <FaShieldAlt className="text-green-400" size={24} />,
      title: "Privacy First",
      description:
        "Zero cloud storage. All your conversations stay on your device with unlimited IndexedDB storage.",
      highlight: "100% Local Storage",
    },
    {
      icon: <FaBrain className="text-purple-400" size={24} />,
      title: "5 Specialized AI Models",
      description:
        "From lightning-fast responses to deep reasoning. Choose the perfect AI for your specific needs.",
      highlight: "One Interface, Multiple AIs",
    },
    {
      icon: <FaRocket className="text-blue-400" size={24} />,
      title: "Modern Tech Stack",
      description:
        "Built with Next.js 15, React 19, and TypeScript. Cutting-edge performance and reliability.",
      highlight: "Latest Technology",
    },
  ];

  const models = [
    {
      name: "Scout",
      purpose: "General Knowledge",
      description: "Accurate & reliable for factual information",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "LlamaInstant",
      purpose: "Conversational",
      description: "Ultra-fast & engaging conversations",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Flash",
      purpose: "Quick Facts",
      description: "Direct & concise responses",
      color: "from-yellow-500 to-orange-500",
    },
    {
      name: "Qwen",
      purpose: "Deep Analysis",
      description: "Complex reasoning & expert insights",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Devstral",
      purpose: "Coding Assistant",
      description: "Programming help & code solutions",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <div className="backdrop-blur-md bg-transparent rounded-xl w-full overflow-y-auto border border-white/10 shadow-2xl max-h-[calc(100dvh-12px)]">
      <div className="relative w-full min-h-[calc(100dvh-15px)] flex flex-col p-6 lg:p-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center py-16 lg:py-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              Rapid Chat
            </h1>
            <FaBolt className="text-teal-200 animate-pulse" size={32} />
          </div>

          <p className="text-xl lg:text-2xl text-gray-300/90 leading-relaxed max-w-4xl mx-auto mb-4 min-h-[2.5rem] lg:min-h-[3rem]">
            <span>
              The fastest AI chat interface with zero cloud dependencies
            </span>
          </p>

          <p className="text-base lg:text-lg text-gray-400 leading-relaxed max-w-3xl mx-auto mb-12">
            Experience lightning-fast conversations with 5 specialized AI
            models. All your data stays private on your device with unlimited
            local storage.
          </p>

          <GetStarted />
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto w-full mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            Why Choose Rapid Chat?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-neutral-900/50 rounded-2xl p-6 lg:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    {feature.icon}
                    <h3 className="text-xl lg:text-2xl font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-gray-300 mb-3 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="inline-flex items-center gap-2 text-sm font-medium text-teal-300">
                    <FaLightbulb size={14} />
                    {feature.highlight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Models Showcase */}
        <div className="max-w-7xl mx-auto w-full mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            5 Specialized AI Models
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Each model is optimized for specific tasks. Switch between them
            instantly to get the perfect response for your needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {models.map((model, index) => (
              <div
                key={index}
                className="relative bg-neutral-900/40 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {model.name}
                    </h3>
                  </div>

                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${model.color} text-white mb-3`}
                  >
                    {model.purpose}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    {model.description}
                  </p>
                </div>
              </div>
            ))}

            {/* And Many More Card */}
            <div className="relative bg-neutral-900/40 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-gray-700/20 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    And Many More...
                  </h3>
                </div>

                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-500 to-gray-700 text-white mb-3">
                  Expanding Collection
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">
                  New models are constantly being added and optimized. Some
                  models may be updated or removed to ensure the best
                  performance and user experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Highlights */}
        <div className="max-w-5xl mx-auto w-full text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            Built for Performance
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-3 border border-blue-500/30">
                <FaRocket className="text-blue-400" size={24} />
              </div>
              <h4 className="font-semibold text-white mb-1">Next.js 15</h4>
              <p className="text-sm text-gray-400">Latest React framework</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3 border border-purple-500/30">
                <FaCode className="text-purple-400" size={24} />
              </div>
              <h4 className="font-semibold text-white mb-1">TypeScript</h4>
              <p className="text-sm text-gray-400">Type-safe codebase</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-3 border border-green-500/30">
                <FaDatabase className="text-green-400" size={24} />
              </div>
              <h4 className="font-semibold text-white mb-1">IndexedDB</h4>
              <p className="text-sm text-gray-400">Unlimited storage</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-3 border border-yellow-500/30">
                <FaGlobe className="text-yellow-400" size={24} />
              </div>
              <h4 className="font-semibold text-white mb-1">Multi-API</h4>
              <p className="text-sm text-gray-400">Best AI providers</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-8 right-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
}
