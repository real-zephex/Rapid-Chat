import GetStarted from "@/ui/get-started";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const coreFeatures = [
    {
      icon: "🔒",
      title: "Privacy-First Architecture",
      description:
        "Zero cloud storage. All chats, uploads, and interactions stay 100% local in your browser (IndexedDB). No telemetry, no analytics, no data ever leaves your device.",
      highlight: "GDPR Compliant",
    },
    {
      icon: "⚡",
      title: "Ultra-Fast + Streaming UI",
      description:
        "Token-level streaming, live TPS monitor, minimal UI latency. Feels faster than commercial tools with <think> tag rendering and inline markdown previews.",
      highlight: "Real-time streaming",
    },
    {
      icon: "🤖",
      title: "Multi-Model Access",
      description:
        "Choose from multiple specialized models for different tasks (coding, research, summarization). Integrated tool calling for Wikipedia, Weather, Whisper, and more.",
      highlight: "Specialized models",
    },
    {
      icon: "🧠",
      title: "Dev-Centric UX",
      description:
        "Keyboard-first interface with Command Palette. Clean markdown rendering. All interactions are inspectable and debuggable — made for builders.",
      highlight: "Built for developers",
    },
    {
      icon: "💰",
      title: "BYOK (Bring Your Own Key)",
      description:
        "When self-hosting: plug in your own API keys for OpenAI, Gemini, Groq, and other providers. No usage markup — you pay providers directly.",
      highlight: "No middlemen",
    },
    {
      icon: "🌐",
      title: "Fully Open Source",
      description:
        "Built with Next.js 15, React 19, and Tailwind 4. Entirely self-hostable — no vendor lock-in, no backend needed.",
      highlight: "MIT Licensed",
    },
  ];

  const trustPoints = [
    "No vendor lock-in or data silos",
    "Transparent, auditable codebase",
    "No usage tracking or analytics",
    "Direct provider billing (when self-hosted)",
  ];

  const faqs = [
    {
      question: "How is this different from ChatGPT or other AI tools?",
      answer:
        "Unlike commercial AI tools, Rapid Chat keeps everything local in your browser. No cloud storage, no data collection, and you control your own API keys when self-hosting.",
    },
    {
      question: "What happens to my chat history?",
      answer:
        "All conversations are stored locally in your browser's IndexedDB. Nothing is sent to our servers or any third-party analytics platforms.",
    },
    {
      question: "Can I use my own API keys?",
      answer:
        "Yes, when self-hosting you can bring your own keys for OpenAI, Gemini, Groq, and other supported providers. Pay them directly with no markup.",
    },
    {
      question: "How fast is the streaming?",
      answer:
        "We use token-level streaming with real-time TPS monitoring. The UI is optimized for minimal latency, often feeling faster than commercial alternatives.",
    },
    {
      question: "What models are supported?",
      answer:
        "We support multiple providers including OpenAI, Gemini, and Groq with various models optimized for different tasks. Full model list available in the docs.",
    },
    {
      question: "Is this really open source?",
      answer:
        "100% open source under MIT license. Built with Next.js 15, React 19, and Tailwind 4. Fork it, modify it, self-host it — it's yours.",
    },
    {
      question: "Can I upload files?",
      answer:
        "Yes, upload files and images — everything stays local and persistent between sessions. Audio can be recorded directly in the interface. No re-uploading or data loss.",
    },
  ];

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <div className="min-h-[calc(100dvh-20px)] flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-20">
            <h1 className="text-4xl md:text-7xl font-light mb-6 tracking-tight">
              Rapid Chat ⚡
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-8 font-light max-w-3xl mx-auto">
              The AI assistant that respects your privacy
            </p>

            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Zero cloud storage • Ultra-fast streaming • Multi-model reasoning
              • Fully open source
            </p>

            <GetStarted />

            <p className="text-sm text-gray-600 mt-6">
              No signup required • No data collection • No vendor lock-in
            </p>
          </div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light mb-4">
            Built Different
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Every feature designed for privacy, performance, and developer
            control
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feature, index) => (
            <div
              key={index}
              className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-medium text-white">
                  {feature.title}
                </h3>
                {/* <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                  {feature.highlight}
                </span> */}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Transparency Section */}
      <div className="bg-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-light mb-4">
            Why Developers Are Switching
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            No cloud, no tricks. Just fast, private AI that you control.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {trustPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-3 text-left">
                <div className="text-green-400 text-xl">✓</div>
                <span className="text-gray-300">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Powered by Groq */}
      <div className="text-center py-12">
        <Link href="https://groq.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="https://console.groq.com/powered-by-groq.svg"
            alt="Powered by Groq for fast inference."
            width={400}
            height={160}
            className="mx-auto opacity-60 hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-medium mb-4">Rapid Chat</h3>
              <p className="text-gray-400 mb-4 max-w-md">
                Open source AI assistant with privacy-first architecture and
                blazing fast performance.
              </p>
              <div className="flex gap-4">
                <Link
                  href="https://github.com/real-zephex/Rapid-Chat"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  GitHub
                </Link>
                <Link
                  href="https://student-16.gitbook.io/rapid-chat/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </div>
            </div>

            {/* <div>
              <h4 className="font-medium mb-4">Product</h4>
              <div className="space-y-2">
                <Link
                  href="/features"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Self-Host
                </Link>
                <Link
                  href="/roadmap"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Roadmap
                </Link>
              </div>
            </div> */}

            {/* <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <div className="space-y-2">
                <Link
                  href="/privacy"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <span className="block text-gray-400">MIT Licensed</span>
              </div>
            </div> */}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Rapid Chat. Open source and privacy-first.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
