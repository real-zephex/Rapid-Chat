export interface ModelData {
  model_code: string;
  provider_code: string;
  temperature: number;
  system_prompt: string;
  max_completion_tokens: number;
  top_p: number;
  stream: boolean;
  stop: string | null;
  provider: "groq" | "openrouter" | "google";
  image_support: boolean;
  pdf_support: boolean;
}
