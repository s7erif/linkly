"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { CardEditorProvider } from "./card-editor-provider";
import { PreviewSync } from "./preview/preview-sync";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { EmptyWorkspace } from "./empty-workspace";
import { WorkspaceCardSelector } from "./workspace-card-selector";
import { AccountDataProvider } from "./shell/account-center";
import type { WorkspaceCardDTO } from "@/dto";
import type { AccountCenterData } from "@/types/account-center";
import { buildWorkspaceBuilderPath } from "@/lib/public-links";

// ═══════════════════════════════════════════════════════════════════════════
// Client-side page orchestrator — handles all workspace states:
//   1. No cards         → EmptyWorkspace (create first card)
//   2. Multiple cards, no slug selected → WorkspaceCardSelector
//   3. Card selected    → CardEditorProvider + PreviewSync
//
// Editor→Picker transition uses useLayoutEffect so the Zustand reset
// and re-render happen synchronously before the browser paints. This
// prevents a single-frame flash of stale editor chrome (toolbar,
// inspector, etc.).
// ═══════════════════════════════════════════════════════════════════════════

export interface WorkspacePageContentProps {
  cards: ReadonlyArray<{ id: string; name: string; slug: string }>;
  initialCard?: WorkspaceCardDTO | undefined;
  slug?: string;
  editorToken?: string;
  editorExpiresAt?: string;
  /** Account center data (user, subscription, usage, workspace, account) */
  accountData?: AccountCenterData | null;
}

export function WorkspacePageContent({
  cards,
  initialCard,
  slug,
  editorToken,
  editorExpiresAt,
  accountData,
}: WorkspacePageContentProps) {
  const setCards = useCardEditorStore((s) => s.setAvailableCards);
  const resetStore = useCardEditorStore((s) => s.reset);
  const preparedCards = useCardEditorStore((s) => s.availableCards);

  console.log("[TRACE:WorkspacePageContent] RENDER — accountData:", accountData);
  console.log("[TRACE:WorkspacePageContent] RENDER — slug:", slug);
  console.log("[TRACE:WorkspacePageContent] RENDER — cards.length:", cards.length);
  console.log("[TRACE:WorkspacePageContent] RENDER — accountData type:", typeof accountData, ", is null?", accountData === null, ", is undefined?", accountData === undefined);
  console.log("[TRACE:WorkspacePageContent] RENDER — accountData JSON:", JSON.stringify(accountData));

  // When entering a different route state (picker or editor), reset the
  // editor-only Zustand state synchronously BEFORE paint.  This must run
  // for EVERY transition — including editor→editor card switches — because
  // the Zustand store is a global singleton.  Without resetStore(), the
  // store's isHydrated flag from the previous card blocks CardEditorProvider
  // from hydrating the new card's data (see the isHydrated guard in
  // card-editor-provider.tsx:64).
  //
  // useLayoutEffect blocks browser paint until the re-render completes,
  // so the user never sees stale toolbar / inspector / keyboard listeners.
  useLayoutEffect(() => {
    const current = useCardEditorStore.getState();
    if (slug && current.slug === slug && current.isHydrated) {
      setCards(cards);
      return;
    }
    resetStore();
    setCards(cards);
  }, [cards, resetStore, setCards, slug]);

  if (preparedCards !== cards) return null;

  // ── No cards ──────────────────────────────────────────────────────
  if (cards.length === 0) {
    return (
      <AccountDataProvider data={accountData ?? null}>
        <EmptyWorkspace />
      </AccountDataProvider>
    );
  }

  // ── Multiple cards, no slug selected yet ──────────────────────────
  if (!slug) {
    return (
      <AccountDataProvider data={accountData ?? null}>
        <WorkspaceCardSelector cards={cards} />
      </AccountDataProvider>
    );
  }

  // ── Card selected — full editor ───────────────────────────────────
  return (
    <AccountDataProvider data={accountData ?? null}>
      <CardEditorProvider
        initialCard={initialCard}
        slug={slug}
        editorToken={editorToken}
        editorExpiresAt={editorExpiresAt}
      >
        <PreviewSync />
      </CardEditorProvider>
    </AccountDataProvider>
  );
}
