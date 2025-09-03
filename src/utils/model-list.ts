import get_model_information from "@/models/database/read_models_information";

interface modelDescription {
  model_code: string;
  display_name: string;
  description: string;
  image_support: boolean;
  pdf_support: boolean;
  type: "reasoning" | "conversational" | "general";
  active: boolean;
}

export interface ModelInfo {
  name: string;
  code: string;
  image: boolean;
  pdf: boolean;
  description: string;
  type: "reasoning" | "conversational" | "general";
}

export class ModelInformation {
  async retrieveFromLocal(): Promise<ModelInfo[] | []> {
    try {
      const items = localStorage.getItem("models");

      if (!items || items.length == 0) {
        await this.saveToLocal(); 
        const freshItems = localStorage.getItem("models");
        return freshItems ? JSON.parse(freshItems) : [];
      }

      return JSON.parse(items);
    } catch (err) {
      console.error("Failed to read models from localStorage:", err);
      return [];
    }
  }

  async saveToLocal() {
    try {
      const items = await this.models();
      localStorage.setItem("models", JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save models to localStorage:", err);
    }
  }

  private async models(): Promise<ModelInfo[] | []> {
    try {
      const rawModels: modelDescription[] = await get_model_information();
      return rawModels.map((model) => ({
        name: model.display_name,
        code: model.model_code,
        image: model.image_support,
        pdf: model.pdf_support,
        description: model.description || "No description available.",
        type: model.type,
      }));
    } catch (err) {
      console.error("Failed to fetch model information:", err);
      return [];
    }
  }

  async refresh() {
    await this.saveToLocal();
  }
}

