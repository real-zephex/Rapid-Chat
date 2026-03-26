"use client";
import Image from "next/image";
import { memo, useMemo, useEffect } from "react";
import { MdOutlineDocumentScanner } from "react-icons/md";
import { FiDownload } from "react-icons/fi";

const ImageDisplay = memo(
  ({ images }: { images: { mimeType: string; data: Uint8Array }[] }) => {
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
          return { url, kind, index: originalIndex, mimeType: item.mimeType } as const;
        })
        .filter(Boolean) as Array<{
        url: string;
        kind: "image" | "pdf";
        index: number;
        mimeType: string;
      }>;
    }, [images]);

    // Cleanup blob URLs when component unmounts or images change
    useEffect(() => {
      return () => {
        files.forEach((f) => URL.revokeObjectURL(f.url));
      };
    }, [files]);

    return (
      <div className="mt-2 mb-2 flex w-full flex-row items-center gap-2 overflow-x-auto">
        {files.map((file) => (
          <div key={file.index} className="relative">
            {file.kind === "image" ? (
              <Image
                src={file.url}
                alt={`File ${file.index + 1}`}
                width={160}
                height={160}
                className="h-32 w-32 rounded-lg border border-border bg-surface object-cover"
                unoptimized={true}
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary">
                <MdOutlineDocumentScanner size={24} />
              </div>
            )}
            <a
              href={file.url}
              download
              className="absolute bottom-2 left-2 flex items-center gap-1 rounded border border-border bg-background/90 p-1 text-[10px] text-text-primary"
              title="Download file"
              aria-label={`Download file ${file.index + 1}`}
            >
              <FiDownload size={12} />
            </a>
          </div>
        ))}
      </div>
    );
  }
);
ImageDisplay.displayName = "ImageDisplay";

export default ImageDisplay;
