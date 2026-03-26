"use client";

const Loading = () => {
  return (
    <div className="flex h-dvh w-dvw items-center justify-center bg-background px-4">
      <div className="rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm" role="status" aria-live="polite">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
          <p className="text-sm font-medium text-text-secondary">Loading workspace...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
