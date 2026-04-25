# Rapid Chat

A fast, privacy-focused AI chat interface built with Next.js 15 and React 19. Rapid Chat lets you use models from Groq and OpenRouter with a focus on speed, local data persistence, and powerful built-in tools.

## Key Features

- **Privacy First**: All conversations and media are stored locally in IndexedDB. Bring your own API keys—we don't store your chats on any server.
- **AI Council**: Compare multiple model responses side-by-side for the same prompt and let a "judge" model evaluate the best answer.
- **Split View**: Multi-task or compare different models and conversations in a side-by-side layout.
- **Speed**: Built for performance with real-time streaming, instant model switching, and optimized token-by-token rendering.
- **Multi-Model Support**: Native support for Groq (Llama, Qwen) and OpenRouter providers. Includes reasoning display for models that support it.
- **Rich Interaction**: Support for image uploads, voice recording (Whisper), full LaTeX/Math support, and real-time generation metrics (T/S).

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/real-zephex/Rapid-Chat.git
cd Rapid-Chat
npm install # or bun install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

### 3. Run Development Server
```bash
npm run dev # or bun run dev
```
Visit `http://localhost:3000` to start chatting.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **AI**: groq-sdk, OpenRouter
- **Database/State**: IndexedDB (local), Convex (remote config & usage trends)
- **Tooling Framework**: Infrastructure included for Jina AI (Web Reader), Piston (Code Execution), and Open-Meteo (Weather).

## AI Council & Split View

- **AI Council**: Access via the sidebar to start a session where multiple AI models compete to answer your query.
- **Split View**: Click the "Split" icon next to any conversation in the sidebar to open it side-by-side with your current chat.

## Privacy & Security

- **Local Storage**: Your chat history never leaves your browser. We use IndexedDB for persistence.
- **Direct API Calls**: Responses are streamed directly from the AI providers using your keys.
- **Analytics**: We use basic analytics (Vercel/Google) to track app usage, but we **never** track or store the content of your conversations.

## Development

### Project Structure
- `src/app/`: Next.js routes and layouts.
- `src/models/`: AI provider integrations, Council logic, and handlers.
- `src/ui/`: UI components, split-view interface, and chat components.
- `src/utils/tools/`: Implementation of the tooling framework.

### Scripts
- `npm run dev`: Start dev server.
- `npm run build`: Production build.
- `bun run model:upsert`: Interactively manage model configurations in Convex.

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.
