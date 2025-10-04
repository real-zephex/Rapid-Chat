import { ChatCompletionTool } from "openai/resources/index.mjs";

export const toolsSchema: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_website_content",
      description:
        "Fetch and return the main content of a webpage given its URL.",
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
];
