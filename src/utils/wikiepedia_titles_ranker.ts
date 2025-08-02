import { Search, Welcome } from "@/app/types/wikipedia.types";

import { GoogleGenAI } from "@google/genai";

async function GetTitle(data: Search[], query: string) {
  if (!data) {
    return "No title found";
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {};
  const model = "gemma-3-1b-it";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Choose the best title for the query ${query} from the following JSON input:
           \n\n
           ${JSON.stringify(data)}
           \n\n
           Return only the title without any additional text. If not found, return "No title found".`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });
  return response.text || "No title found";
}

const WikipediaTitlesRanker = async ({
  title,
  query,
}: {
  title: string;
  query: Welcome;
}) => {
  const response = await GetTitle(query.query.search, title);
  return response;
};

export default WikipediaTitlesRanker;
