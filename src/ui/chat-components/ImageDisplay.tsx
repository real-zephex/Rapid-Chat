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
      <div className="flex flex-row overflow-x-auto items-center gap-2 mt-2 mb-2 w-full">
        {files.map((file) => (
          <div key={file.index} className="relative">
            {file.kind === "image" ? (
              <Image
                src={file.url}
                alt={`File ${file.index + 1}`}
                width={160}
                height={160}
                className="w-40 h-40 object-cover rounded-lg border border-gray-600 bg-neutral-900"
                unoptimized={true}
              />
            ) : (
              <div className="w-40 h-40 rounded-lg border border-gray-600 bg-neutral-900 flex items-center justify-center text-neutral-300">
                <MdOutlineDocumentScanner size={28} />
              </div>
            )}
            <a
              href={file.url}
              download
              className="absolute bottom-2 left-2 bg-neutral-700/80 hover:bg-neutral-600 text-white rounded p-1 text-[10px] flex items-center gap-1"
              title="Download file"
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
