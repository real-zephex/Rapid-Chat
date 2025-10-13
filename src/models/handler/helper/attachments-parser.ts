import { fileUploads } from "@/models";
import { incomingData } from "../../types";

const ImageParser = ({
  inc,
  provider,
}: {
  inc: fileUploads[];
  provider: "google" | "groq" | "openrouter";
}) => {
  return inc.map((img) => ({
    type: "image_url" as const,
    image_url: {
      url: `data:${provider != "google" ? img.mimeType : "image/jpeg"};base64,${Buffer.from(
        img.data,
      ).toString("base64")}`,
    },
  }));
};

const DocumentParse = ({
  inc,
  provider,
}: {
  inc: fileUploads[];
  provider: "google" | "openrouter" | "groq";
}) => {
  if (provider === "google") {
    return inc.map((item) => ({
      type: "image_url" as const,
      image_url: {
        url: `data:application/pdf;base64,${Buffer.from(item.data).toString(
          "base64",
        )}`,
      },
    }));
  }

  return inc.map((img) => ({
    type: "file",
    file: {
      filename: "document.pdf",
      file_data: `data:application/pdf;base64,${Buffer.from(img.data).toString(
        "base64",
      )}`,
    },
  }));
};

export { DocumentParse, ImageParser };
