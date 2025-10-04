import { ModelInfo } from "@/utils/model-list";
import { incomingData } from "../../types";
import { ModelData } from "../types";
const ImageParser = ({ inc }: { inc: incomingData }) => {
  return inc.imageData
    ? inc.imageData
        .filter(
          (img) =>
            img.mimeType === "image/png" ||
            img.mimeType === "image/jpeg" ||
            img.mimeType === "image/jpg"
        )
        .map((img) => ({
          type: "image_url" as const,
          image_url: {
            url: `data:${img.mimeType};base64,${Buffer.from(img.data).toString(
              "base64"
            )}`,
          },
        }))
    : [];
};

const DocumentParse = ({
  inc,
  provider,
}: {
  inc: incomingData;
  provider: "google" | "openrouter" | "groq";
}) => {
  if (provider === "google") {
    return inc.imageData
      ? inc.imageData.map((img) => ({
          type: "image_url" as const, // fix was to use image_url for pdfs as well
          image_url: {
            url: `data:application/pdf;base64,${Buffer.from(img.data).toString(
              "base64"
            )}`,
          },
        }))
      : [];
  }

  return inc.imageData
    ? inc.imageData
        .filter((img) => img.mimeType === "application/pdf")
        .map((img) => ({
          type: "file",
          file: {
            filename: "document.pdf",
            file_data: `data:application/pdf;base64,${Buffer.from(
              img.data
            ).toString("base64")}`,
          },
        }))
    : [];
};

export { ImageParser, DocumentParse };
