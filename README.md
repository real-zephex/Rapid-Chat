# 🚀 Rapid AI Chat Interface

A lightning-fast, privacy-first AI chat interface that brings together multiple specialized language models in one unified platform. Built with Next.js 15 and featuring unlimited local storage through IndexedDB.

![License](https://img.shields.io/badge/license-Private-red)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)
![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Key Features

### 🔒 **Privacy First**

- **Zero Cloud Storage**: All conversations stay on your device
- **Unlimited Local Storage**: Uses IndexedDB for persistent chat history
- **No Data Tracking**: Your conversations never leave your browser

### ⚡ **Lightning Performance**

- **Streaming Responses**: Real-time AI responses with SSE
- **Instant Model Switching**: Switch between AI models without delay
- **Optimized UI**: Built with Next.js 15 and React 19 for maximum speed

### 🖼️ **Multi-Modal Support**

- **Image Upload**: Send images to compatible AI models (Gemini Flash)
- **Image Preview**: Real-time preview while typing
- **Persistent Images**: Images stored locally with conversations

### 🤖 **5 Specialized AI Models**

| Model            | Provider   | Specialty            | Use Case                                |
| ---------------- | ---------- | -------------------- | --------------------------------------- |
| **Scout**        | Groq/Llama | General Knowledge    | Accurate & reliable factual information |
| **LlamaInstant** | Groq       | Conversational       | Ultra-fast & engaging conversations     |
| **Flash**        | Google AI  | Quick Facts + Vision | Direct responses + image understanding  |
| **Qwen**         | Groq       | Deep Analysis        | Complex reasoning & expert insights     |
| **Devstral**     | OpenRouter | Coding               | Programming help & code solutions       |

### 🎨 **Modern User Experience**

- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark Theme**: Easy on the eyes with a modern dark interface
- **Syntax Highlighting**: Code blocks with language detection
- **Math Rendering**: LaTeX/KaTeX support for mathematical expressions
- **Markdown Support**: Rich text formatting with GFM support

## 🛠️ Tech Stack

### Frontend

- **Next.js 15.3** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Tailwind Typography** - Beautiful prose styling

### AI Integration

- **@google/genai** - Google AI Gemini models
- **groq-sdk** - Groq AI models
- **OpenAI SDK** - OpenRouter models integration

### Storage & Performance

- **IndexedDB** - Client-side database for chat persistence
- **Server-Sent Events** - Real-time streaming responses
- **Vercel Analytics** - Performance monitoring

### UI Enhancements

- **React Markdown** - Markdown rendering with extensions
- **Rehype/Remark** - Syntax highlighting and math support
- **React Icons** - Comprehensive icon library
- **KaTeX** - Mathematical notation rendering

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

1. Click "Start New Chat" on the homepage
2. Select your preferred AI model from the dropdown
3. Type your message and press Enter or click Send
4. Watch as the AI streams its response in real-time

### Image Support

1. Select the "Flash" model (Google AI with vision capabilities)
2. Click the upload button to add images (up to 5 images, max 10MB each)
3. Preview your images before sending
4. Send your message with images attached

### Chat Management

- **Multiple Tabs**: Open multiple conversations simultaneously
- **Auto-Save**: All conversations are automatically saved locally
- **Chat History**: Access all your previous conversations from the sidebar
- **Delete Chats**: Remove conversations you no longer need

### Model Switching

Switch between AI models mid-conversation to get different perspectives:

- **Scout**: For factual queries and general knowledge
- **LlamaInstant**: For quick, conversational responses
- **Flash**: For visual content and concise answers
- **Qwen**: For complex analysis and reasoning
- **Devstral**: For programming and technical questions

## 🔧 API Reference

### Internal API Endpoints

#### GET `/api`

Stream AI responses via Server-Sent Events

**Query Parameters:**

- `model` (string, required): One of `["llama_instant", "flash", "qwen", "scout", "devstral"]`
- `message` (string, required): The user's message/prompt

**Response:**

- Content-Type: `text/plain; charset=utf-8`
- Streaming text response from the selected AI model

**Example:**

```bash
curl "http://localhost:3000/api?model=flash&message=Hello+world"
```

## 🏗️ Architecture

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── chat/[id]/         # Dynamic chat routes
│   ├── api/               # API endpoints
│   └── layout.tsx         # Root layout
├── models/                # AI model integrations
│   ├── google/            # Google AI models
│   ├── groq/             # Groq models
│   ├── openrouter/       # OpenRouter models
│   └── index.ts          # Model provider
├── ui/                   # React components
│   ├── chat-interface.tsx # Main chat UI
│   ├── sidebar.tsx       # Navigation sidebar
│   └── get-started.tsx   # Landing page
└── utils/               # Utilities
    ├── indexedDB.ts     # Local storage manager
    ├── model-list.ts    # Available models
    └── responseCleaner.tsx # Response processing
```

### Data Flow

1. **User Input** → Chat Interface
2. **Model Selection** → Model Provider
3. **API Request** → Specific AI Model Integration
4. **Streaming Response** → Real-time UI Updates
5. **Local Storage** → IndexedDB Persistence

### Storage Architecture

- **IndexedDB Stores**:
  - `chats`: Individual conversation data with messages and images
  - `tabs`: Active chat sessions for sidebar navigation
- **Message Structure**:
  ```typescript
  interface Messages {
    role: "user" | "assistant";
    content: string;
    images?: { mimeType: string; data: Uint8Array }[];
    reasoning?: string;
  }
  ```

## 🔐 Privacy & Security

### Data Protection

- **No Server Storage**: Conversations never reach our servers
- **Local-Only Processing**: All chat history stays in your browser
- **Image Privacy**: Uploaded images are processed locally and stored in IndexedDB
- **API Key Security**: Your API keys are used directly from client to AI providers

### Browser Compatibility

- **IndexedDB Support**: All modern browsers (Chrome 24+, Firefox 16+, Safari 10+)
- **WebStreams**: For real-time response streaming
- **Modern JavaScript**: ES2022+ features with polyfills

## 🚀 Performance Optimizations

### Frontend Optimizations

- **Next.js Image Optimization**: Automatic image optimization (disabled for blob URLs)
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Streaming SSR**: Server-side rendering with streaming

### AI Integration Optimizations

- **Response Streaming**: Real-time token streaming from AI models
- **Connection Pooling**: Efficient API connection management
- **Error Handling**: Graceful fallbacks for network issues

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New AI Models

1. Create a new file in the appropriate provider directory (`src/models/`)
2. Implement the async generator function following the existing pattern
3. Add the model to `src/models/index.ts` mappings
4. Update `src/utils/model-list.ts` to include in UI
5. Add model information to the chat interface

### Contributing Guidelines

1. Follow TypeScript strict mode
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Add JSDoc comments for complex functions
5. Test with multiple AI models

## 📊 Analytics & Monitoring

### Built-in Analytics

- **Vercel Analytics**: Performance and user interaction tracking
- **Google Analytics**: Page views and user behavior (if configured)
- **Next.js Analytics**: Built-in performance monitoring

### Privacy-Compliant Tracking

- No personal data collection
- Anonymous usage statistics only
- GDPR/CCPA compliant by design

## 🔄 Roadmap

### Planned Features

- [ ] Voice input/output support
- [ ] Additional AI model integrations
- [ ] Custom model configuration
- [ ] Export conversations
- [ ] Theme customization
- [ ] Plugin system for extensions

### Model Expansions

- [ ] Claude 3 integration
- [ ] Local LLM support (Ollama)
- [ ] Fine-tuned model uploads
- [ ] Model comparison mode

## 📄 License

This is a private repository. All rights reserved.

## 🤝 Support

For issues, questions, or feature requests, please open an issue in the repository.

---

<div align="center">

**Built with ❤️ using Next.js 15, React 19, and TypeScript**

_Privacy-first • Lightning-fast • Multi-modal AI chat interface_

</div>
