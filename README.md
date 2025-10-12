# Rapid Chat

Privacy-focused AI chat application with multi-model support, real-time streaming responses, and function calling. Built with Next.js 15, React 19, and TypeScript. Conversations are stored locally in IndexedDB, with privacy considerations for external dependencies.

## Features

- **Privacy Focused**: Local storage using IndexedDB for chats and media. Bring your own API keys for direct calls to AI providers. No tracking on conversation content, but analytics for app usage and external API dependencies may involve data transmission.
- **Performance**: Real-time streaming token-by-token responses. Instant model switching mid-conversation. Optimized UI with Next.js 15, React 19, and Tailwind CSS 4.
- **AI Capabilities**: Support for multiple models from Google AI (Gemini), Groq (Llama, Qwen), OpenRouter, and OpenAI. Function calling with built-in tools. Reasoning display with <think> tag extraction. Real-time token metrics (count and tokens/second).
- **Rich Media**: Image support (PNG/JPEG/JPG) via upload, paste, or drag-drop, stored locally. PDF support up to 10MB with Gemini Flash models. Audio recording and transcription via Groq Whisper (desktop only). Inline previews with automatic cleanup.
- **Built-in Tools**:
  - Web Content Reader: Fetch and parse webpage content via Jina AI.
  - Calculator: Mathematical expressions with support for π, e, √, exponents, etc.
  - Weather: Real-time weather data via Open-Meteo API.
  - Code Executor: Run JavaScript, Python, and TypeScript in sandbox via Piston API.
  - YouTube Transcription: Fetch video transcripts.
- **Developer Experience**: Keyboard shortcuts (Shift+Esc to focus input, Ctrl+Shift+Backspace to delete chat). Markdown rendering with GFM support and syntax highlighting. Math support with KaTeX/LaTeX. Code copy functionality. Drag & drop for up to 5 files (10MB each).

## Tech Stack

- **Framework**: Next.js 15.4.6 (App Router, Server Actions), React 19.2, TypeScript 5.9.
- **AI SDKs**: @google/genai (Gemini), groq-sdk (Llama, Qwen, Whisper), openai (OpenAI & OpenRouter).
- **Storage & State**: IndexedDB for local persistence with auto-migration from localStorage.
- **UI & Styling**: Tailwind CSS 4, react-markdown with remark/rehype, KaTeX for math, react-icons, react-hotkeys-hook.
- **Other Dependencies**: @supabase/supabase-js for model information, cheerio for web parsing, youtube-transcript-plus for YouTube, @vercel/analytics and nextjs-google-analytics for analytics, nextjs-toploader for loading indicators.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or Bun
- API keys for AI providers (Google AI, Groq, OpenRouter, OpenAI optional)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/real-zephex/Rapid-Chat.git
   cd Rapid-Chat
   ```

2. Install dependencies:
   ```
   npm install
   # or
   bun install
   ```

3. Set up environment variables: Create `.env.local` in the project root with:
   ```
   GEMINI_API_KEY=your_google_ai_key
   GROQ_API_KEY=your_groq_key
   OPENROUTER_API_KEY=your_openrouter_key
   OPENAI_API_KEY=your_openai_key  # optional
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   bun run dev
   ```

Open http://localhost:3000 in your browser.

### Production Deployment

```
npm run build && npm start
# or
bun run build && bun run start
```

## Usage

### Basic Chat

1. Open the sidebar to start a new chat or select an existing one.
2. Select a model from the dropdown.
3. Type a message and press Enter.
4. View real-time streaming responses.

### Using Tools (Function Calling)

The AI automatically uses built-in tools based on queries:
- "What's the weather in Tokyo?" → Uses weather tool.
- "Calculate 2^10 + 5" → Uses calculator.
- "Fetch content from example.com" → Uses web reader.
- "Run this Python code: print('hello')" → Uses code executor.
- "Transcribe this YouTube video: [URL]" → Uses YouTube transcription.

### Media Support

- Images: Drag-drop, paste, or upload PNG/JPEG/JPG files.
- PDFs: Upload documents up to 10MB (Gemini models only).
- Audio: Click the microphone icon to record and transcribe voice messages (desktop only, requires MediaRecorder API).

### Advanced Features

- Reasoning Toggle: View AI's thinking process.
- Token Metrics: Display token count and speed.
- Code Copy: One-click copy for code blocks.
- Keyboard Shortcuts: As listed in features.

## Architecture

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
│       ├── youtube-summarizer/
│       └── schema/          # Tool definitions
└── context/                 # React context providers
```

### Data Flow

User Input → Chat Interface → Model Selection + Tool Schema → Server Action (streaming) → AI Response + Tool Calls → Tool Execution (if needed) → Response Processing (clean + extract reasoning) → IndexedDB Persistence + UI Update.

### Function Calling

Tools are defined in `src/utils/tools/schema/index.ts` with OpenAI-compatible schemas. Each tool returns `{ status: boolean, content?: string }`. Implementations are in respective folders, mapped in `src/utils/tools/schema/maps.ts`.

## Development

### Adding a New Tool

1. Create a folder in `src/utils/tools/<tool-name>/`.
2. Implement `index.ts` with the interface:
   ```typescript
   interface ToolReturnProps {
     status: boolean;
     content?: string;
   }
   ```
3. Add schema to `src/utils/tools/schema/index.ts`.
4. Register in `src/utils/tools/schema/maps.ts`.
5. Test with function-calling models.

### Scripts

- `npm run dev`: Development server with Turbopack.
- `npm run build`: Production build.
- `npm run start`: Production server.
- `npm run lint`: ESLint.

## Privacy & Security

- Conversations and user data stored locally in IndexedDB; no server-side storage for chats.
- No tracking on conversation content; analytics libraries (@vercel/analytics, nextjs-google-analytics) track general app usage (e.g., page views, interactions) but not chat data.
- Media files processed and stored locally; never uploaded without user intent.
- Direct API calls to AI providers using user-provided keys; however, prompts and media may be sent to providers' servers per their policies.
- External dependencies: Model information fetched from Supabase; tools (e.g., weather via Open-Meteo, web reader via Jina AI, code executor via Piston) transmit queries to third-party APIs.
- Open source for auditing; not fully zero-knowledge due to internet-required features.

### Browser Requirements

- Modern browser with IndexedDB support.
- Web Streams API for real-time rendering.
- File API for drag-and-drop.
- MediaRecorder API for audio (optional).

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make changes with tests.
4. Submit a pull request.

Guidelines: Use TypeScript strict mode, follow existing patterns, test streaming and tool functionality, update documentation.

## License

Apache License 2.0. See LICENSE file.
