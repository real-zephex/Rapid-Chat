"use client";
import Image from "next/image";
import { memo, useMemo, useEffect } from "react";

// Memoized component for displaying images to prevent re-creation of blob URLs
const ImageDisplay = memo(
  ({ images }: { images: { mimeType: string; data: Uint8Array }[] }) => {
    // Memoize blob URL creation to prevent recreation on every render
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

    return (
      <div className="flex flex-wrap gap-2 mt-2 mb-2">
        {imageUrls.map((dataUrl, index) => (
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
      </div>
    );
  }
);
ImageDisplay.displayName = "ImageDisplay";

export default ImageDisplay;
