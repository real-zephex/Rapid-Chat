"use client";

import { useEffect, useRef } from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal = ({ isOpen, onClose, onConfirm }: DeleteModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousActive = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = [cancelButtonRef.current, confirmButtonRef.current].filter(
        (item): item is HTMLButtonElement => Boolean(item),
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      previousActive?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <div className="p-6">
          <h2
            id="delete-modal-title"
            className="mb-2 text-xl font-semibold text-text-primary"
          >
            Delete all chats?
          </h2>
          <p id="delete-modal-description" className="mb-6 text-sm text-text-secondary">
            This action permanently clears your local conversation history and cannot
            be undone.
          </p>

          <div className="flex justify-end gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onConfirm}
              className="rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-sm font-semibold text-error transition-colors hover:bg-error/15"
            >
              Delete All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
