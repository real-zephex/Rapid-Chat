"use client";
import Image from "next/image";
import { memo, useMemo, useEffect } from "react";
import { MdOutlineDocumentScanner } from "react-icons/md";
import { FiDownload } from "react-icons/fi";

const ImagePreview = memo(
  ({
    images,
    onRemove,
  }: {
    images: { mimeType: string; data: Uint8Array }[];
    onRemove: (index: number) => void;
  }) => {
    const files = useMemo(() => {
      return images
        .map((item, originalIndex) => {
          const kind =
            item.mimeType === "application/pdf"
              ? "pdf"
              : item.mimeType === "image/png" ||
                item.mimeType === "image/jpeg" ||
                item.mimeType === "image/jpg"
              ? "image"
              : "other";
          if (kind === "other") return null;
          const url = URL.createObjectURL(
            new Blob([new Uint8Array(item.data)], { type: item.mimeType })
          );
          return { url, kind, originalIndex, mimeType: item.mimeType } as const;
        })
        .filter(Boolean) as Array<{
        url: string;
        kind: "image" | "pdf";
        originalIndex: number;
        mimeType: string;
      }>;
    }, [images]);

    // Cleanup blob URLs when the component unmounts or images change
    useEffect(() => {
      return () => {
        files.forEach((f) => URL.revokeObjectURL(f.url));
      };
    }, [files]);

    if (files.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 p-2 bg-neutral-800/50 rounded-lg mb-2">
        {files.map((file) => (
          <div key={file.originalIndex} className="relative">
            {file.kind === "image" ? (
              <Image
                src={file.url}
                alt={`File ${file.originalIndex + 1}`}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded border border-gray-600 bg-neutral-900"
                unoptimized={true}
              />
            ) : (
              <div className="w-20 h-20 rounded border border-gray-600 bg-neutral-900 flex items-center justify-center text-neutral-300">
                <MdOutlineDocumentScanner size={22} />
              </div>
            )}
            <a
              href={file.url}
              download
              className="absolute bottom-1 left-1 bg-neutral-700/80 hover:bg-neutral-600 text-white rounded p-1 text-[10px] flex items-center gap-1"
              title="Download file"
            >
              <FiDownload size={10} />
            </a>
            <button
              onClick={() => onRemove(file.originalIndex)}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  }
);
ImagePreview.displayName = "ImagePreview";

export default ImagePreview;
