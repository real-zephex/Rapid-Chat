"use client";

import { ModelInfo, ModelInformation } from "@/utils/model-list";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useToast } from "./ToastContext";

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
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const { setMessage: sM, setType, fire } = useToast();

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

  const refreshModels = async () => {
    await modelInfo.refresh();
    const refreshedModels = await modelInfo.retrieveFromLocal();
    setModels(refreshedModels);

    if (refreshedModels.length > 0) {
      try {
        const stored = localStorage.getItem(DEFAULT_MODEL_KEY);
        const modelToCheck = stored || selectedModel;
        
        const selectedExists = refreshedModels.some(
          (model) => model.code === modelToCheck,
        );

        if (selectedExists && modelToCheck) {
          changeModel(modelToCheck);
        } else {
          changeModel(refreshedModels[0].code);
        }
      } catch {
        changeModel(refreshedModels[0].code);
      }
    }

    setTimeout(() => {
      sM("Models refreshed successfully!");
      setType("info");
      fire();
    }, 500);
  };

  useEffect(() => {
    refreshModels();
  }, []);

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
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
