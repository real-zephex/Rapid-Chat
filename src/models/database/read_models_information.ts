import {
  listActiveModelInformationFromConvex,
} from "./convex";

export async function get_model_information() {
  try {
    const data = await listActiveModelInformationFromConvex();

    return data;
  } catch (error) {
    console.error("Error fetching model information from Convex:", error);
    return [];
  }
}

export default get_model_information;
