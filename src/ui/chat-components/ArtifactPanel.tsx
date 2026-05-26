"use client";
import { memo, useRef, useState } from "react";
import { HiArrowsPointingOut, HiXMark } from "react-icons/hi2";
import type { Artifact } from "@/hooks/useArtifactDetector";
import ArtifactRenderer from "./ArtifactRenderer";

interface ArtifactPanelProps {
  artifacts: Artifact[];
  onClose: () => void;
}

const ArtifactPanel = memo(function ArtifactPanel({
  artifacts,
  onClose,
}: ArtifactPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const artifact = artifacts[activeIndex];

  const handleFullscreen = () => {
    if (previewRef.current) {
      previewRef.current.requestFullscreen();
    }
  };

  if (!artifact) return null;

  return (
    <aside className="flex h-full flex-col border-l border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Artifacts ({artifacts.length})
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleFullscreen}
            className="rounded-lg p-1 text-text-muted transition-colors hover:bg-background hover:text-text-primary"
            aria-label="View fullscreen"
            title="Fullscreen"
          >
            <HiArrowsPointingOut size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted transition-colors hover:bg-background hover:text-text-primary"
            aria-label="Close artifacts panel"
          >
            <HiXMark size={16} />
          </button>
        </span>
      </div>

      {/* Tab bar */}
      {artifacts.length > 1 && (
        <div className="flex gap-0.5 border-b border-border px-2 py-1.5 overflow-x-auto">
          {artifacts.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap transition-colors ${
                i === activeIndex
                  ? "bg-accent text-background"
                  : "text-text-secondary hover:bg-background hover:text-text-primary"
              }`}
            >
              {a.languages[0]?.toUpperCase() ?? "Preview"}
            </button>
          ))}
        </div>
      )}

      {/* Preview area */}
      <div ref={previewRef} className="flex-1 overflow-hidden bg-white">
        <ArtifactRenderer
          html={artifact.html}
          css={artifact.css}
          js={artifact.js}
        />
      </div>
    </aside>
  );
});

export default ArtifactPanel;
