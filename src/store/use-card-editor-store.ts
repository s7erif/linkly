"use client";

import { create } from "zustand";
import type { CardBlockDTO, CardProfileDTO, WorkspaceCardDTO } from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import {
  resolveRendererSectionOrder,
  type PreviewData,
  type PreviewButton,
  type PreviewSocialLink,
} from "@/components/card-renderer";
import { getEditorSessionToken } from "@/features/appearance/workspace-session-client";
import { defaultAppearanceSettings } from "@/validation/appearance";

// ═══════════════════════════════════════════════════════════════════════════
// Card Editor Store — shared reactive state for inspector + preview
//
// Populated by CardEditorProvider (bridges useWorkspaceCard → store).
// Read by inspector editors (write) and preview renderer (subscribe).
//
// No API calls. No business logic. Pure UI state mirroring the card DTO.
// ═══════════════════════════════════════════════════════════════════════════

export interface EditorButton {
  id: string;
  type: string;
  label: string;
  url: string;
  position: number;
  isVisible: boolean;
  displayMode: string;
  color: string | null;
  openInNewTab: boolean;
  analyticsEnabled: boolean;
}

export interface EditorSocialLink {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  position: number;
  isVisible: boolean;
}

export interface CardEditorState {
  // ── Source data ───────────────────────────────────────────────────
  cardId: string | null;
  slug: string;
  editorToken: string | null;
  editorExpiresAt: string | null;
  isHydrated: boolean;

  // ── Editor state (mirrors WorkspaceCardDTO fields) ────────────────
  card: WorkspaceCardDTO | null;
  appearance: AppearanceSettings | null;
  profile: CardProfileDTO | null;
  /** Runtime-only media state — never serialized to profile/appearance APIs. */
  media: { avatarUrl: string | null };
  /** Which theme preset is the current appearance based on (null = custom/no theme). */
  baseThemeId: string | null;
  /** Section render order for the preview (persisted). */
  sectionOrder: readonly string[];

  // ── Buttons & social (editor versions — include isVisible) ────────
  editorButtons: EditorButton[];
  editorSocialLinks: EditorSocialLink[];
  /** IDs that existed at hydration time (i.e. exist in the database).
   *  Used by saveCard to decide POST (create) vs PATCH (update). */
  persistedButtonIds: Set<string>;
  persistedSocialLinkIds: Set<string>;
  /** IDs queued for deletion — items removed from the editor that
   *  already exist in the database.  Cleared on successful DELETE. */
  deletedButtonIds: Set<string>;
  deletedSocialLinkIds: Set<string>;
  /** Resources changed since hydration or their last successful save. */
  dirtyProfile: boolean;
  dirtyAppearance: boolean;
  dirtyButtonIds: Set<string>;
  dirtySocialLinkIds: Set<string>;

  // ── Save state ────────────────────────────────────────────────────
  saveState: "saved" | "dirty" | "saving" | "error";
  saveMessage: string;
  /** Monotonically increasing — older responses are rejected. */
  saveRevision: number;

  // ── Card list (for card selector) ──────────────────────────────────
  availableCards: ReadonlyArray<{ id: string; name: string; slug: string }>;

  // ── Undo / Redo ────────────────────────────────────────────────────
  undoStack: ReadonlyArray<UndoSnapshot>;
  redoStack: ReadonlyArray<UndoSnapshot>;
  canUndo: boolean;
  canRedo: boolean;
}

export interface CardEditorActions {
  // Hydration
  hydrate: (data: {
    card: WorkspaceCardDTO;
    appearance: AppearanceSettings;
    profile: CardProfileDTO;
    editorButtons: EditorButton[];
    editorSocialLinks: EditorSocialLink[];
    cardId: string;
    slug: string;
    editorToken: string | null;
    editorExpiresAt: string | null;
  }) => void;

  // Profile mutations (instant — preview updates immediately)
  setProfileField: <K extends keyof CardProfileDTO>(key: K, value: CardProfileDTO[K]) => void;
  setProfile: (profile: CardProfileDTO) => void;

