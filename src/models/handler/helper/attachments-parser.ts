import { fileUploads } from "@/models";

type ImageContentPart = {
  type: "image_url";
  image_url: {
    url: string;
  };
};

const ImageParser = ({
  inc,
}: {
  inc: fileUploads[];
}): ImageContentPart[] => {
  return inc.map((img) => ({
    type: "image_url" as const,
    image_url: {
      url: `data:${img.mimeType};base64,${Buffer.from(img.data).toString("base64")}`,
    },
  }));
};

const DocumentParse = ({
  inc,
}: {
  inc: fileUploads[];
}): ImageContentPart[] => {
  return inc.map((img) => ({
    type: "image_url" as const,
    image_url: {
      url: `data:application/pdf;base64,${Buffer.from(img.data).toString("base64")}`,
    },
  }));
};

export { DocumentParse, ImageParser };
