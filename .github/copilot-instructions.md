# Rapid Chat - AI Copilot Instructions

## Project Overview

**Rapid Chat** is a privacy-focused, multi-model AI chat application built with Next.js 15, React 19, and TypeScript. It supports streaming responses from multiple AI providers (Groq, OpenRouter, OpenAI), features local-first data persistence via IndexedDB, and includes built-in tools for web browsing, code execution, weather data, calculations, and YouTube transcription.

**Key Architecture Principle**: Client-side data persistence (IndexedDB) + Server-side streaming via Server Actions + Multi-provider abstraction layer.

---

## Critical Architecture & Data Flow

### 1. **Multi-Provider AI Handler** (`src/models/handler/generator.ts`)

- Abstracts two providers behind unified OpenAI SDK interface (Groq, OpenRouter)
- **Provider Mapping**: Maps environment-specific API keys to appropriate base URLs
- **Key Pattern**: Async generator function `ModelHandler()` yields streaming text chunks
- **Multimodal Support**: Conditional image/PDF parsing via `ImageParser()` and `DocumentParse()`
- **Tool Calling**: Unified tool schema passed to all models; routing via `functionMaps`
- **Reasoning Extraction**: Special handling for `<think>` tags in responses

**When Adding Models**:

- Update provider mappings in `generator.ts` (lines 12-17)
- Add model config to Supabase `models` table (via `read_models.ts`)
- Define capabilities in `ModelData` interface (`src/models/handler/types/index.ts`)

### 2. **State Management Pattern** (React Context)

Three independent context providers in `src/context/`:

- **ModelContext**: Selected model, available models list, refresh mechanism
- **SidebarContext**: Chat sidebar state, chat titles (derived from first/last message), tab management
- **ToastContext**: Transient notification system with 3-second auto-dismiss

**Key Pattern**: All contexts are "use client" components; initial load triggers data fetch via useEffect. No client-side caching beyond what's stored in state.

### 3. **Local Data Persistence** (`src/utils/indexedDB.ts`)

- **Primary Store**: `FastAIChats` database with two object stores:
  - `chats`: Messages keyed by chat ID (includes images as Uint8Array, reasoning, timing data)
  - `tabs`: List of open chat IDs
- **Fallback**: localStorage for browsers without IndexedDB support
- **Important**: Images stored directly with messages (not separately); includes `startTime`/`endTime` for token metrics

**When Querying Chats**: Use `retrieveChats(id: string)` not direct DB access; it handles migration logic.

### 4. **Chat Message Flow** (End-to-End)

1. User submits via `ChatInterface` (`src/ui/chat-interface.tsx`, ~689 lines)
2. Message added to local state + IndexedDB via `saveChats()`
3. Server Action `ModelProvider()` called with chat history, images, model type
4. Server-side `ModelHandler` picks provider, formats multimodal content, calls LLM with tools
5. Response streams back as `ReadableStream<string>`
6. Frontend `useSmoothStream` hook animates text reveal at ~120 chars/sec
7. Tool calls intercepted, executed locally, results appended to conversation

---

## Project-Specific Patterns & Conventions

### File Naming

- Components: PascalCase (`ChatInterface.tsx`, `MessageComponent.tsx`)
- Utilities: camelCase (`indexedDB.ts`, `generationManager.ts`)
- Types: colocated in `types.ts` or alongside implementations
- Tools: Organized in `src/utils/tools/{tool-name}/index.ts`

### Type Definitions

- **Messages**: `{ role: 'user'|'assistant', content: string, images?, reasoning?, startTime?, endTime?, cancelled? }`
- **ModelData**: Full config for a single model (provider_code, temperature, max_tokens, tool support, etc.)
- **fileUploads**: `{ mimeType: string, data: Uint8Array }`

### Component Patterns

- **Memoization**: Critical components use `memo()` with explicit prop types (e.g., `MessagesContainer`)
- **Refs**: Message refs stored in Map for scroll-to-message on generation; cleanup on unmount
- **Hotkeys**: `react-hotkeys-hook` for keyboard shortcuts (Shift+Esc for focus, Ctrl+Shift+Backspace for delete)

### Tool System (`src/utils/tools/`)

