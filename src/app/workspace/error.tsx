"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert, ArrowLeft, RotateCcw } from "lucide-react";
import { useCardEditorStore } from "@/store/use-card-editor-store";

/**
 * Workspace route error boundary.
 *
 * Renders inside the layout's children slot (the canvas area) — the
 * sidebar, toolbar, and inspector stay visible.  Provides specific
 * recovery actions so the user never sees a blank editor.
 */
export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const availableCards = useCardEditorStore((s) => s.availableCards);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  const handleGoBack = useCallback(() => {
    if (availableCards.length > 1) {
      router.push("/workspace");
    } else {
      // Fallback: reload the page to get a clean state
      window.location.reload();
    }
  }, [availableCards, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-0 h-full">
      <div className="max-w-sm space-y-6">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <TriangleAlert className="text-red-500" size={24} />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold tracking-tight text-workspace-text-primary">
            Could not load this card
          </h2>
          <p className="text-sm text-workspace-text-muted leading-relaxed">
            There was a problem loading the workspace. Your changes are safe.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-workspace-primary text-white rounded-xl px-6 py-3 text-sm font-bold shadow-sm hover:opacity-90 transition-opacity active:scale-95 focus-visible:outline-2 focus-visible:outline-workspace-primary"
          >
            <RotateCcw size={16} />
            Try again
          </button>

          {availableCards.length > 1 && (
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-workspace-text-secondary hover:bg-workspace-surface-dim transition-colors"
            >
              <ArrowLeft size={16} />
              Back to cards
            </button>
          )}
        </div>

        {/* Debug reference (dev only) */}
        {process.env.NODE_ENV !== "production" && error.digest && (
          <p className="text-xs text-workspace-text-muted font-mono">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
