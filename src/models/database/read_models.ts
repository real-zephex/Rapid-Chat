"use server";

import {
  getActiveRuntimeModelByCodeFromConvex,
  incrementModelUsageInConvex,
  listActiveRuntimeModelsFromConvex,
  listModelUsageTrendsFromConvex,
} from "./convex";

const fallbackModel = {
  model_code: "scout",
  provider_code: "meta-llama/llama-4-scout-17b-16e-instruct",
  max_completion_tokens: 8192,
  temperature: 1,
  top_p: 1,
  stream: true,
  stop: null,
  image_support: true,
  pdf_support: false,
  reasoning: false,
  system_prompt:
    "You are Scout. You are a helpful, knowledgeable, and friendly AI assistant designed to provide clear, natural, and supportive conversations. Your primary goal is to assist users by providing accurate, easy-to-understand, and genuinely useful information. You are also capable of reasoning and problem-solving.",
  provider: "groq" as "groq" | "openrouter",
  active: true,
};

export async function fetchActiveModels() {
  try {
    const data = await listActiveRuntimeModelsFromConvex();

    if (!data || data.length === 0) {
      return [fallbackModel];
    }

    return data;
  } catch (error) {
    console.error("Error fetching active models from Convex:", error);
    return [fallbackModel];
  }
}

export async function fetchActiveModelByCode(modelCode: string) {
  try {
    const model = await getActiveRuntimeModelByCodeFromConvex(modelCode);

    if (!model) {
      return null;
    }

    return model;
  } catch (error) {
    console.error("Error fetching model by code from Convex:", error);
    return null;
  }
}

export async function incrementModelUsage(modelCode: string) {
  try {
    await incrementModelUsageInConvex(modelCode);
  } catch (error) {
    console.error("Error incrementing model usage in Convex:", error);
  }
}

export async function fetchModelUsageTrends(limit = 20) {
  try {
    const trends = await listModelUsageTrendsFromConvex(limit);
    return trends;
  } catch (error) {
    console.error("Error fetching model usage trends from Convex:", error);
    return [];
  }
}
