"use client";
import { memo, useState, useCallback } from "react";

const DownloadCodeButton = memo(
  ({ text, filename }: { text: string; filename: string }) => {
    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = useCallback(async () => {
      try {
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
      } catch (err) {
        console.error("Failed to download code: ", err);
      }
    }, [text, filename]);

    return (
      <button
        onClick={handleDownload}
        className="rounded-md border border-border bg-surface p-1.5 text-text-muted opacity-70 transition-all duration-200 hover:opacity-100 hover:text-text-primary"
        title={downloaded ? "Downloaded!" : "Download code"}
        aria-label={downloaded ? "Code downloaded" : "Download code"}
        type="button"
      >
        {downloaded ? (
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
            <path d="M21,15 L21,19 A2,2 0 0,1 19,21 L5,21 A2,2 0 0,1 3,19 L3,15"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        )}
      </button>
    );
  }
);
DownloadCodeButton.displayName = "DownloadCodeButton";

export default DownloadCodeButton;
