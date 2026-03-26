import { ConvexHttpClient } from "convex/browser";

const getConvexClient = () => {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;

  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL (or CONVEX_URL) is not set.");
  }

  return new ConvexHttpClient(convexUrl, { logger: false });
};

export interface ConvexRuntimeModel {
  model_code: string;
  provider_code: string;
  max_completion_tokens: number;
  temperature: number;
  top_p: number;
  stream: boolean;
  stop: string | null;
  provider: "groq" | "openrouter";
  image_support: boolean;
  pdf_support: boolean;
  reasoning: boolean;
  system_prompt: string;
  active: boolean;
}

export interface ConvexModelInformation {
  model_code: string;
  display_name: string;
  description: string;
  image_support: boolean;
  pdf_support: boolean;
  type: "reasoning" | "conversational" | "general";
  active: boolean;
  usage_count: number;
}

export interface ConvexModelUsageTrend {
  model_code: string;
  display_name: string;
  provider: "groq" | "openrouter";
  usage_count: number;
  image_support: boolean;
  pdf_support: boolean;
}

export async function listActiveRuntimeModelsFromConvex(): Promise<
  ConvexRuntimeModel[]
> {
  const client = getConvexClient();
  return await client.query("models:listActiveRuntimeModels" as any, {});
}

export async function getActiveRuntimeModelByCodeFromConvex(
  modelCode: string,
): Promise<ConvexRuntimeModel | null> {
  const client = getConvexClient();
  return await client.query("models:getActiveRuntimeModelByCode" as any, {
    model_code: modelCode,
  });
}

export async function listActiveModelInformationFromConvex(): Promise<
  ConvexModelInformation[]
> {
  const client = getConvexClient();
  return await client.query("models:listActiveModelInformation" as any, {});
}

export async function incrementModelUsageInConvex(
  modelCode: string,
): Promise<{ success: boolean; usage_count: number }> {
  const client = getConvexClient();
  return await client.mutation("models:incrementModelUsage" as any, {
    model_code: modelCode,
  });
}

export async function listModelUsageTrendsFromConvex(
  limit = 20,
): Promise<ConvexModelUsageTrend[]> {
  const client = getConvexClient();
  return await client.query("models:listUsageTrends" as any, {
    limit,
  });
}
