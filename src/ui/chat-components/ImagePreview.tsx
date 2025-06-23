"use client";
import Image from "next/image";
import { memo, useMemo, useEffect } from "react";

// Memoized component for image preview while typing
const ImagePreview = memo(
  ({
    images,
    onRemove,
  }: {
    images: { mimeType: string; data: Uint8Array }[];
    onRemove: (index: number) => void;
  }) => {
    // Memoize blob URL creation
    const imageUrls = useMemo(() => {
      return images.map((image) => {
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

    if (images.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 p-2 bg-neutral-800/50 rounded-lg mb-2">
        {imageUrls.map((dataUrl, index) => (
          <div key={index} className="relative">
            <Image
              src={dataUrl}
              alt={`Preview ${index + 1}`}
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded border border-gray-500"
              unoptimized={true}
            />
            <button
              onClick={() => onRemove(index)}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              title="Remove image"
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
