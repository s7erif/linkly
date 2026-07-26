// ═══════════════════════════════════════════════════════════════════════════
// AutoSaveEngine — standalone save lifecycle manager.
//
// Zero React dependencies.  Zero Workspace knowledge.  Could be extracted
// into its own npm package.  Takes a `save()` function and returns a
// controller object with the public API.
//
// State machine:
//
//   idle ──[dirty]──→ debouncing ──[timer]──→ saving ──[ok]──→ idle
//                          │                    │
//                          └──[more edits]──→ restart timer
//                                               │
//                          saving ──[fail]──→ retrying ──[ok]──→ idle
//                              │                 │
//                              └──[more edits]──→ queue (save after current)
//
// Public API:
//   engine.markDirty()     — call on every user edit
//   engine.flush()         — returns Promise that resolves when save completes
//   engine.isIdle()        — true when not saving / debouncing / retrying
//   engine.isSaving()      — true during active network request
//   engine.hasPending()    — true when dirty (not yet sent to server)
//   engine.destroy()       — cleanup timers and listeners
// ═══════════════════════════════════════════════════════════════════════════

export type SaveState = "idle" | "debouncing" | "saving" | "retrying" | "error";

export interface AutoSaveConfig {
  /** Async function that persists the current state. Returns true on success. */
  save: () => Promise<boolean>;
  /** Debounce delay in ms (default 600). */
  debounceMs?: number;
  /** Base retry delay in ms (default 1000, exponential backoff to 15000). */
  retryBaseMs?: number;
  /** Called when state changes — for UI binding. */
  onStateChange?: (state: SaveState, revision: number) => void;
  /** Called when a newer revision is saved by another tab. */
  onRemoteConflict?: (remoteRevision: number, localRevision: number) => void;
}

export interface AutoSaveEngine {
  markDirty: () => void;
  flush: () => Promise<void>;
  isIdle: () => boolean;
  isSaving: () => boolean;
  hasPending: () => boolean;
  getRevision: () => number;
  getState: () => SaveState;
  destroy: () => void;
}

const RETRY_MAX_MS = 15_000;

export function createAutoSave(config: AutoSaveConfig): AutoSaveEngine {
  const debounceMs = config.debounceMs ?? 600;
  const retryBaseMs = config.retryBaseMs ?? 1000;

  let state: SaveState = "idle";
  let revision = 0;
  let retryCount = 0;
  let pendingDirty = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let flushResolvers: Array<() => void> = [];

  // ── State helpers ──────────────────────────────────────────────────

  function setState(next: SaveState) {
    state = next;
    config.onStateChange?.(state, revision);
  }

  function clearTimers() {
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    if (retryTimer)   { clearTimeout(retryTimer);   retryTimer = null;   }
  }

  function resolveFlush() {
    const rs = flushResolvers;
    flushResolvers = [];
    for (const r of rs) r();
  }

  // ── Save execution ─────────────────────────────────────────────────

  async function executeSave() {
    revision++;
    const thisRev = revision;
    setState("saving");
    retryCount = 0;

    try {
      const ok = await config.save();
      if (!ok) throw new Error("Save returned false");

      // Only resolve flush / set idle if no newer revision started
      if (revision === thisRev) {
        if (pendingDirty) {
          // Edits arrived while we were saving — save again immediately
          pendingDirty = false;
          scheduleDebounce();
        } else {
          setState("idle");
          resolveFlush();
        }
      }
    } catch {
      if (revision === thisRev) {
        pendingDirty = false; // will be re-saved after retry succeeds
        setState("retrying");
        scheduleRetry();
      }
    }
  }

  function scheduleRetry() {
    const delay = Math.min(retryBaseMs * 2 ** retryCount, RETRY_MAX_MS);
    retryCount++;
    retryTimer = setTimeout(() => {
      if (state === "retrying" || state === "error") {
        executeSave();
      }
    }, delay);
  }

  function scheduleDebounce() {
    if (debounceTimer) clearTimeout(debounceTimer);
    setState("debouncing");
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (state === "debouncing") {
        executeSave();
      }
    }, debounceMs);
  }

  // ══════════════════════════════════════════════════════════════════
  // Public API
  // ══════════════════════════════════════════════════════════════════

  const engine: AutoSaveEngine = {
    markDirty() {
      if (state === "saving") {
        // Edits arrived during an active save — flag a follow-up save
        // that fires as soon as the current request completes.
        pendingDirty = true;
        return;
      }
      clearTimers();
      scheduleDebounce();
    },

    async flush(): Promise<void> {
      // If idle, nothing to do
      if (state === "idle") return;

      // If debouncing, fire immediately
      if (state === "debouncing") {
        clearTimers();
        await executeSave();
        return;
      }

      // If saving or retrying, wait for it to complete
      if (state === "saving" || state === "retrying") {
        return new Promise<void>((resolve) => {
          flushResolvers.push(resolve);
        });
      }

      // error state — retry immediately
      if (state === "error") {
        clearTimers();
        await executeSave();
      }
    },

    isIdle:       () => state === "idle",
    isSaving:     () => state === "saving",
    hasPending:   () => state !== "idle",
    getRevision:  () => revision,
    getState:     () => state,

    destroy() {
      clearTimers();
      resolveFlush();
    },
  };

  // ── DevTools ────────────────────────────────────────────────────────
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    (window as unknown as Record<string, unknown>).__AUTO_SAVE__ = {
      get state()      { return state; },
      get revision()   { return revision; },
      get retryCount() { return retryCount; },
      get hasDebounce(){ return debounceTimer !== null; },
      get queueLength(){ return flushResolvers.length; },
      get engine()     { return engine; },
    };
  }

  return engine;
}
