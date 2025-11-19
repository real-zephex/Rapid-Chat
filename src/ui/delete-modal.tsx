"use client";

import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteModal = ({ isOpen, onClose, onConfirm }: DeleteModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useHotkeys("esc", (e) => {
        e.preventDefault();
        if (isOpen) {
            onClose();
        }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                ref={modalRef}
                className="bg-[#2f2f2f] rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 overflow-hidden"
            >
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Delete all chats?
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        This action will permanently delete all your conversation history.
                        This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#3f3f3f] transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium border border-red-500/20"
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
