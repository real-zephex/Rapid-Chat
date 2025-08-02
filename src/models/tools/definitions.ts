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
      description: `Get a summary from Wikipedia. Input must be a valid Wikipedia page title, not a general query or sentence. For example, use 'Python (programming language)' instead of 'History of Python programming'.
      
      This tool helps overcome your training cutoff and access live knowledge instead of relying solely on memory.`,
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "A **Wikipedia article title**, not a full query. E.g., 'Black hole', 'World War II', 'Python (programming language)'.",
          },
        },
        required: ["query"],
      },
    },
  },
];
