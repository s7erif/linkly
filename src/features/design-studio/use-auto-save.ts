"use client";

import { useCallback, useEffect, useState } from "react";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import {
  createAutoSave,
  type AutoSaveEngine,
  type SaveState,
} from "./auto-save-engine";

// ═══════════════════════════════════════════════════════════════════════════
// useAutoSave — React binding for the standalone AutoSaveEngine.
//
// Thin wrapper.  All logic lives in auto-save-engine.ts.
//
// Returns the engine's public API so callers can `await engine.flush()`.
// ═══════════════════════════════════════════════════════════════════════════

export function useAutoSave(): AutoSaveHandle {
  const saveState = useCardEditorStore((s) => s.saveState);
  const saveCard  = useCardEditorStore((s) => s.saveCard);
  const cardId    = useCardEditorStore((s) => s.cardId);
  const [remoteConflict, setRemoteConflict] = useState<{ remote: number; local: number } | null>(null);

  // ── Create engine (once, via useState lazy initializer) ─────────────

  const [engine] = useState<AutoSaveEngine>(() =>
    createAutoSave({
      save: async () => {
        await saveCard();
        const st = useCardEditorStore.getState();
        return st.saveState === "saved";
      },
      debounceMs: 600,
      onRemoteConflict: (remote, local) => {
        setRemoteConflict({ remote, local });
      },
    }),
  );

  // ── Watch Zustand dirty state → engine ─────────────────────────────

  useEffect(() => {
    if (saveState === "dirty") {
      engine.markDirty();
    }
  }, [saveState, engine]);

  // ── beforeunload — flush ALL pending changes via canonical saveCard ──
  //
  // Delegates to saveCard({ keepalive: true }) so every entity (profile,
  // appearance, buttons, social links) is persisted through the SAME
  // pipeline used by auto-save.  fetch() with keepalive: true survives
  // page unload and supports PUT/PATCH — unlike sendBeacon which is
  // POST-only and was silently rejected by the PUT endpoint.
  //
  // The saveCard keepalive path reads all dirty state directly from the
  // Zustand store (get()), so it always captures the latest values
  // regardless of debounce/engine state.

  useEffect(() => {
    const handleBeforeUnload = () => {
      const st = useCardEditorStore.getState();
      // Only persist when there is a card AND there are unsaved changes
      // (or a save is already in-flight — keepalive bypasses the saving
      // guard inside saveCard so the browser-cancelled requests are
      // replaced with keepalive ones).
      if (st.cardId && st.saveState !== "saved") {
        st.saveCard({ keepalive: true });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── Online → auto-sync ─────────────────────────────────────────────

  useEffect(() => {
    const handleOnline = () => {
      if (engine.hasPending()) engine.markDirty();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [engine]);

  // ── Cleanup ────────────────────────────────────────────────────────

  useEffect(() => {
    return () => { engine.destroy(); };
  }, [engine]);

  // ── Multi-tab detection ───────────────────────────────────────────

  useEffect(() => {
    if (!cardId || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(`card-edit:${cardId}`);

    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg?.type === "remote-save" && msg?.cardId === cardId && msg?.revision > engine.getRevision()) {
        setRemoteConflict({ remote: msg.revision, local: engine.getRevision() });
      }
    };
    channel.addEventListener("message", handleMessage);

    return () => channel.close();
  }, [cardId, engine]);

  // ── Public API ────────────────────────────────────────────────────

  const dismissConflict = useCallback(() => setRemoteConflict(null), []);

  return { engine, conflict: remoteConflict, dismissConflict };
}

/** Hook return type — engine + conflict state for UI binding. */
export interface AutoSaveHandle {
  engine: AutoSaveEngine;
  conflict: { remote: number; local: number } | null;
  dismissConflict: () => void;
}
