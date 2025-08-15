import { Type } from "@google/genai";

const tools_definitons = [
  {
    name: "get_current_time",
    description: "Get the current time in a specified timezone",
    parameters: {
      type: Type.OBJECT,
      properties: {
        timezone: {
          type: Type.STRING,
          description: "The timezone to get the current time for, e.g., 'IST'.",
        }
      }
    }
  },
];

export default tools_definitons;