  // Appearance mutations
  setAppearance: (appearance: AppearanceSettings) => void;
  patchAppearance: <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => void;
  /** Reset appearance to design-token defaults. */
  resetAppearance: () => void;
  /** Record which theme preset this appearance is based on. */
  setBaseTheme: (themeId: string | null) => void;
  /** Apply a theme preset ↔ set appearance + record baseThemeId. */
  applyTheme: (themeId: string, settings: AppearanceSettings) => void;
  /** Update section render order. */
  setSectionOrder: (order: readonly string[]) => void;
  /** Set the avatar URL (runtime-only, never sent to profile API). */
  setAvatarUrl: (url: string | null) => void;

  // Button mutations
  setEditorButtons: (buttons: EditorButton[]) => void;
  addButton: (button: EditorButton) => void;
  removeButton: (id: string) => void;
  updateButton: (id: string, patch: Partial<Pick<EditorButton, "label" | "url" | "isVisible" | "type" | "displayMode" | "color" | "openInNewTab" | "analyticsEnabled">>) => void;

  // Social link mutations
  setEditorSocialLinks: (links: EditorSocialLink[]) => void;
  addSocialLink: (link: EditorSocialLink) => void;
  removeSocialLink: (id: string) => void;
  updateSocialLink: (id: string, patch: Partial<Pick<EditorSocialLink, "platform" | "label" | "url" | "isVisible">>) => void;

  // Save state
  setSaveState: (state: CardEditorState["saveState"], message?: string) => void;

  // Card list
  setAvailableCards: (cards: ReadonlyArray<{ id: string; name: string; slug: string }>) => void;
  /** Apply a slug confirmed by the existing slug mutation route. */
  applySlug: (slug: string) => void;
  /** Refresh persisted card lifecycle fields without resetting editor state. */
  applyServerCard: (card: WorkspaceCardDTO) => void;

  // Undo / Redo
  pushUndo: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Save (reuses same API endpoints as useWorkspaceSave)
  saveCard: (opts?: { keepalive?: boolean }) => Promise<void>;
  /** Flush pending debounce, wait for any active save, then publish. */
  flushAndPublish: () => Promise<void>;

  // Reset
  reset: () => void;
}

export type CardEditorStore = CardEditorState & CardEditorActions;

// ── Undo snapshot ─────────────────────────────────────────────────────────

interface UndoSnapshot {
  profile: CardProfileDTO | null;
  appearance: AppearanceSettings | null;
  buttons: EditorButton[];
  socialLinks: EditorSocialLink[];
  sectionOrder: readonly string[];
  baseThemeId: string | null;
}

/**
 * Compare two snapshots for semantic equality.
 *
 * Both snapshots are constructed identically by pushUndo() (same field order,
 * same spread patterns), so JSON.stringify produces deterministic output with
 * no risk of key-order divergence.  No allocations beyond the two serialized
 * strings — called only on user mutations, never during render.
 */
