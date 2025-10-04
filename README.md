# Rapid Chat

> **Privacy-first AI chat with multi-model support, streaming responses, and function calling.**

Built with Next.js 15, React 19, and TypeScript. All conversations stay local using IndexedDB.

![License](https://img.shields.io/badge/license-Apache%202.0-green)
![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## ✨ Features

### 🔒 Privacy First

- **100% Local Storage** — All chats stored in IndexedDB, never sent to any cloud
- **No Tracking** — Your conversations stay private in your browser
- **BYOK** — Bring your own API keys; direct calls to AI providers

### ⚡ Performance

- **Real-time Streaming** — Token-by-token response rendering
- **Instant Model Switching** — Change models mid-conversation
- **Optimized UI** — Built on Next.js 15, React 19, and Tailwind 4

### 🧠 AI Capabilities

- **Multi-Model Support** — Google AI, Groq, OpenRouter, OpenAI
- **Function Calling** — Built-in tools for enhanced AI capabilities
- **Reasoning Display** — Shows AI thinking process with `<think>` tag extraction
- **Token Metrics** — Real-time token count and tokens/second

### 🎨 Rich Media

- **Image Support** — Upload, paste, or drag-drop PNG/JPEG/JPG (stored locally)
- **PDF Support** — Up to 10MB per file with Gemini Flash models
- **Audio Recording** — Voice-to-text transcription via Groq Whisper (desktop only)
- **Preview System** — Inline previews with automatic cleanup

### 🛠️ Built-in Tools

- **Web Content Reader** — Fetch and parse webpage content via Jina AI
- **Calculator** — Mathematical expressions with support for π, e, √, and more
- **Weather** — Real-time weather data via Open-Meteo API
- **Code Executor** — Run JavaScript, Python, and TypeScript in sandbox (Piston API)

## 🎯 Developer Experience

- **Keyboard Shortcuts** — `Shift+Esc` to focus input, `Ctrl+Shift+Backspace` to delete chat
- **Markdown Rendering** — Full GFM support with syntax highlighting
- **Math Support** — KaTeX/LaTeX rendering
- **Code Copy** — One-click copy for code blocks
- **Drag & Drop** — Upload up to 5 files (10MB each) via drag-drop or paste

## 🏗️ Tech Stack

**Framework**

- Next.js 15.4.6 (App Router, Server Actions)
- React 19.2 (Concurrent features)
- TypeScript 5.9

**AI SDKs**

- @google/genai (Gemini)
- groq-sdk (Llama, Qwen, Whisper)
- openai (OpenAI & OpenRouter)

**Storage & State**

- IndexedDB (local persistence)
- Auto-migration from localStorage

**UI & Styling**

- Tailwind CSS 4
- react-markdown + remark/rehype
- KaTeX (math rendering)
- react-icons + react-hotkeys-hook

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or Bun
- API keys from AI providers

### Installation

```bash
# Clone repository
git clone https://github.com/real-zephex/Rapid-Chat.git
cd Rapid-Chat

# Install dependencies
npm install
# or: bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
# or: bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_google_ai_key
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key
OPENAI_API_KEY=your_openai_key  # optional
```

### Production Deployment

```bash
npm run build && npm start
# or: bun run build && bun run start
```

## 📖 Usage

### Basic Chat

1. Click "Get Started" or open sidebar
2. Select a model from dropdown
3. Type your message and press Enter
4. Watch real-time streaming responses

### Using Tools (Function Calling)

The AI can automatically use built-in tools:

- **"What's the weather in Tokyo?"** → Uses weather tool
- **"Calculate 2^10 + 5"** → Uses calculator
- **"Fetch content from example.com"** → Uses web reader
- **"Run this Python code: print('hello')"** → Uses code executor

### Media Support

- **Images**: Drag-drop, paste, or click to upload
- **PDFs**: Upload documents up to 10MB
- **Audio**: Click microphone icon to record voice messages (desktop only)

### Advanced Features

- **Reasoning Toggle**: View AI's thinking process
- **Token Metrics**: See token count and speed
- **Code Copy**: One-click copy for code blocks
- **Keyboard Shortcuts**: See shortcuts in sidebar

## 🏛️ Architecture

### Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── chat/[id]/           # Dynamic chat routes
│   └── layout.tsx           # Root layout
├── models/                  # AI integrations
│   ├── handler/
│   │   └── generator.ts     # Function calling handler
│   ├── google/              # Gemini models
│   ├── groq/                # Groq models + Whisper
│   ├── openrouter/          # OpenRouter providers
│   └── index.ts             # Model router
├── ui/                      # React components
│   ├── chat-interface.tsx   # Main chat UI
│   ├── sidebar.tsx          # Navigation
│   └── chat-components/     # Specialized components
├── utils/                   # Utilities
│   ├── indexedDB.ts         # Local storage
│   ├── model-list.ts        # Model configuration
│   ├── responseCleaner.tsx  # Response processing
│   └── tools/               # Function calling tools
│       ├── calculator/
│       ├── weather/
│       ├── code-executor/
│       ├── jina-ai-reader/
│       └── schema/          # Tool definitions
└── context/                 # React context providers
```

### Data Flow

```
User Input → Chat Interface
    ↓
Model Selection + Tool Schema
    ↓
Server Action (streaming)
    ↓
AI Response + Tool Calls
    ↓
Tool Execution (if needed)
    ↓
Response Processing (clean + extract reasoning)
    ↓
IndexedDB Persistence + UI Update
```

### Function Calling

Tools are defined in `src/utils/tools/schema/`:

- **`index.ts`** — OpenAI-compatible tool definitions
- **`maps.ts`** — Maps function names to implementations

Each tool returns: `{ status: boolean, content?: string }`

## 🔧 Development

### Adding a New Tool

1. Create folder: `src/utils/tools/<tool-name>/`
2. Implement `index.ts` with interface:
   ```typescript
   interface ToolReturnProps {
     status: boolean;
     content?: string;
   }
   ```
3. Add schema to `src/utils/tools/schema/index.ts`
4. Register in `src/utils/tools/schema/maps.ts`
5. Test with function-calling models

### Scripts

```bash
npm run dev      # Development with Turbopack
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## 🔒 Privacy & Security

- ✅ **Zero Server Storage** — All data in browser IndexedDB
- ✅ **No Tracking** — No analytics on conversations
- ✅ **Local Media** — Images/PDFs never leave your device
- ✅ **BYOK** — Direct API calls with your keys
- ✅ **Open Source** — Audit the code yourself

### Browser Requirements

- Modern browser with IndexedDB support
- Web Streams API for real-time rendering
- File API for drag-and-drop
- MediaRecorder API for audio (optional)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

### Guidelines

- Use TypeScript strict mode
- Follow existing code patterns
- Test streaming and tool functionality
- Update documentation

## 📝 License

Apache License 2.0 — see [LICENSE](LICENSE)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/real-zephex/Rapid-Chat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/real-zephex/Rapid-Chat/discussions)

---

**Built with ❤️ by [real-zephex](https://github.com/real-zephex)**
