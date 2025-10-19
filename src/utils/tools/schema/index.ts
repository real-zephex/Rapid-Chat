import { ChatCompletionTool } from "openai/resources/index.mjs";

export const toolsSchema: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_website_content",
      description:
        "Fetch and return the main content of a webpage given its URL. Returns cleaned markdown content without navigation elements, ads, or clutter.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL of the webpage to fetch content from.",
          },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate",
      description:
        "Perform mathematical calculations. Supports basic arithmetic (+, -, *, /), exponents (^), percentages (%), square roots (√), and constants (π, e).",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description:
              "The mathematical expression to evaluate (e.g., '2 + 2', '√16', '5^2', '3.14 * 10').",
          },
        },
        required: ["expression"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description:
        "Get current weather information for a specified location. Returns temperature, weather condition, humidity, and wind speed.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description:
              "The city name or location to get weather for (e.g., 'London', 'New York', 'Tokyo').",
          },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "execute_code",
      description:
        "Execute code in a sandboxed environment. Supports JavaScript, Python, and TypeScript. Returns the output or any errors.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The code to execute.",
          },
          language: {
            type: "string",
            enum: ["javascript", "python", "typescript"],
            description: "The programming language of the code.",
          },
        },
        required: ["code", "language"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "youtube_transcription",
      description: "Fetch and return the transcript of a YouTube video.",
      parameters: {
        type: "object",
        properties: {
          videoUrl: {
            type: "string",
            description: "The URL of the YouTube video to transcribe.",
          },
        },
        required: ["videoUrl"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_time",
      description:
        "Get the current date and time. Optionally specify a timezone (e.g., 'America/New_York', 'Europe/London'). Defaults to UTC if not specified.",
      parameters: {
        type: "object",
        properties: {
          timezone: {
            type: "string",
            description:
              "IANA timezone identifier (optional). Examples: 'UTC', 'America/New_York', 'Europe/London'.",
          },
        },
        required: [],
      },
    },
  },
];
