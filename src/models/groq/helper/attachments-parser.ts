import { incomingData } from "../../types";
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

const DocumentParse = ({ inc }: { inc: incomingData }) => {
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
