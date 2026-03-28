"use client";

export interface CouncilSessionData {
  id: string;
  question: string;
  memberModels: string[];
  judgeModel: string;
  memberResponses: Array<{ modelCode: string; content: string }>;
  judgment: string;
  timestamp: number;
}

const DB_NAME = "FastAIChats";
const COUNCIL_STORE = "councilSessions";

const initCouncilDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("chats")) {
        db.createObjectStore("chats", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("tabs")) {
        db.createObjectStore("tabs", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(COUNCIL_STORE)) {
        db.createObjectStore(COUNCIL_STORE, { keyPath: "id" });
      }
    };
  });
};

const performCouncilDBOperation = async <T>(
  storeName: string,
  operation: (store: IDBObjectStore) => IDBRequest,
  mode: IDBTransactionMode = "readonly",
): Promise<T> => {
  try {
    const db = await initCouncilDB();
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB operation failed:", error);
    throw error;
  }
};

export const saveCouncilSession = async (
  data: CouncilSessionData,
): Promise<void> => {
  try {
    await performCouncilDBOperation(
      COUNCIL_STORE,
      (store) => store.put(data),
      "readwrite",
    );
  } catch (error) {
    console.error("Error saving council session:", error);
  }
};

export const loadCouncilSession = async (
  id: string,
): Promise<CouncilSessionData | null> => {
  try {
    const result = await performCouncilDBOperation<CouncilSessionData | undefined>(
      COUNCIL_STORE,
      (store) => store.get(id),
    );
    return result ?? null;
  } catch (error) {
    console.error("Error loading council session:", error);
    return null;
  }
};

export const listCouncilSessions = async (): Promise<CouncilSessionData[]> => {
  try {
    const result = await performCouncilDBOperation<CouncilSessionData[]>(
      COUNCIL_STORE,
      (store) => store.getAll(),
    );
    return (result ?? []).sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error listing council sessions:", error);
    return [];
  }
};

export const deleteCouncilSession = async (id: string): Promise<void> => {
  try {
    await performCouncilDBOperation(
      COUNCIL_STORE,
      (store) => store.delete(id),
      "readwrite",
    );
  } catch (error) {
    console.error("Error deleting council session:", error);
  }
};

export const deleteAllCouncilSessions = async (): Promise<void> => {
  try {
    await performCouncilDBOperation(
      COUNCIL_STORE,
      (store) => store.clear(),
      "readwrite",
    );
  } catch (error) {
    console.error("Error deleting all council sessions:", error);
  }
};
