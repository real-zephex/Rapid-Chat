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
      <div className="mb-3 flex flex-wrap gap-2">
        {files.map((file) => (
          <div key={file.originalIndex} className="group relative">
            {file.kind === "image" ? (
              <Image
                src={file.url}
                alt={`File ${file.originalIndex + 1}`}
                width={100}
                height={100}
                className="h-20 w-20 rounded-lg border border-border bg-surface object-cover"
                unoptimized={true}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-surface text-text-muted">
                <MdOutlineDocumentScanner size={22} />
              </div>
            )}
            <a
              href={file.url}
              download
              className="absolute bottom-1 left-1 rounded border border-border bg-background/95 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              title="Download file"
              aria-label={`Download file ${file.originalIndex + 1}`}
            >
              <FiDownload size={12} />
            </a>
            <button
              onClick={() => onRemove(file.originalIndex)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-sm font-bold text-error shadow-sm transition-colors hover:bg-surface"
              title="Remove"
              aria-label={`Remove file ${file.originalIndex + 1}`}
              type="button"
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
