"use client";
import Image from "next/image";
import { memo, useMemo, useEffect } from "react";
import { MdOutlineDocumentScanner } from "react-icons/md";

const ImageDisplay = memo(
  ({ images }: { images: { mimeType: string; data: Uint8Array }[] }) => {
    console.log(images);
    const documents = useMemo(() => {
      return images.filter((img) => img.mimeType === "application/pdf");
    }, [images]);

    const imageUrls = useMemo(() => {
      return images
        .filter(
          (img) =>
            img.mimeType === "image/png" ||
            img.mimeType === "image/jpeg" ||
            img.mimeType === "image/jpg"
        )
        .map((image) => {
          const blob = new Blob([new Uint8Array(image.data)], {
            type: image.mimeType,
          });
          return URL.createObjectURL(blob);
        });
    }, [images]);

    // Cleanup blob URLs when component unmounts or images change
    useEffect(() => {
      return () => {
        imageUrls.forEach((url) => URL.revokeObjectURL(url));
      };
    }, [imageUrls]);

    return (
      <div className="flex flex-col gap-2 mt-2 mb-2">
        {imageUrls &&
          imageUrls.map((dataUrl, index) => (
            <div key={index} className="relative">
              <Image
                src={dataUrl}
                alt={`Uploaded image ${index + 1}`}
                width={300}
                height={200}
                className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-600"
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: "300px",
                  maxHeight: "192px",
                }}
                unoptimized={true}
              />
            </div>
          ))}
        {documents.length > 0 && (
          <div className="flex flex-row gap-2 mt-2 mb-2 overflow-x-auto">
            {documents.map((doc, index) => (
              <a
                key={index}
                href={URL.createObjectURL(
                  new Blob([new Uint8Array(doc.data)], {
                    type: doc.mimeType,
                  })
                )}
                download={`document-${index + 1}.pdf`}
                className="text-sm bg-neutral-800 p-1 rounded-lg px-2 flex flex-row items-center gap-1 hover:bg-neutral-600 transition-colors duration-200 "
              >
                <MdOutlineDocumentScanner />
                Document {index + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }
);
ImageDisplay.displayName = "ImageDisplay";

export default ImageDisplay;
