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
      <div className="flex flex-wrap gap-2 mb-3">
        {files.map((file) => (
          <div key={file.originalIndex} className="relative group">
            {file.kind === "image" ? (
              <Image
                src={file.url}
                alt={`File ${file.originalIndex + 1}`}
                width={100}
                height={100}
                className="w-24 h-24 object-cover rounded-lg border border-border bg-surface"
                unoptimized={true}
              />
            ) : (
              <div className="w-24 h-24 rounded-lg border border-border bg-surface flex items-center justify-center text-text-muted">
                <MdOutlineDocumentScanner size={28} />
              </div>
            )}
            <a
              href={file.url}
              download
              className="absolute bottom-1 left-1 bg-black/70 hover:bg-black/90 text-white rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Download file"
            >
              <FiDownload size={12} />
            </a>
            <button
              onClick={() => onRemove(file.originalIndex)}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg"
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
