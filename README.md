# Fast AI

A streamlined AI interface supporting multiple language models through a unified API.

## Supported Models

- **Google AI**
  - Gemini 2.5 Flash Lite
- **Groq**
  - Compound Beta
  - Llama Scout
  - Qwen
- **OpenRouter**
  - Deepseek
  - Devstral
  - Phi-4
  - Phi-4 Plus
  - Sarvam

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

- `GEMINI_API_KEY` - Google AI API key
- Add other required API keys based on models you plan to use

4. Start the development server:

```bash
npm run dev
```

## API Usage

Make GET requests to `/api` with the following parameters:

- `model`: One of ["compound", "flash", "qwen", "scout", "devstral", "deepseek", "phi4", "phi4plus", "sarvam"]
- `message`: Your prompt text

Example:

```
GET /api?model=flash&message=Hello+world
```

Returns a server-sent event stream with the model's response.

## Tech Stack

- Next.js 15.3
- React 19
- TypeScript
- TailwindCSS
- Various AI model SDKs (@google/genai, groq-sdk, etc.)

## License

Private repository - All rights reserved
