"use client";

// This migration to INDEXED DB was entirely done by AI.
// I had implemented it using local storage only and I had no idea nor the time to transition to indexed DB so I relied on AI.
// It surprisingly works so I will be keeping it.

// Writing this on June 21, 2025 at 10:13 pm

interface Messages {
  role: "user" | "assistant";
  content: string;
}

// IndexedDB configuration
const DB_NAME = "FastAIChats";
const DB_VERSION = 1;
const CHATS_STORE = "chats";
const TABS_STORE = "tabs";

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create chats store if it doesn't exist
      if (!db.objectStoreNames.contains(CHATS_STORE)) {
        db.createObjectStore(CHATS_STORE, { keyPath: "id" });
      }

      // Create tabs store if it doesn't exist
      if (!db.objectStoreNames.contains(TABS_STORE)) {
        const tabsStore = db.createObjectStore(TABS_STORE, { keyPath: "key" });
      }
    };
  });
};

// Helper function to perform IndexedDB operations
const performDBOperation = async <T>(
  storeName: string,
  operation: (store: IDBObjectStore) => IDBRequest,
  mode: IDBTransactionMode = "readonly"
): Promise<T> => {
  try {
    const db = await initDB();
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

export const saveChats = async (id: string, messages: Messages[]) => {
  try {
    await performDBOperation(
      CHATS_STORE,
      (store) => store.put({ id, messages }),
      "readwrite"
    );
  } catch (error) {
    console.error("Error saving chats:", error);
    // Fallback to localStorage if IndexedDB fails
    try {
      localStorage.setItem(id, JSON.stringify(messages));
    } catch (fallbackError) {
      console.error("Fallback to localStorage also failed:", fallbackError);
    }
  }
};

export const retrieveChats = async (id: string): Promise<Messages[]> => {
  try {
    const result = await performDBOperation<{
      id: string;
      messages: Messages[];
    }>(CHATS_STORE, (store) => store.get(id));
    return result?.messages || [];
  } catch (error) {
    console.error("Error retrieving chats:", error);
    // Fallback to localStorage if IndexedDB fails
    try {
      const messages = localStorage.getItem(id) || `[]`;
      const parsed: Messages[] = JSON.parse(messages);
      return parsed;
    } catch (fallbackError) {
      console.error("Fallback to localStorage also failed:", fallbackError);
      return [];
    }
  }
};

export const addTabs = async (id: string) => {
  try {
    // First, get existing tabs
    let existingTabs: string[] = [];
    try {
      const result = await performDBOperation<{ key: string; tabs: string[] }>(
        TABS_STORE,
        (store) => store.get("chatTabs")
      );
      existingTabs = result?.tabs || [];
    } catch (getError) {
      // If getting fails, start with empty array
      existingTabs = [];
    }

    // Add new tab if it doesn't exist
    if (!existingTabs.includes(id)) {
      existingTabs.push(id);
    }

    // Save updated tabs
    await performDBOperation(
      TABS_STORE,
      (store) => store.put({ key: "chatTabs", tabs: existingTabs }),
      "readwrite"
    );
  } catch (error) {
    console.error("Error adding tab:", error);
    // Fallback to localStorage if IndexedDB fails
    try {
      const chats = localStorage.getItem("chats") || "[]";
      const parsed: string[] = JSON.parse(chats);
      if (!parsed.includes(id)) {
        parsed.push(id);
      }
      localStorage.setItem("chats", JSON.stringify(parsed));
    } catch (fallbackError) {
      console.error("Fallback to localStorage also failed:", fallbackError);
    }
  }
};

export const retrieveTabs = async (): Promise<string[]> => {
  try {
    const result = await performDBOperation<{ key: string; tabs: string[] }>(
      TABS_STORE,
      (store) => store.get("chatTabs")
    );
    return result?.tabs || [];
  } catch (error) {
    console.error("Error retrieving tabs:", error);
    // Fallback to localStorage if IndexedDB fails
    try {
      const items = localStorage.getItem("chats") || "[]";
      const parsed: string[] = JSON.parse(items);
      return parsed;
    } catch (fallbackError) {
      console.error("Fallback to localStorage also failed:", fallbackError);
      return [];
    }
  }
};

// Migration function to transfer data from localStorage to IndexedDB
export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    // Check if migration has already been done
    const migrationKey = "indexeddb_migration_completed";
    if (localStorage.getItem(migrationKey) === "true") {
      return; // Migration already completed
    }

    console.log("Starting migration from localStorage to IndexedDB...");

    // Migrate tabs
    const localStorageTabs = localStorage.getItem("chats");
    if (localStorageTabs) {
      try {
        const tabs: string[] = JSON.parse(localStorageTabs);
        if (tabs.length > 0) {
          await performDBOperation(
            TABS_STORE,
            (store) => store.put({ key: "chatTabs", tabs }),
            "readwrite"
          );
          console.log(`Migrated ${tabs.length} tabs to IndexedDB`);

          // Migrate individual chat messages
          for (const tabId of tabs) {
            const chatData = localStorage.getItem(tabId);
            if (chatData) {
              try {
                const messages: Messages[] = JSON.parse(chatData);
                await performDBOperation(
                  CHATS_STORE,
                  (store) => store.put({ id: tabId, messages }),
                  "readwrite"
                );
              } catch (error) {
                console.error(
                  `Failed to migrate chat data for ${tabId}:`,
                  error
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse tabs from localStorage:", error);
      }
    }

    // Mark migration as completed
    localStorage.setItem(migrationKey, "true");
    console.log(
      "Migration from localStorage to IndexedDB completed successfully"
    );
  } catch (error) {
    console.error("Migration from localStorage to IndexedDB failed:", error);
  }
};

// Auto-run migration on module load (only in browser environment)
if (typeof window !== "undefined") {
  migrateFromLocalStorage().catch(console.error);
}

export const deleteChat = async (id: string): Promise<void> => {
  try {
    // Delete the chat from IndexedDB
    await performDBOperation(
      CHATS_STORE,
      (store) => store.delete(id),
      "readwrite"
    );
  } catch (error) {
    console.error("Error deleting chat from IndexedDB:", error);
    // Fallback to localStorage if IndexedDB fails
    try {
      localStorage.removeItem(id);
    } catch (fallbackError) {
      console.error("Fallback to localStorage also failed:", fallbackError);
    }
  }
};

export const deleteTab = async (id: string): Promise<void> => {
  try {
    // First, get existing tabs
    let existingTabs: string[] = [];
    try {
      const result = await performDBOperation<{ key: string; tabs: string[] }>(
        TABS_STORE,
        (store) => store.get("chatTabs")
      );
      existingTabs = result?.tabs || [];
    } catch (getError) {
      existingTabs = [];
    }

    // Remove the tab from the list
    const updatedTabs = existingTabs.filter((tab) => tab !== id);

    // Save updated tabs list
    await performDBOperation(
      TABS_STORE,
      (store) => store.put({ key: "chatTabs", tabs: updatedTabs }),
      "readwrite"
    );

    // Also delete the associated chat data
    await deleteChat(id);
  } catch (error) {
    console.error("Error deleting tab:", error);
    // Fallback to localStorage if IndexedDB fails
    try {
      const chats = localStorage.getItem("chats") || "[]";
      const parsed: string[] = JSON.parse(chats);
      const updatedTabs = parsed.filter((tab) => tab !== id);
      localStorage.setItem("chats", JSON.stringify(updatedTabs));
      localStorage.removeItem(id);
    } catch (fallbackError) {
      console.error("Fallback to localStorage also failed:", fallbackError);
    }
  }
};