- Tools defined as OpenAI schema in `schema/index.ts` (function name, description, parameters)
- Implementations in `schema/maps.ts` (function router: name → handler function)
- Tool handlers return plain strings/objects (not streams)
- **Built-in Tools**: calculator, weather, web-reader (Jina), code-executor (Piston), youtube-summarizer

**Adding a New Tool**:

1. Define schema in `src/utils/tools/schema/index.ts` (function signature + description)
2. Create handler in `src/utils/tools/{tool-name}/index.ts`
3. Register in `src/utils/tools/schema/maps.ts` (name → function)
4. Ensure model has `tools: true` in database config

### UI Rendering

- Markdown with GFM + math (remark-gfm, remark-math, rehype-katex)
- Code syntax highlighting via rehype-highlight (dracula theme in `dracula.css`)
- Images rendered inline via custom `ImagePreview` component
- Reasoning display via `<think>` tag extraction (shown separately)

---

## Critical Developer Workflows

### Running Locally

```bash
npm run dev  # Starts Next.js dev server with turbopack (http://localhost:3000)
npm run lint  # ESLint check
npm run build  # Production build
npm start  # Serve production build
```

### Environment Setup

Create `.env.local` in project root:

```
GROQ_API_KEY=your_key
OPENROUTER_API_KEY=your_key
OPENAI_API_KEY=optional_key
```

### Model Database

- Models fetched from Supabase via `read_models_information()`
- Cached in localStorage under key `models`
- Refresh via ModelContext `refreshModels()` (rare operation)
- Fallback model: `meta-llama/llama-4-scout-17b` on Groq

### Debugging Streaming

- Server-side streaming happens in `ModelHandler` async generator
- Client receives chunks via `ReadableStream`; check browser DevTools Network tab
- `generationManager` tracks abort controllers per run ID for mid-stream cancellation
- Common issue: AbortSignal not propagated → incomplete cancellation

### Testing Multimodal

- Image support varies by model (check `ModelData.image_support`)
- Image parsing happens in `ImageParser()` before being sent to LLM

---

## External Dependencies & Integration Points

### AI Provider SDKs

- **Groq**: `groq-sdk` (OpenAI-compatible; includes Whisper for transcription)
- **OpenRouter/OpenAI**: `openai` SDK directly

### Browser APIs Used

- **IndexedDB**: Async database for chat persistence
- **MediaRecorder**: Audio recording (desktop only, triggers Groq Whisper transcription)
- **Clipboard**: Copy to clipboard via `copy-button` utility
- **AbortController**: Cancel mid-stream generations

### External APIs (Require BYOK)

- **Jina AI Reader**: Web content extraction (`get_website_content` tool)
- **Open-Meteo**: Weather data (free, no key needed)
- **Piston**: Code execution sandbox
- **YouTube Transcript Plus**: Fetch video transcripts

---

## Common Pitfalls & Gotchas

1. **IndexedDB vs localStorage**: App falls back to localStorage but expect it when database fails; check console for migration errors
2. **Tool Execution**: Tools run on client (except initial LLM call); ensure handlers don't make network calls that violate CORS
3. **Streaming Cancellation**: If abort doesn't work, check that `runId` is properly passed through `ModelProvider` → `ModelHandler`
4. **Image Parsing**: Images stored as Uint8Array in state; ensure they're converted to base64 before JSON serialization to IndexedDB
5. **Context Refresh**: Sidebar titles derived from first fetch; chat title doesn't auto-update until sidebar refresh is triggered
6. **Provider Mismatch**: Ensure selected model's provider has valid API key in `.env.local`; falls back to Scout (Groq) on null model data

---

## Key Files Reference

- **Chat Interface Core**: `src/ui/chat-interface.tsx` (main orchestration)
- **Server-Side Streaming**: `src/models/index.ts` (ModelProvider Server Action)
- **Model Selection & Config**: `src/utils/model-list.ts`, `src/models/handler/types/index.ts`
- **Data Persistence**: `src/utils/indexedDB.ts`
- **Tool Definitions**: `src/utils/tools/schema/index.ts` + `maps.ts`
- **Smooth Text Animation**: `src/hooks/useSmoothStream.ts`
- **State Management**: `src/context/{ModelContext,SidebarContext,ToastContext}.tsx`
