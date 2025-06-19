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
