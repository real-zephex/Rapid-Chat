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

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, changeModel] = useState<string>("llama_scout");
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const { setMessage: sM, setType, fire } = useToast();

  async function getModelsFromLocal() {
    await modelInfo.refresh();
    const storedModels = await modelInfo.retrieveFromLocal();

    setModels(storedModels);
    setTimeout(() => {
      sM("Models loaded successfully!");
      setType("success");
      fire();
    }, 500);
    console.info("Models loaded successfully.");
  }

  const refreshModels = async () => {
    await modelInfo.refresh();
    const refreshedModels = await modelInfo.retrieveFromLocal();
    setModels(refreshedModels);
    setTimeout(() => {
      sM("Models refreshed successfully!");
      setType("info");
      fire();
    }, 500);
  };

  useEffect(() => {
    getModelsFromLocal();
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
