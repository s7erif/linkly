"use client";

import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// AutoSaveIndicator — minimal, elegant status badge.
//
// ○ Saving…      (spinning)
// ✓ Saved        (fades out after 2s)
// ⚠ Couldn't save (persists until next successful save)
// ↻ Retrying…    (pulsing)
// ⬤ Offline      (persists until reconnect)
// ═══════════════════════════════════════════════════════════════════════════

export const AutoSaveIndicator = memo(function AutoSaveIndicator() {
  const saveState = useCardEditorStore((s) => s.saveState);
  const [visible, setVisible] = useState(false);
  const [offline, setOffline] = useState(false);

  // Track online/offline
  useEffect(() => {
    setOffline(!navigator.onLine);
    const a = () => setOffline(false);
    const b = () => setOffline(true);
    window.addEventListener("online", a);
    window.addEventListener("offline", b);
    return () => { window.removeEventListener("online", a); window.removeEventListener("offline", b); };
  }, []);

  // Fade out "Saved" after 2 seconds
  useEffect(() => {
    if (saveState === "saved") {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2200);
      return () => clearTimeout(t);
    }
    if (saveState === "dirty") {
      setVisible(true);
    }
    if (saveState === "saving" || saveState === "error") {
      setVisible(true);
    }
  }, [saveState]);

  if (!visible && !offline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 select-none"
      >
        {/* Offline indicator */}
        {offline && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Offline
          </span>
        )}

        {/* Saving */}
        {saveState === "saving" && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-workspace-text-muted">
            <motion.span
              className="w-3 h-3 rounded-full border-2 border-workspace-primary/30 border-t-workspace-primary"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
            Saving…
          </span>
        )}

        {/* Dirty (waiting to save) */}
        {saveState === "dirty" && !offline && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-workspace-text-muted/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Unsaved
          </span>
        )}

        {/* Saved — auto-fades out */}
        {saveState === "saved" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved
          </motion.span>
        )}

        {/* Error — persistent until next successful save */}
        {saveState === "error" && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {"Couldn't save"}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
});
