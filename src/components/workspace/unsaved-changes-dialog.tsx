"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCardEditorStore } from "@/store/use-card-editor-store";

interface UnsavedChangesDialogProps {
  /** Called when user confirms they want to discard changes */
  onConfirm: () => void;
  /** Called when user cancels */
  onCancel: () => void;
}

/**
 * Modal dialog shown when user tries to navigate away with unsaved changes.
 * Prevents accidental data loss.
 */
export function UnsavedChangesDialog({ onConfirm, onCancel }: UnsavedChangesDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Focus first focusable element
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement?.focus();

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-title"
      aria-describedby="unsaved-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-200"
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-600"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Content */}
        <h2
          id="unsaved-title"
          className="text-lg font-bold text-workspace-text-primary mb-2"
        >
          Unsaved Changes
        </h2>
        <p
          id="unsaved-description"
          className="text-sm text-workspace-text-muted leading-relaxed mb-6"
        >
          You have unsaved changes that will be lost if you leave this card. Do you want to discard them?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-workspace-surface-dim text-workspace-text-primary font-semibold text-sm hover:bg-workspace-outline/30 transition-colors"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check for unsaved changes before navigation.
 * Shows dialog and prevents navigation if user cancels.
 */
export function useUnsavedChangesGuard() {
  const router = useRouter();
  const saveState = useCardEditorStore((s) => s.saveState);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigateWithGuard = useCallback(
    (href: string) => {
      if (saveState === "dirty") {
        setIsDialogOpen(true);
        return false; // Navigation blocked
      }
      router.push(href);
      return true; // Navigation allowed
    },
    [saveState, router, setIsDialogOpen]
  );

  const handleConfirm = useCallback(
    (href: string) => {
      setIsDialogOpen(false);
      router.push(href);
    },
    [router, setIsDialogOpen]
  );

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  return {
    navigateWithGuard,
    isDialogOpen,
    handleConfirm,
    handleCancel,
    hasUnsavedChanges: saveState === "dirty",
  };
}
