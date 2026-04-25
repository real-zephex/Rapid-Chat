# Rapid Chat

A fast, privacy-focused AI chat interface built with Next.js 15 and React 19. Rapid Chat features an **editorial minimalist aesthetic** with a focus on speed, local data persistence, and powerful built-in tools.

> [!IMPORTANT]
> **Self-Hosting Required**: This project is designed to be **self-hosted**. Any live demo or hosted version is for **testing purposes only**. We highly recommend deploying your own instance to ensure full control over your privacy and API keys.

## Key Features

- **Privacy First**: All conversations and media are stored locally in IndexedDB. Bring your own API keys—we don't store your chats on any server.
- **Editorial Minimalist Aesthetic**: A brutally minimal, high-contrast design featuring Playfair Display typography and a tactile paper-grain interface.
- **AI Council**: Compare multiple model responses side-by-side for the same prompt and let a "judge" model evaluate the best answer.
- **Split View**: Multi-task or compare different models and conversations in a side-by-side layout.
- **Smart Scroll**: Intelligent sticky-scrolling that respects your position during message generation.
- **Multi-Model Support**: Native support for Groq (Llama, Mixtral, Qwen) and OpenRouter providers. Includes reasoning display for models like DeepSeek.
- **Rich Interaction**: Support for image uploads, voice recording (Whisper), full LaTeX/Math support, and real-time generation metrics (T/S).
- **VS Code Syntax**: Beautiful, developer-centric code highlighting that mirrors your local IDE environment.

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
# AI Providers
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key

# Convex (Backend & Configuration)
CONVEX_DEPLOYMENT=your_deployment_name
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
JWT_SECRET=your_long_random_secret_string
```

## Backend with Convex

Rapid Chat uses **Convex** as its robust backend engine. While your chat data stays local (IndexedDB), Convex handles the critical system infrastructure:
- **Global Configuration**: Manages the list of available AI models, provider settings, and system prompts.
- **Admin Authentication**: Securely manages admin access using JWT tokens and server-side validation.
- **Dynamic Updates**: Allows for real-time updates to model configurations without requiring a frontend redeploy.

To set up the backend:
1. Run `npx convex dev` to initialize your Convex project.
2. The command will automatically populate `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in your environment.
3. Generate a secure `JWT_SECRET` for the admin authentication layer.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Backend**: **Convex** (Serverless Database & Functions)
- **AI**: groq-sdk, OpenRouter
- **Database/State**: IndexedDB (Local chat history), Convex (Remote system config)
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
