"use client";

import { type ReactNode, useLayoutEffect } from "react";
import type { WorkspaceCardDTO } from "@/dto";
import { useWorkspaceCard } from "@/features/appearance/hooks/useWorkspaceCard";
import { useValidation } from "@/features/appearance/hooks/useValidation";
import { useCardEditorStore, type EditorButton, type EditorSocialLink } from "@/store/use-card-editor-store";

// ═══════════════════════════════════════════════════════════════════════════
// CardEditorProvider — bridges existing hooks → Zustand store
//
// 1. Uses useWorkspaceCard (existing hook) to hydrate from server data
// 2. Syncs hook state → Zustand store so inspector + preview can share it
// 3. Exposes validation via useValidation (existing hook)
//
// This is the ONLY place that uses the existing hooks directly.
// Inspector editors and preview renderer read/write the Zustand store.
// ═══════════════════════════════════════════════════════════════════════════

export interface CardEditorProviderProps {
  initialCard: WorkspaceCardDTO | undefined;
  slug: string;
  editorToken?: string;
  editorExpiresAt?: string;
  children: ReactNode;
}

export function CardEditorProvider({
  initialCard,
  slug,
  editorToken,
  editorExpiresAt,
  children,
}: CardEditorProviderProps) {
  // ── Existing hooks (reused exactly as-is) ──────────────────────────
  const {
    card,
    appearance,
    profile,
    editorButtons,
    editorSocial,
    previewCard,
    sessionState,
  } = useWorkspaceCard(initialCard, slug, editorToken, editorExpiresAt);

  const { fieldErrors, errorSummary, validate, clearErrors, clearFieldError } = useValidation();

  // ── Zustand store ──────────────────────────────────────────────────
  const hydrate = useCardEditorStore((s) => s.hydrate);

  // ── Sync hook state → Zustand store ────────────────────────────────
  // Deferred to useLayoutEffect so the Zustand set() does not fire
  // during CardEditorProvider's render phase.  Subscribing components
  // (WorkspaceShell, PreviewSync) would otherwise re-render while this
  // component is still rendering, triggering React's "Cannot update a
  // component while rendering a different component" warning.
  //
  // useLayoutEffect fires synchronously after DOM mutations but before
  // the browser paints, so the preview never flashes a loading skeleton.
  // The isHydrated runtime guard prevents duplicate hydration across
  // StrictMode double-mounts and effect re-invocations.
  useLayoutEffect(() => {
    if (sessionState !== "ready" || !card || !appearance || !profile) return;
    if (useCardEditorStore.getState().isHydrated) return;

    if (process.env.NODE_ENV === "development") {
      console.log("[CardEditorProvider] hydrating with editorButtons:", (editorButtons as EditorButton[]).map((b: EditorButton) => b.id));
      console.log("[CardEditorProvider] editorButtons count:", (editorButtons as EditorButton[]).length);
    }

    hydrate({
      card,
      appearance,
      profile,
      editorButtons: (editorButtons as EditorButton[]),
      editorSocialLinks: (editorSocial as EditorSocialLink[]),
      cardId: card.id,
      slug,
      editorToken: editorToken ?? null,
      editorExpiresAt: editorExpiresAt ?? null,
    });
    // Restore avatar URL from server — the DB is the canonical source.
    // sessionStorage is an optional cache only, never required for correctness.
    if (initialCard?.avatarUrl) {
      useCardEditorStore.setState((s) => ({ media: { ...s.media, avatarUrl: initialCard.avatarUrl! } }));
      try { sessionStorage.setItem(`avatar:${card.id}`, initialCard.avatarUrl); } catch { /* ignore */ }
    }
  }, [sessionState, card, appearance, profile, editorButtons, editorSocial, hydrate, slug, editorToken, editorExpiresAt, initialCard?.avatarUrl]);

  return <>{children}</>;
}

export { useCardEditorStore, useValidation };
