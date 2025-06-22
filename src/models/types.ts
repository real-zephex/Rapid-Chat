import { fileUploads } from ".";

export interface Messages {
  role: "user" | "assistant";
  content: string;
}

export interface incomingData {
  message: string;
  chats: Messages[];
  imageData?: fileUploads[];
}
