# 🚀 Rapid AI Chat Interface

A lightning-fast, privacy-first AI chat interface that brings together multiple specialized language models in one unified platform. Built with Next.js 15 and featuring unlimited local storage through IndexedDB.

![License](https://img.shields.io/badge/license-Pubic-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)
![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Key Features

### 🔒 **Privacy First**

- **Zero Cloud Storage**: All conversations stay on your device
- **Unlimited Local Storage**: Uses IndexedDB for persistent chat history
- **No Data Tracking**: Your conversations never leave your browser

### ⚡ **Lightning Performance**

- **Streaming Responses**: Real-time AI responses with token streaming
- **Instant Model Switching**: Switch between AI models without delay
- **Optimized UI**: Built with Next.js 15 and React 19 for maximum speed
- **Response Processing**: Advanced content cleaning with `<think>` tag handling

### 🖼️ **Multi-Modal Support**

- **Image Upload**: Send images to compatible AI models (Gemini Flash)
- **PDF Support**: Upload and analyze PDF documents (Flash model)
- **Image Preview**: Real-time preview with drag-and-drop support
- **Persistent Images**: Images stored locally with conversations

### 🎤 **Audio Features**

- **Voice Recording**: Record audio messages (desktop only)
- **Speech-to-Text**: Automatic transcription via Whisper
- **Audio Validation**: 2-second minimum, 5-minute maximum duration

### 🤖 **6 Specialized AI Models**

| Model           | Provider   | Specialty            | Features                                    |
| --------------- | ---------- | -------------------- | ------------------------------------------- |
| **Scout**       | Groq/Llama | Accurate & Reliable  | Fact-checked responses, general knowledge   |
| **Flash**       | Google AI  | Vision + Quick Facts | Image/PDF analysis, direct responses        |
| **Qwen**        | Groq       | Deep Reasoning       | Complex analysis, structured thinking       |
| **Devstral**    | OpenRouter | Code Development     | Programming help, debugging, best practices |
| **GPT-4o Mini** | OpenAI     | Versatile Assistant  | General-purpose, balanced responses         |
| **Compound**    | Groq       | Web-Connected AI     | Internet access, real-time information      |

### 🎨 **Advanced UI Features**

- **Reasoning Disclosure**: Expandable thinking process for supported models
- **Token Metrics**: Real-time token count and processing speed
- **Syntax Highlighting**: Code blocks with language detection and copy buttons
- **Math Rendering**: LaTeX/KaTeX support for mathematical expressions
- **Markdown Support**: Rich text formatting with GFM support
- **Responsive Design**: Optimized for desktop and mobile
- **Keyboard Shortcuts**: `Ctrl+K` for command center, `Shift+Esc` for input focus

## 🛠️ Tech Stack

### Frontend

- **Next.js 15.3** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Tailwind Typography** - Beautiful prose styling

### AI Integration

- **@google/genai** - Google AI Gemini models
- **groq-sdk** - Groq AI models (Llama, Qwen, Compound)
- **OpenAI SDK** - GPT models via OpenAI API
- **OpenRouter** - Multiple model providers

### Storage & Performance

- **IndexedDB** - Client-side database for chat persistence
- **Server Actions** - Next.js server actions for AI streaming
- **Response Streaming** - Real-time token streaming
- **Migration System** - Automatic localStorage to IndexedDB migration

### UI Enhancements

- **React Markdown** - Markdown rendering with extensions
- **Rehype/Remark** - Syntax highlighting and math support
- **React Icons** - Comprehensive icon library
- **KaTeX** - Mathematical notation rendering
- **React Hotkeys Hook** - Keyboard shortcut management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for the AI providers you want to use

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd fast_ai
```

2. **Install dependencies**

```bash
npm install
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
npm run dev
```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📖 Usage

### Starting a Conversation

1. Click "Get Started" on the homepage or use the sidebar
2. Select your preferred AI model from the dropdown
3. Type your message and press Enter or click Send
4. Watch as the AI streams its response in real-time

### Multi-Modal Support

1. **Images**: Select the "Flash" model and click the upload button
2. **PDFs**: Upload PDF documents (up to 10MB) for analysis
3. **Preview**: See your uploads before sending
4. **Storage**: All media is stored locally with conversations

### Audio Recording

1. Click the microphone icon (desktop only)
2. Record your message (2 seconds - 5 minutes)
3. Audio is automatically transcribed using Whisper
4. Edit the transcription before sending

### Advanced Features

- **Reasoning View**: Click the reasoning dropdown to see AI thinking process
- **Token Metrics**: View processing speed and token counts
- **Code Copying**: One-click copy for code blocks
- **Chat Management**: Delete, organize, and navigate between conversations

## 🔧 Architecture

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── chat/[id]/         # Dynamic chat routes
│   └── layout.tsx         # Root layout with analytics
├── models/                # AI model integrations
│   ├── google/            # Google AI (Gemini Flash)
│   ├── groq/             # Groq models (Scout, Qwen, Compound, Whisper)
│   ├── openai/           # OpenAI GPT models
│   ├── openrouter/       # OpenRouter providers
│   └── index.ts          # Model provider with streaming
├── ui/                   # React components
│   ├── chat-interface.tsx # Main chat with audio/image support
│   ├── sidebar.tsx       # Command center with hotkeys
│   ├── chat-components/  # Specialized chat components
│   └── get-started.tsx   # Landing page
└── utils/               # Utilities
    ├── indexedDB.ts     # Storage with migration
    ├── model-list.ts    # Available models configuration
    └── responseCleaner.tsx # AI response processing
```

### Data Flow

1. **User Input** → Chat Interface (text/audio/images)
2. **Model Selection** → Model Provider with streaming
3. **Server Action** → Specific AI Model Integration
4. **Response Processing** → Content cleaning and reasoning extraction
5. **Real-time Updates** → Streaming UI with token metrics
6. **Local Persistence** → IndexedDB with image storage

### Storage Architecture

- **IndexedDB Stores**:

  - `chats`: Conversation data with embedded images/files
  - `tabs`: Active chat sessions for navigation
  - **Migration**: Automatic upgrade from localStorage

- **Message Structure**:
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

## 🎛️ Model Configuration

### Model Specializations

Each model is optimized with custom system prompts:

- **Scout**: Fact-checking and verification focus
- **Flash**: Conversational with vision capabilities
- **Qwen**: Deep reasoning and structured analysis
- **Devstral**: Code-first approach with best practices
- **GPT-4o Mini**: Balanced general-purpose assistant
- **Compound**: Web-connected for real-time information

### Response Processing

- **Think Tags**: Extract and display reasoning process
- **Content Cleaning**: Remove processing artifacts
- **Token Metrics**: Calculate speed and efficiency
- **Streaming**: Real-time response updates

## 🔐 Privacy & Security

### Data Protection

- **No Server Storage**: Conversations never reach our servers
- **Local-Only Processing**: All chat history stays in your browser
- **Image Privacy**: Media processed locally and stored in IndexedDB
- **API Direct**: Your keys connect directly to AI providers

### Browser Compatibility

- **IndexedDB Support**: All modern browsers
- **WebStreams**: Real-time response streaming
- **Media API**: Audio recording support
- **File API**: Drag-and-drop file handling

## 🚀 Performance Optimizations

### Response Streaming

- **Token-by-Token**: Real-time response display
- **Throttled Updates**: Optimized UI refresh rate
- **Memory Management**: Efficient blob URL cleanup
- **Error Recovery**: Graceful fallback handling

### Storage Efficiency

- **Automatic Migration**: Seamless localStorage upgrade
- **Blob Management**: Efficient image storage
- **Indexing**: Fast chat retrieval
- **Cleanup**: Automatic resource management

## 🧪 Development

### Available Scripts

- `npm run dev` - Development with Turbopack
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Code quality checks

### Adding New Models

1. Create model file in appropriate provider directory
2. Implement async generator with proper typing
3. Add to model mappings in `src/models/index.ts`
4. Update model list in `src/utils/model-list.ts`
5. Add model information to chat interface

### Development Guidelines

- TypeScript strict mode required
- Tailwind CSS for all styling
- Proper error boundaries
- JSDoc for complex functions
- Test across multiple models

## 📊 Analytics & Monitoring

### Built-in Tracking

- **Vercel Analytics**: Performance monitoring
- **Google Analytics**: User behavior (privacy-compliant)
- **Next.js Telemetry**: Build-time optimization

### Performance Metrics

- Token processing speed
- Response time tracking
- Error rate monitoring
- User interaction patterns


## 🤝 Support

For issues, questions, or feature requests, please open an issue in the repository.

---

<div align="center">

**Built using Next.js 15, React 19, and TypeScript**

_Privacy-first • Lightning-fast • Multi-modal AI chat interface_

</div>
