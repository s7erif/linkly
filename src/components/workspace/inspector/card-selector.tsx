"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { buildWorkspaceBuilderPath } from "@/lib/public-links";
import { cn } from "@/lib/utils";
import { UnsavedChangesDialog } from "../unsaved-changes-dialog";

export const CardSelector = memo(function CardSelector() {
  const router = useRouter();
  const cards = useCardEditorStore((s) => s.availableCards);
  const activeSlug = useCardEditorStore((s) => s.slug);
  const isHydrated = useCardEditorStore((s) => s.isHydrated);
  const saveState = useCardEditorStore((s) => s.saveState);
  const [pendingNavigate, setPendingNavigate] = useState<string | null>(null);
  const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null);
  const mountedRef = useRef(false);

  // ── Prefetch all card routes on mount and when cards change ─────────
  useEffect(() => {
    mountedRef.current = true;
    if (typeof window === "undefined") return;
    for (const card of cards) {
      router.prefetch(buildWorkspaceBuilderPath(card.slug));
    }
  }, [cards, router]);

  // ── Clear navigating state when hydration completes ─────────────────
  // This signals that the new page has finished loading and the store
  // has been re-hydrated with the target card's data.
  useEffect(() => {
    if (isHydrated && navigatingSlug && navigatingSlug === activeSlug) {
      setNavigatingSlug(null);
    }
  }, [isHydrated, navigatingSlug, activeSlug]);

  // ── Safety fallback: clear navigating state on unmount ──────────────
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Navigation handler with optimistic UX ───────────────────────────
  const handleSelect = useCallback((slug: string) => {
    if (slug === activeSlug) return;

    // Prevent duplicate clicks during active navigation
    if (navigatingSlug !== null) return;

    // Check for unsaved changes
    if (saveState === "dirty") {
      setPendingNavigate(slug);
      return;
    }

    // Optimistic: immediately mark this card as navigating
    setNavigatingSlug(slug);

    // Navigate — loading.tsx handles the transitional skeleton
    router.push(buildWorkspaceBuilderPath(slug));
  }, [activeSlug, navigatingSlug, saveState, router]);

  const handleConfirmDiscard = useCallback(() => {
    if (pendingNavigate) {
      setNavigatingSlug(pendingNavigate);
      setPendingNavigate(null);
      router.push(buildWorkspaceBuilderPath(pendingNavigate));
    }
  }, [pendingNavigate, router]);

  const handleCancelDiscard = useCallback(() => {
    setPendingNavigate(null);
  }, []);

  // Early return AFTER all hooks (Rules of Hooks compliance)
  if (cards.length <= 1) return null;

  const isAnyLoading = navigatingSlug !== null;

  return (
    <>
      <div className="px-4 py-3">
        <div className="mb-2 px-3">
          <span className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-widest">
            Your Cards
          </span>
        </div>
        <div className="space-y-0.5">
          {cards.map((card) => {
            const isActive = card.slug === activeSlug;
            const isLoading = card.slug === navigatingSlug;
            return (
              <button
                key={card.id}
                type="button"
                disabled={isAnyLoading && !isActive}
                onClick={() => handleSelect(card.slug)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-fast",
                  isActive
                    ? "bg-workspace-primary-muted/60 text-workspace-primary font-semibold shadow-sm"
                    : isLoading
                      ? "bg-workspace-primary-muted/30 text-workspace-primary font-medium"
                      : "text-workspace-text-secondary font-medium hover:bg-workspace-surface-dim hover:text-workspace-primary",
                  isAnyLoading && !isActive && "pointer-events-none opacity-60",
                )}
              >
                {/* Card icon — shows spinner while navigating to this card */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all",
                    isActive
                      ? "bg-workspace-primary text-white"
                      : isLoading
                        ? "bg-workspace-primary/20 text-workspace-primary"
                        : "bg-workspace-surface-dim text-workspace-text-muted",
                  )}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 rounded-full border-[2px] border-workspace-primary/30 border-t-workspace-primary animate-spin" />
                  ) : (
                    card.name.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{card.name}</div>
                  <div className="text-[10px] text-workspace-text-muted truncate">
                    /{card.slug}
                  </div>
                </div>

                {/* Active dot or loading pulse */}
                {isActive && !isLoading && (
                  <div className="w-1.5 h-1.5 rounded-full bg-workspace-primary shrink-0" />
                )}
                {isLoading && (
                  <div className="w-1.5 h-1.5 rounded-full bg-workspace-primary/60 animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unsaved changes dialog */}
      {pendingNavigate && (
        <UnsavedChangesDialog
          onConfirm={handleConfirmDiscard}
          onCancel={handleCancelDiscard}
        />
      )}
    </>
  );
});
