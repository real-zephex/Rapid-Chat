"use server";

import supabase from "./instance";

export async function get_model_information() {
  const { data, error } = await supabase
    .from("models_information")
    .select("*")
    .eq("active", true);

  if (error) {
    console.error("Error fetching model information:", error);
    return [];
  }

  return data;
}

export default get_model_information;
