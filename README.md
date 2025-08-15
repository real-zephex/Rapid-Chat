# Rapid Chat — Developer-first, multi-model AI chat

Privacy-first, streaming chat UI that switches between multiple providers and models. Built with Next.js 15 and React 19. Local-first persistence via IndexedDB (with migration from localStorage).

![License](https://img.shields.io/badge/license-Apache%202.0-green)
![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)
![React](https://img.shields.io/badge/React-19.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## Key features

### Privacy-first

- **Zero Cloud Storage**: All conversations stay on your device
- **Unlimited Local Storage**: Uses IndexedDB for persistent chat history
- **No Data Tracking**: Your conversations never leave your browser

### Fast, streaming UX

- **Streaming responses**: Real-time token streaming across providers
- **Instant model switching**: Swap models without page reloads
- **Optimized UI**: Next.js 15 + React 19, Tailwind 4
- **Response processing**: Cleans content and extracts `<think>` reasoning

### Images and PDFs

- **Images**: PNG/JPEG/JPG upload, paste, and drag-drop (stored locally)
- **PDFs**: Up to 10MB; supported with Gemini Flash models; downloadable chips in UI
- **Previews**: Inline image previews with cleanup of object URLs
- **Persistence**: Media stored alongside chats in IndexedDB

### Audio (desktop)

- **Voice recording**: Built-in Web Audio capture
- **STT**: Transcription via Groq Distil-Whisper (server action)
- **Limits**: 2s minimum, 3 minutes maximum

### Models available today

These are exposed in the UI (see `src/utils/model-list.ts`) and wired via streaming generators (`src/models/**`).

| Code                | Name                     | Provider   | Images | Notes                      |
| ------------------- | ------------------------ | ---------- | ------ | -------------------------- |
| `flash`             | Gemini Flash 2.5 Lite    | Google AI  | Yes    | Fast, concise multimodal   |
| `flash_2`           | Gemini Flash 2.0         | Google AI  | Yes    | Multimodal; PDFs supported |
| `qwen`              | Qwen 32B                 | Groq       | No     | Strong reasoning           |
| `scout`             | Llama Scout              | Groq       | Yes    | Reliable general-purpose   |
| `devstral`          | Devstral Small (free)    | OpenRouter | No     | Code-focused assistant     |
| `venice_uncensored` | Dolphin Mistral (Venice) | OpenRouter | No     | Broad coverage             |
| `deepseek`          | Deepseek R1 (free)       | OpenRouter | No     | Reasoning-first            |
| `gptOss`            | GPT-OSS 20B              | Groq       | No     | Conversational             |
| `gptOssFree`        | GPT-OSS 20B (free)       | OpenRouter | No     | Conversational             |

Notes:

- Additional mappings exist in `src/models/index.ts` (e.g., Llama Instant, GPT-4o Mini) but are not exposed in the selector by default.

### Developer-minded UI

- Reasoning disclosure (toggle), token count, tokens/sec
- Markdown + code highlight + copy, KaTeX/LaTeX, GFM
- Keyboard shortcuts: Shift+Esc focuses input; Ctrl+Shift+Backspace deletes chat
- Drag-drop, paste-to-upload, file count limit 5, max size 10MB/file

## Tech stack

### Frontend

- **Next.js 15.4.6** — App Router, Server Actions
- **React 19.1** — Concurrent features
- **TypeScript 5.9** — Strict typing
- **Tailwind CSS 4** — Utility-first styling
- **@tailwindcss/typography** — Prose styling

### AI integration

- **@google/genai** — Gemini models
- **groq-sdk** — Groq models (Llama, Qwen, Whisper, OSS)
- **openai** — OpenAI SDK with OpenRouter base URL where applicable
- **OpenRouter** — Multiple providers through a unified interface

### Storage & performance

- **IndexedDB** — Chats and tabs stores; auto-migration from localStorage
- **Server Actions** — Model calls and streaming
- **Response streaming** — Token-by-token UI updates

### UI enhancements

- **react-markdown**, **remark**/**rehype** for GFM, math, highlighting
- **KaTeX**, **react-icons**, **react-hotkeys-hook**

## Getting started

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or Bun
- API keys for providers you plan to use

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/real-zephex/Rapid-Chat.git
cd Rapid-Chat
```

2. **Install dependencies**

```bash
# with npm
npm install

# or with Bun
bun install
```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_google_ai_api_key
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENAI_API_KEY=your_openai_api_key
```

4. **Start the development server**

```bash
# with npm
npm run dev

# or with Bun
bun run dev
```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production build

```bash
# with npm
npm run build
npm start

# or with Bun
bun run build
bun run start
```

## Usage

### Start a conversation

1. Click "Get Started" on the homepage or use the sidebar
2. Select your preferred AI model from the dropdown
3. Type your message and press Enter or click Send
4. Watch as the AI streams its response in real-time

### Images and PDFs

1. **Images**: Select a model with image support (Flash/Flash 2.0/Scout) and upload or paste
2. **PDFs**: Upload PDF documents (≤10MB). Currently supported with Gemini Flash models
3. **Preview**: See your uploads before sending
4. **Storage**: All media is stored locally with conversations

### Audio transcription

1. Click the microphone icon (desktop only)
2. Record your message (2 seconds - 5 minutes)
3. Audio is transcribed using Groq Distil-Whisper
4. Edit the transcription before sending

### Advanced features

- Reasoning view toggle (for models that emit <think> blocks)
- Token metrics (count and tokens/sec)
- One-click copy for code blocks
- Chat management (delete, organize, switch)

## Architecture

### Project structure

```
src/
├── app/                    # App Router (routes, layout, metadata)
│   ├── chat/[id]/         # Dynamic chat routes
│   └── layout.tsx         # Root layout with analytics
├── models/                # AI model integrations
│   ├── google/            # Google AI (Gemini Flash models)
│   ├── groq/              # Groq models (Scout, Qwen, Whisper, OSS)
│   ├── openai/            # OpenAI models (optional)
│   ├── openrouter/        # OpenRouter providers
│   └── index.ts           # Model provider with streaming
├── ui/                   # React components
│   ├── chat-interface.tsx # Main chat with audio/image support
│   ├── sidebar.tsx        # Command center with hotkeys
│   ├── chat-components/  # Specialized chat components
│   └── get-started.tsx   # Landing page
└── utils/                # Utilities
  ├── indexedDB.ts      # Storage with migration
  ├── model-list.ts     # Available models configuration
  └── responseCleaner.tsx # AI response processing
```

### Data flow

1. **User Input** → Chat Interface (text/audio/images)
2. **Model Selection** → Model provider with streaming
3. **Server Action** → Specific AI Model Integration
4. **Response processing** → Content cleaning and reasoning extraction
5. **Real-time Updates** → Streaming UI with token metrics
6. **Local persistence** → IndexedDB with image/file storage

### Storage architecture

- **IndexedDB stores**:

  - `chats`: Conversation data with embedded images/files
  - `tabs`: Active chat sessions for navigation
  - **Migration**: Automatic upgrade from localStorage

- **Message structure**:
  ```typescript
  interface Messages {
    role: "user" | "assistant";
    content: string;
    images?: { mimeType: string; data: Uint8Array }[];
    reasoning?: string;
    startTime?: number;
    endTime?: number;
  }
  ```

## Model configuration

### Model specializations

Each model is optimized with model-specific prompts:

- **Scout**: Reliability and fact-checking
- **Flash / Flash 2.0**: Multimodal (images/PDFs)
- **Qwen**: Deep reasoning
- **Devstral**: Code-first assistant
- **Deepseek / GPT-OSS**: Conversational + reasoning

### Response processing

- **Think tags**: Extract and display reasoning text
- **Content cleaning**: Remove artifacts
- **Token metrics**: Count and throughput
- **Streaming**: Real-time updates

## Privacy & security

### Data protection

- **No server storage**: Chats are stored locally (IndexedDB)
- **Local-only chat history**: Your history stays in the browser
- **Media privacy**: Images/files stored locally with chats
- **BYOK**: Your API keys call providers directly from server actions

### Browser compatibility

- **IndexedDB**: Modern browsers
- **Web Streams**: Real-time streaming
- **Media API**: Audio recording
- **File API**: Drag-and-drop and paste

## Performance notes

### Response streaming

- Token-by-token rendering with throttle
- Object URL cleanup for previews
- Graceful error handling

### Storage efficiency

- LocalStorage → IndexedDB migration
- Blob management and cleanup
- Fast retrieval via simple stores

## Development

### Scripts

- `npm run dev` / `bun run dev` — Dev with Turbopack
- `npm run build` / `bun run build` — Production build
- `npm run start` / `bun run start` — Production server
- `npm run lint` — Lint

### Add a new model

1. Create a generator in `src/models/<provider>/<model>.ts`
2. Implement as `async function* ({ inc }: { inc: incomingData })`
3. Register it in `src/models/index.ts` mappings
4. Expose in `src/utils/model-list.ts` (name, code, image flag, description)
5. Optionally tune prompts and UI hints

### Guidelines

- Prefer strict typing and small server actions
- Keep model prompts co-located with generators
- Reuse streaming patterns and response cleaner
- Test across providers and edge cases

## License

Apache License 2.0 — see `LICENSE`.

## Support

For issues, questions, or feature requests, please open an issue in the repository.
