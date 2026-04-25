"use client";

import { ModelInfo, ModelInformation } from "@/utils/model-list";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { useToast } from "./ToastContext";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ModelContextType {
  selectedModel: string;
  models: ModelInfo[];
  changeModel: (model: string) => void;
  setModels: (models: ModelInfo[]) => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  refreshModels: () => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);
const modelInfo = new ModelInformation();
const DEFAULT_MODEL_KEY = "rapid-chat-default-model";

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState<string>("");
  // We can keep setModels for manual overrides if needed, but primary source is convex
  const [_manualModels, setModels] = useState<ModelInfo[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const { setMessage: sM, setType, fire } = useToast();

  const rawModels = useQuery(api.models.listActiveModelInformation);

  const models = useMemo(() => {
    if (!rawModels) return _manualModels;
    return rawModels.map((model) => ({
      name: model.display_name,
      code: model.model_code,
      image: model.image_support,
      pdf: model.pdf_support,
      description: model.description || "No description available.",
      type: model.type as "reasoning" | "conversational" | "general",
      usageCount: model.usage_count ?? 0,
    }));
  }, [rawModels, _manualModels]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEFAULT_MODEL_KEY);
      if (stored) {
        setSelectedModelState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const changeModel = (modelCode: string) => {
    setSelectedModelState(modelCode);
    try {
      localStorage.setItem(DEFAULT_MODEL_KEY, modelCode);
    } catch {
      // ignore
    }
  };

  // Re-evaluate default model when models list updates reactively
  useEffect(() => {
    if (models.length > 0) {
      try {
        const stored = localStorage.getItem(DEFAULT_MODEL_KEY);
        const modelToCheck = stored || selectedModel;
        
        const selectedExists = models.some(
          (model) => model.code === modelToCheck,
        );

        if (selectedExists && modelToCheck) {
          if (selectedModel !== modelToCheck) {
            changeModel(modelToCheck);
          }
        } else {
          changeModel(models[0].code);
        }
      } catch {
        if (!selectedModel || !models.some(m => m.code === selectedModel)) {
          changeModel(models[0].code);
        }
      }
    }
  }, [models]);

  const refreshModels = async () => {
    // With Convex useQuery, this is mostly a manual trigger for the toast
    // and to force a local cache update if the user still uses modelInfo elsewhere.
    await modelInfo.refresh();
    
    setTimeout(() => {
      sM("Models are synced with server.");
      setType("info");
      fire();
    }, 500);
  };

  return (
    <ModelContext.Provider
      value={{
        models,
        selectedModel,
        showModal,
        changeModel,
        setModels,
        setShowModal,
        refreshModels,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
