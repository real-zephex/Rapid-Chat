"use client";
import { memo, useState, useCallback } from "react";

// Copy button component for code blocks - Memoized to prevent unnecessary re-renders
const CopyButton = memo(
  ({
    text,
    hasLanguageLabel,
  }: {
    text: string;
    hasLanguageLabel?: boolean;
  }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }, [text]);

    return (
      <button
        onClick={handleCopy}
        className={`absolute ${
          hasLanguageLabel ? "top-14" : "top-2"
        } right-2 p-2 rounded-md bg-gray-700/80 hover:bg-gray-600/90 transition-all duration-200 z-10 opacity-60 hover:opacity-100`}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="m5,15 L5,5 A2,2 0 0,1 7,3 L17,3"></path>
          </svg>
        )}
      </button>
    );
  }
);
CopyButton.displayName = "CopyButton";

export default CopyButton;
