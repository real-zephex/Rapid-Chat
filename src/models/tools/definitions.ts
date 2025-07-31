import Groq from "groq-sdk";

export const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "weather",
      description:
        "Returns current weather conditions (temperature, humidity, wind, etc.) for a given city. It can also be used to get the co-ordinates of a location.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description:
              "Name of the city (optionally include country for disambiguation, e.g., 'Paris, France').",
          },
        },
        required: ["location"],
      },
    },
  },
  // {
  //   type: "function",
  //   function: {
  //     name: "calculate",
  //     description: "Evaluate a mathematical expression",
  //     parameters: {
  //       type: "object",
  //       properties: {
  //         expression: {
  //           type: "string",
  //           description: "The mathematical expression to evaluate",
  //         },
  //       },
  //       required: ["expression"],
  //     },
  //   },
  // },
  {
    type: "function",
    function: {
      name: "wikipediaSummary",
      description: `Use this tool to retrieve a short, accurate, and up-to-date explanation of a topic using real-time data from Wikipedia. 
      You should use this tool when the user asks for factual information, definitions, summaries, historical figures, scientific concepts, or explanations of any kind — especially when the topic might be too recent, nuanced, or specific for your internal knowledge to be fully accurate.
      
      This tool helps overcome your training cutoff and access live knowledge instead of relying solely on memory.`,
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "The topic to search on Wikipedia (e.g., 'Neural networks', 'Black Holes', 'Ada Lovelace').",
          },
        },
        required: ["query"],
      },
    },
  },
];