function snapshotsEqual(a: UndoSnapshot, b: UndoSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── Helpers ──────────────────────────────────────────────────────────────

function visibleButtons(buttons: EditorButton[]): PreviewButton[] {
  return buttons.filter((b) => b.isVisible).map((b) => ({
    id: b.id, label: b.label, url: b.url,
    type: b.type, displayMode: b.displayMode, color: b.color,
  }));
}

function visibleSocial(links: EditorSocialLink[]): PreviewSocialLink[] {
  return links.filter((l) => l.isVisible).map((l) => ({
    id: l.id, platform: l.platform, label: l.label, url: l.url,
  }));
}

export function buildPreviewData(
  profile: CardProfileDTO | null,
  buttons: EditorButton[],
  social: EditorSocialLink[],
  blocks?: readonly CardBlockDTO[],
): PreviewData | null {
  if (!profile) return null;
  return {
    profile,
    buttons: visibleButtons(buttons),
    socialLinks: visibleSocial(social),
    ...(blocks ? { blocks } : {}),
  };
}

// ── Initial state ────────────────────────────────────────────────────────

const initialState: CardEditorState = {
  cardId: null,
  slug: "",
  editorToken: null,
  editorExpiresAt: null,
  isHydrated: false,
  card: null,
  appearance: null,
  profile: null,
  media: { avatarUrl: null },
  baseThemeId: null,
  sectionOrder: ["header", "bio", "buttons", "socialLinks", "footer"],
  editorButtons: [],
  editorSocialLinks: [],
  persistedButtonIds: new Set<string>(),
  persistedSocialLinkIds: new Set<string>(),
  deletedButtonIds: new Set<string>(),
  deletedSocialLinkIds: new Set<string>(),
  dirtyProfile: false,
  dirtyAppearance: false,
  dirtyButtonIds: new Set<string>(),
  dirtySocialLinkIds: new Set<string>(),
  saveState: "saved",
  saveMessage: "",
  saveRevision: 0,
  availableCards: [],
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,
};

// ── Store ────────────────────────────────────────────────────────────────

export const useCardEditorStore = create<CardEditorStore>((set, get) => ({
  ...initialState,

  hydrate: (data) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[hydrate] editorButtons IDs:", data.editorButtons.map((b) => b.id));
      console.log("[hydrate] editorButtons count:", data.editorButtons.length);
    }
    return set({
      ...data,
      isHydrated: true,
      sectionOrder: resolveRendererSectionOrder(data.card),
      persistedButtonIds: new Set(data.editorButtons.map((b) => b.id)),
      persistedSocialLinkIds: new Set(data.editorSocialLinks.map((l) => l.id)),
      deletedButtonIds: new Set<string>(),
      deletedSocialLinkIds: new Set<string>(),
      dirtyProfile: false,
      dirtyAppearance: false,
      dirtyButtonIds: new Set<string>(),
      dirtySocialLinkIds: new Set<string>(),
      media: {
        // Canonical source: DB via EditorCardDTO.avatarUrl (populated from CardMedia).
        // Falls back to sessionStorage cache (upload may have preceded the DB write).
        avatarUrl: (data.card as WorkspaceCardDTO & { avatarUrl?: string | null }).avatarUrl
          ?? (typeof window !== "undefined"
            ? (() => { try { return sessionStorage.getItem(`avatar:${data.cardId}`) || null; } catch { return null; } })()
            : null),
      },
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
    });
  },

  setAvailableCards: (cards) => set({ availableCards: cards }),
  applySlug: (slug) =>
    set((state) => ({
      slug,
      card: state.card ? { ...state.card, slug } : state.card,
      availableCards: state.availableCards.map((card) =>
        card.id === state.cardId ? { ...card, slug } : card,
      ),
    })),
  applyServerCard: (card) =>
    set((state) => ({
      card,
      slug: card.slug,
      availableCards: state.availableCards.map((item) =>
        item.id === card.id ? { ...item, name: card.name, slug: card.slug } : item,
      ),
    })),

  // ── Undo / Redo ────────────────────────────────────────────────────
  pushUndo: () => {
    const s = get();
    const snapshot: UndoSnapshot = {
      profile: s.profile ? { ...s.profile } : null,
      appearance: s.appearance ? { ...s.appearance, colors: { ...s.appearance.colors }, background: { ...s.appearance.background }, sections: { ...s.appearance.sections }, layout: { ...s.appearance.layout } } : null,
      buttons: s.editorButtons.map((b) => ({ ...b })),
      socialLinks: s.editorSocialLinks.map((l) => ({ ...l })),
      sectionOrder: [...s.sectionOrder],
      baseThemeId: s.baseThemeId,
    };
    // Skip if identical to the most recent snapshot — prevents
    // duplicate entries from no-op mutations (e.g. typing "a" then
    // Backspace, applying the same theme twice, toggling visibility
    // back to its previous value).
    if (s.undoStack.length > 0 && snapshotsEqual(s.undoStack[s.undoStack.length - 1], snapshot)) {
      return;
    }
    const stack = [...s.undoStack, snapshot].slice(-50); // max 50
    set({ undoStack: stack, redoStack: [], canUndo: true, canRedo: false });
  },

  undo: () => {
    const s = get();
    if (s.undoStack.length === 0) return;
    console.log("[undo] restoring editorButtons from snapshot:", s.undoStack[s.undoStack.length - 1].buttons.length, "buttons");
    const prev = s.undoStack[s.undoStack.length - 1];
    const current: UndoSnapshot = {
      profile: s.profile ? { ...s.profile } : null,
      appearance: s.appearance ? { ...s.appearance, colors: { ...s.appearance.colors }, background: { ...s.appearance.background }, sections: { ...s.appearance.sections }, layout: { ...s.appearance.layout } } : null,
      buttons: s.editorButtons.map((b) => ({ ...b })),
      socialLinks: s.editorSocialLinks.map((l) => ({ ...l })),
      sectionOrder: [...s.sectionOrder],
      baseThemeId: s.baseThemeId,
    };
    const redoStack = [...s.redoStack, current];
    const undoStack = s.undoStack.slice(0, -1);
    // Remove restored IDs from deletion queues so they are not
    // DELETEed on the next save.
    const restoredButtonIds = new Set(prev.buttons.map((b) => b.id));
    const restoredSocialIds = new Set(prev.socialLinks.map((l) => l.id));
    set({
      profile: prev.profile,
      appearance: prev.appearance,
      editorButtons: prev.buttons,
      editorSocialLinks: prev.socialLinks,
      sectionOrder: prev.sectionOrder,
      baseThemeId: prev.baseThemeId,
      undoStack,
      redoStack,
      canUndo: undoStack.length > 0,
      canRedo: true,
      saveState: "dirty",
      dirtyProfile: true,
      dirtyAppearance: true,
      dirtyButtonIds: new Set(prev.buttons.map((button) => button.id)),
      dirtySocialLinkIds: new Set(prev.socialLinks.map((link) => link.id)),
      deletedButtonIds: new Set([...s.deletedButtonIds].filter((id) => !restoredButtonIds.has(id))),
      deletedSocialLinkIds: new Set([...s.deletedSocialLinkIds].filter((id) => !restoredSocialIds.has(id))),
    });
  },

  redo: () => {
    const s = get();
    if (s.redoStack.length === 0) return;
    const next = s.redoStack[s.redoStack.length - 1];
    const current: UndoSnapshot = {
      profile: s.profile ? { ...s.profile } : null,
      appearance: s.appearance ? { ...s.appearance, colors: { ...s.appearance.colors }, background: { ...s.appearance.background }, sections: { ...s.appearance.sections }, layout: { ...s.appearance.layout } } : null,
      buttons: s.editorButtons.map((b) => ({ ...b })),
      socialLinks: s.editorSocialLinks.map((l) => ({ ...l })),
      sectionOrder: [...s.sectionOrder],
      baseThemeId: s.baseThemeId,
    };
    const undoStack = [...s.undoStack, current];
    const redoStack = s.redoStack.slice(0, -1);
    const restoredButtonIds = new Set(next.buttons.map((b) => b.id));
    const restoredSocialIds = new Set(next.socialLinks.map((l) => l.id));
    set({
      profile: next.profile,
      appearance: next.appearance,
      editorButtons: next.buttons,
      editorSocialLinks: next.socialLinks,
      sectionOrder: next.sectionOrder,
      baseThemeId: next.baseThemeId,
      undoStack,
      redoStack,
      canUndo: true,
      canRedo: redoStack.length > 0,
      saveState: "dirty",
      dirtyProfile: true,
      dirtyAppearance: true,
      dirtyButtonIds: new Set(next.buttons.map((button) => button.id)),
      dirtySocialLinkIds: new Set(next.socialLinks.map((link) => link.id)),
      deletedButtonIds: new Set([...s.deletedButtonIds].filter((id) => !restoredButtonIds.has(id))),
      deletedSocialLinkIds: new Set([...s.deletedSocialLinkIds].filter((id) => !restoredSocialIds.has(id))),
    });
  },

  clearHistory: () => set({ undoStack: [], redoStack: [], canUndo: false, canRedo: false }),

  // ── Profile ────────────────────────────────────────────────────────
  setProfileField: (key, value) => {
    const state = get();
    if (!state.profile) return;
    get().pushUndo();
    set({
      profile: { ...state.profile, [key]: value },
      dirtyProfile: true,
      saveState: "dirty",
    });
  },

  setProfile: (profile) => {
    get().pushUndo();
    set({ profile, dirtyProfile: true, saveState: "dirty" });
  },

  // ── Appearance ─────────────────────────────────────────────────────
  setAppearance: (appearance) => {
    get().pushUndo();
    set({ appearance, dirtyAppearance: true, saveState: "dirty" });
  },

  patchAppearance: (key, value) => {
    const state = get();
    if (!state.appearance) return;
    get().pushUndo();
    set({
      appearance: { ...state.appearance, [key]: value },
      dirtyAppearance: true,
      saveState: "dirty",
    });
  },

  resetAppearance: () => {
    get().pushUndo();
    set({ appearance: defaultAppearanceSettings, baseThemeId: null, dirtyAppearance: true, saveState: "dirty" });
  },

  setBaseTheme: (themeId) => {
    get().pushUndo();
    set({ baseThemeId: themeId });
  },

  applyTheme: (themeId, themeSettings) => {
    const prev = get().appearance;
    get().pushUndo();
    set({
      baseThemeId: themeId,
      appearance: {
        ...themeSettings,
        avatarBorderRadius: prev?.avatarBorderRadius ?? themeSettings.avatarBorderRadius ?? null,
      },
      dirtyAppearance: true,
      saveState: "dirty",
    });
  },

  setSectionOrder: (order) => {
    get().pushUndo();
    set({ sectionOrder: [...order], saveState: "dirty" });
  },

  setAvatarUrl: (url) => {
    get().pushUndo();
    const cardId = get().cardId;
    if (cardId && typeof window !== "undefined") {
      try { sessionStorage.setItem(`avatar:${cardId}`, url ?? ""); } catch { /* ignore */ }
    }
    set((s) => ({ media: { ...s.media, avatarUrl: url } }));
  },

  // ── Buttons ────────────────────────────────────────────────────────
  setEditorButtons: (editorButtons) => {
    console.log("[setEditorButtons] count:", editorButtons.length, "IDs:", editorButtons.map((b) => b.id));
    get().pushUndo();
    set({
      editorButtons,
      dirtyButtonIds: new Set(editorButtons.map((button) => button.id)),
      saveState: "dirty",
    });
  },

  addButton: (button) => {
    console.log("[addButton]", button.id, button.label, "stack:", new Error().stack?.split("\n").slice(1, 5).join(" → "));
    get().pushUndo();
    set((s) => ({
      editorButtons: [...s.editorButtons, button],
      dirtyButtonIds: new Set([...s.dirtyButtonIds, button.id]),
      saveState: "dirty",
    }));
  },

  removeButton: (id) => {
    get().pushUndo();
    set((s) => {
      const wasPersisted = s.persistedButtonIds.has(id);
      return {
        editorButtons: s.editorButtons.filter((b) => b.id !== id),
        deletedButtonIds: wasPersisted
          ? new Set([...s.deletedButtonIds, id])
          : s.deletedButtonIds,
        dirtyButtonIds: new Set([...s.dirtyButtonIds].filter((value) => value !== id)),
        saveState: "dirty",
      };
    });
  },

  updateButton: (id, patch) => {
    get().pushUndo();
    set((s) => ({
      editorButtons: s.editorButtons.map((b) =>
        b.id === id ? { ...b, ...patch } : b,
      ),
      dirtyButtonIds: new Set([...s.dirtyButtonIds, id]),
      saveState: "dirty",
    }));
  },

  // ── Social Links ───────────────────────────────────────────────────
  setEditorSocialLinks: (editorSocialLinks) => {
    get().pushUndo();
    set({
      editorSocialLinks,
      dirtySocialLinkIds: new Set(editorSocialLinks.map((link) => link.id)),
      saveState: "dirty",
    });
  },

  addSocialLink: (link) => {
    get().pushUndo();
    set((s) => ({
      editorSocialLinks: [...s.editorSocialLinks, link],
      dirtySocialLinkIds: new Set([...s.dirtySocialLinkIds, link.id]),
      saveState: "dirty",
    }));
  },

  removeSocialLink: (id) => {
    get().pushUndo();
    set((s) => {
      const wasPersisted = s.persistedSocialLinkIds.has(id);
      return {
        editorSocialLinks: s.editorSocialLinks.filter((l) => l.id !== id),
        deletedSocialLinkIds: wasPersisted
          ? new Set([...s.deletedSocialLinkIds, id])
          : s.deletedSocialLinkIds,
        dirtySocialLinkIds: new Set([...s.dirtySocialLinkIds].filter((value) => value !== id)),
        saveState: "dirty",
      };
    });
  },

  updateSocialLink: (id, patch) => {
    get().pushUndo();
    set((s) => ({
      editorSocialLinks: s.editorSocialLinks.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
      dirtySocialLinkIds: new Set([...s.dirtySocialLinkIds, id]),
      saveState: "dirty",
    }));
  },

  // ── Save state ─────────────────────────────────────────────────────
  setSaveState: (saveState, saveMessage = "") => set({ saveState, saveMessage }),

  // ── Save Card ──────────────────────────────────────────────────────
  // Reuses the SAME API endpoints and session-token pattern as the
  // existing useWorkspaceSave. No new save mechanism — same PUT/PATCH
  // routes, same payload format, same error handling.
  //
  // Accepts optional { keepalive: true } for beforeunload scenarios.
  // When keepalive is set, each fetch() uses the keepalive flag so
  // requests survive page unload (replaces the unreliable sendBeacon).
  saveCard: async (opts) => {
    const state = get();
    if (!state.cardId) return;

    const keepalive = opts?.keepalive === true;
    if (!keepalive && state.saveState === "saving") return;

    const revision = state.saveRevision + 1;
    set({ saveState: "saving", saveMessage: "", saveRevision: revision });

    const sessionToken = getEditorSessionToken(state.cardId) ?? "0".repeat(64);
    const headers = { "content-type": "application/json" };
    const startTime = performance.now();
    type SaveResult = {
      ok: boolean;
      label: string;
      kind: "profile" | "appearance" | "button" | "social";
      id?: string;
      created?: boolean;
    };
    const errors: string[] = [];
    const deletedButtons = new Set<string>();
    const deletedSocialLinks = new Set<string>();

    const deleteRequests: Promise<SaveResult>[] = [];
    for (const id of state.deletedButtonIds) {
      deleteRequests.push(
        fetch(`/cards/${state.cardId}/buttons/${id}?save=true`, {
          method: "DELETE",
          headers,
          keepalive,
          body: JSON.stringify({ sessionToken }),
        })
          .then((response) => ({
            ok: response.ok,
            label: `Delete button ${id}`,
            kind: "button" as const,
            id,
          }))
          .catch(() => ({
            ok: false,
            label: `Delete button ${id}`,
            kind: "button" as const,
            id,
          })),
      );
    }
    for (const id of state.deletedSocialLinkIds) {
      deleteRequests.push(
        fetch(`/cards/${state.cardId}/social-links/${id}?save=true`, {
          method: "DELETE",
          headers,
          keepalive,
          body: JSON.stringify({ sessionToken }),
        })
          .then((response) => ({
            ok: response.ok,
            label: `Delete social link ${id}`,
            kind: "social" as const,
            id,
          }))
          .catch(() => ({
            ok: false,
            label: `Delete social link ${id}`,
            kind: "social" as const,
            id,
          })),
      );
    }
    for (const result of await Promise.all(deleteRequests)) {
      if (!result.ok) errors.push(`${result.label} failed`);
      else if (result.kind === "button" && result.id) deletedButtons.add(result.id);
      else if (result.kind === "social" && result.id) deletedSocialLinks.add(result.id);
    }

    const requests: Promise<SaveResult>[] = [];
    if (state.profile && state.dirtyProfile) {
      requests.push(
        fetch(`/cards/${state.cardId}/profile?save=true`, {
          method: "PUT",
          headers,
          keepalive,
          body: JSON.stringify({ sessionToken, profile: state.profile }),
        })
          .then((response) => ({ ok: response.ok, label: "Profile", kind: "profile" as const }))
          .catch(() => ({ ok: false, label: "Profile", kind: "profile" as const })),
      );
    }
    if (state.appearance && state.dirtyAppearance) {
      requests.push(
        fetch(`/cards/${state.cardId}/appearance?save=true`, {
          method: "PUT",
          headers,
          keepalive,
          body: JSON.stringify({ sessionToken, appearance: state.appearance }),
        })
          .then((response) => ({ ok: response.ok, label: "Appearance", kind: "appearance" as const }))
          .catch(() => ({ ok: false, label: "Appearance", kind: "appearance" as const })),
      );
    }
    for (const button of state.editorButtons) {
      const created = !state.persistedButtonIds.has(button.id);
      if (!created && !state.dirtyButtonIds.has(button.id)) continue;
      const label = `Button "${button.label}"`;
      const path = created
        ? `/cards/${state.cardId}/buttons?save=true`
        : `/cards/${state.cardId}/buttons/${button.id}?save=true`;
      requests.push(
        fetch(path, {
          method: created ? "POST" : "PATCH",
          headers,
          keepalive,
          body: JSON.stringify({
            ...(created ? { id: button.id } : {}),
            sessionToken,
            label: button.label,
            url: button.url,
            type: button.type,
            displayMode: button.displayMode,
            color: button.color,
            isVisible: button.isVisible,
            openInNewTab: button.openInNewTab,
            analyticsEnabled: button.analyticsEnabled,
          }),
        })
          .then((response) => ({ ok: response.ok, label, kind: "button" as const, id: button.id, created }))
          .catch(() => ({ ok: false, label, kind: "button" as const, id: button.id, created })),
      );
    }
    for (const link of state.editorSocialLinks) {
      const created = !state.persistedSocialLinkIds.has(link.id);
      if (!created && !state.dirtySocialLinkIds.has(link.id)) continue;
      const label = `Social link "${link.platform}"`;
      const path = created
        ? `/cards/${state.cardId}/social-links?save=true`
        : `/cards/${state.cardId}/social-links/${link.id}?save=true`;
      requests.push(
        fetch(path, {
          method: created ? "POST" : "PATCH",
          headers,
          keepalive,
          body: JSON.stringify({
            ...(created ? { id: link.id } : {}),
            sessionToken,
            platform: link.platform,
            label: link.label,
            url: link.url,
            isVisible: link.isVisible,
          }),
        })
          .then((response) => ({ ok: response.ok, label, kind: "social" as const, id: link.id, created }))
          .catch(() => ({ ok: false, label, kind: "social" as const, id: link.id, created })),
      );
    }

    const results = await Promise.all(requests);
    for (const result of results) if (!result.ok) errors.push(`${result.label} save failed`);

    if (!keepalive) {
      set((latest) => {
        const dirtyButtonIds = new Set(latest.dirtyButtonIds);
        const dirtySocialLinkIds = new Set(latest.dirtySocialLinkIds);
        const persistedButtonIds = new Set(latest.persistedButtonIds);
        const persistedSocialLinkIds = new Set(latest.persistedSocialLinkIds);
        const deletedButtonIds = new Set(latest.deletedButtonIds);
        const deletedSocialLinkIds = new Set(latest.deletedSocialLinkIds);
        for (const id of deletedButtons) {
          deletedButtonIds.delete(id);
          dirtyButtonIds.delete(id);
          persistedButtonIds.delete(id);
        }
        for (const id of deletedSocialLinks) {
          deletedSocialLinkIds.delete(id);
          dirtySocialLinkIds.delete(id);
          persistedSocialLinkIds.delete(id);
        }
        let dirtyProfile = latest.dirtyProfile;
        let dirtyAppearance = latest.dirtyAppearance;
        for (const result of results) {
          if (!result.ok) continue;
          if (result.kind === "profile" && latest.profile === state.profile) dirtyProfile = false;
          if (result.kind === "appearance" && latest.appearance === state.appearance) dirtyAppearance = false;
          if (result.kind === "button" && result.id) {
            if (result.created) persistedButtonIds.add(result.id);
            const submitted = state.editorButtons.find((button) => button.id === result.id);
            const current = latest.editorButtons.find((button) => button.id === result.id);
            if (submitted && current === submitted) dirtyButtonIds.delete(result.id);
          }
          if (result.kind === "social" && result.id) {
            if (result.created) persistedSocialLinkIds.add(result.id);
            const submitted = state.editorSocialLinks.find((link) => link.id === result.id);
            const current = latest.editorSocialLinks.find((link) => link.id === result.id);
            if (submitted && current === submitted) dirtySocialLinkIds.delete(result.id);
          }
        }
        const hasPendingChanges =
          dirtyProfile ||
          dirtyAppearance ||
          dirtyButtonIds.size > 0 ||
          dirtySocialLinkIds.size > 0 ||
          deletedButtonIds.size > 0 ||
          deletedSocialLinkIds.size > 0;
        const isCurrentRevision = latest.saveRevision === revision;
        return {
          dirtyProfile,
          dirtyAppearance,
          dirtyButtonIds,
          dirtySocialLinkIds,
          persistedButtonIds,
          persistedSocialLinkIds,
          deletedButtonIds,
          deletedSocialLinkIds,
          ...(isCurrentRevision
            ? errors.length > 0
              ? { saveState: "error" as const, saveMessage: errors.join("; ") }
              : hasPendingChanges
                ? { saveState: "dirty" as const, saveMessage: "" }
                : {
                    saveState: "saved" as const,
                    saveMessage: "",
                    undoStack: [],
                    redoStack: [],
                    canUndo: false,
                    canRedo: false,
                  }
            : {}),
        };
      });
    }

    if (process.env.NODE_ENV === "development") {
      const elapsed = Math.round(performance.now() - startTime);
      console.log(
        `[auto-save] rev=${revision} sent=${deleteRequests.length + requests.length} saved in ${elapsed}ms${errors.length ? ` (${errors.length} errors)` : ""}${keepalive ? " [keepalive]" : ""}`,
      );
    }
  },

  // ── Flush + Publish ───────────────────────────────────────────────
  flushAndPublish: async () => {
    const state = get();
    // If dirty, save immediately (skip debounce)
    if (state.saveState === "dirty") {
      await get().saveCard();
    }
    // If saving, wait for it to finish (poll with short backoff)
    let retries = 0;
    while (get().saveState === "saving" && retries < 30) {
      await new Promise((r) => setTimeout(r, 100));
      retries++;
    }
    // If still dirty after the wait, one last save
    if (get().saveState === "dirty") {
      await get().saveCard();
    }
  },

  // ── Reset ──────────────────────────────────────────────────────────
  reset: () => set({
    ...initialState,
    persistedButtonIds: new Set<string>(),
    persistedSocialLinkIds: new Set<string>(),
    deletedButtonIds: new Set<string>(),
    deletedSocialLinkIds: new Set<string>(),
    dirtyButtonIds: new Set<string>(),
    dirtySocialLinkIds: new Set<string>(),
  }),
}));

// ── Mutation tracer: catches EVERY change to editorButtons ────────────
// Runs after every state update. Logs when editorButtons reference or
// content changes — including direct set() calls that bypass named actions.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  let prev = useCardEditorStore.getState().editorButtons;
  useCardEditorStore.subscribe((state) => {
    const next = state.editorButtons;
    if (next !== prev) {
      const prevIds = prev.map((b) => b.id);
      const nextIds = next.map((b) => b.id);
      const sameRef = next === prev;
      console.log(
        `[TRACE editorButtons] ${prevIds.length}→${nextIds.length} refChanged=${!sameRef}`,
        "\n  prev:", prevIds,
        "\n  next:", nextIds,
        "\n  stack:", new Error().stack?.split("\n").slice(2, 7).join("\n  "),
      );
      prev = next;
    }
  });
}
