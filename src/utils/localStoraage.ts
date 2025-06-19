"use client";

interface Messages {
  role: "user" | "assistant";
  content: string;
}

export const saveChats = (id: string, messages: Messages[]) => {
  try {
    localStorage.setItem(id, JSON.stringify(messages));
  } catch (error) {
    console.error(error);
  }
};

export const retrieveChats = (id: string) => {
  try {
    const messages = localStorage.getItem(id) || `[]`;
    const parsed: Messages[] = JSON.parse(messages);
    return parsed;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addTabs = async (id: string) => {
  try {
    const chats = localStorage.getItem("chats") || "[]";
    const parsed: string[] = await JSON.parse(chats);
    parsed.push(id);
    localStorage.setItem("chats", JSON.stringify(parsed));
  } catch (error) {
    console.error(error);
  }
};

export const retrieveTabs = () => {
  try {
    const items = localStorage.getItem("chats") || "[]";
    const parsed: string[] = JSON.parse(items);
    return parsed;
  } catch (error) {
    console.error(error);
    return [];
  }
};
