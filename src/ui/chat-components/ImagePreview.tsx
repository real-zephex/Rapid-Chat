"use client";
import Image from "next/image";
import { memo, useMemo, useEffect } from "react";

const ImagePreview = memo(
  ({
    images,
    onRemove,
  }: {
    images: { mimeType: string; data: Uint8Array }[];
    onRemove: (index: number) => void;
  }) => {
    const { documents, images: imageFiles } = useMemo(() => {
      return images.reduce(
        (acc, item, originalIndex) => {
          if (item.mimeType === "application/pdf") {
            acc.documents.push({ ...item, originalIndex });
          } else if (
            item.mimeType === "image/png" ||
            item.mimeType === "image/jpeg" ||
            item.mimeType === "image/jpg"
          ) {
            acc.images.push({ ...item, originalIndex });
          }
          return acc;
        },
        {
          documents: [] as Array<
            (typeof images)[0] & { originalIndex: number }
          >,
          images: [] as Array<(typeof images)[0] & { originalIndex: number }>,
        }
      );
    }, [images]);

    const imageUrls = useMemo(() => {
      return imageFiles.map((image) => ({
        url: URL.createObjectURL(
          new Blob([new Uint8Array(image.data)], {
            type: image.mimeType,
          })
        ),
        originalIndex: image.originalIndex,
      }));
    }, [imageFiles]);

    // removes the blobs when the component unmounts or images change
    useEffect(() => {
      return () => {
        imageUrls.forEach(({ url }) => URL.revokeObjectURL(url));
      };
    }, [imageUrls]);

    if (images.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 p-2 bg-neutral-800/50 rounded-lg mb-2">
        {imageUrls.map(({ url, originalIndex }) => (
          <div key={originalIndex} className="relative">
            <Image
              src={url}
              alt={`Preview ${originalIndex + 1}`}
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded border border-gray-500"
              unoptimized={true}
            />
            <button
              onClick={() => onRemove(originalIndex)}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              title="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        {documents.length > 0 && (
          <div className="flex flex-row gap-2 mt-2 mb-2 overflow-x-auto">
            {documents.map(({ data, mimeType, originalIndex }) => (
              <div key={originalIndex} className="relative p-2 w-auto">
                <a
                  href={URL.createObjectURL(
                    new Blob([new Uint8Array(data)], {
                      type: mimeType,
                    })
                  )}
                  download={`document-${originalIndex + 1}.pdf`}
                  className="text-sm bg-neutral-800 p-1 rounded-lg px-2 "
                >
                  Document {originalIndex + 1}
                </a>
                <button
                  onClick={() => onRemove(originalIndex)}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
ImagePreview.displayName = "ImagePreview";

export default ImagePreview;
