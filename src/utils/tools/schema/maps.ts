import JinaAIReader from "../jina-ai-reader";
import Calculator from "../calculator";
import Weather from "../weather";
import CodeExecutor from "../code-executor";
import YoutubeTranscription from "../youtube-summarizer";
import Time from "../time";

export const functionMaps = {
  get_website_content: async (args: { url: string }) => {
    const result = await JinaAIReader({ url: args.url });
    return JSON.stringify(result);
  },
  calculate: async (args: { expression: string }) => {
    const result = await Calculator({ expression: args.expression });
    return JSON.stringify(result);
  },
  get_weather: async (args: { location: string }) => {
    const result = await Weather({ location: args.location });
    return JSON.stringify(result);
  },
  execute_code: async (args: { code: string; language: string }) => {
    const result = await CodeExecutor({
      code: args.code,
      language: args.language,
    });
    return JSON.stringify(result);
  },
  youtube_transcription: async (args: { videoUrl: string }) => {
    const result = await YoutubeTranscription({ videoUrl: args.videoUrl });
    return JSON.stringify(result);
  },
  get_time: async (args: { timezone?: string }) => {
    const result = await Time({ timezone: args.timezone });
    return JSON.stringify(result);
  },
};
