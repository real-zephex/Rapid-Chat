"use server";

import supabaseInstance from "./instance";

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
  system_prompt:
    "You are Scout. You are a helpful, knowledgeable, and friendly AI assistant designed to provide clear, natural, and supportive conversations. Your primary goal is to assist users by providing accurate, easy-to-understand, and genuinely useful information. You are also capable of reasoning and problem-solving.",
  provider: "groq" as "groq" | "openrouter",
  active: true,
};

export async function fetchActiveModels() {
  const { data, error } = await supabaseInstance()
    .from("models")
    .select("*")
    .eq("active", true);

  if (error || data.length === 0) {
    console.error("Error fetching active models:", error);
    return [fallbackModel];
  }

  return data;
}
