"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════════════════════════
// AutoSaveConflictBanner — shown when another tab saved a newer revision.
//
// Renders a subtle amber banner below the toolbar with three actions:
//   Reload — refresh to get the latest version
//   Keep Editing — dismiss (continue with local changes)
// ═══════════════════════════════════════════════════════════════════════════

export interface ConflictBannerProps {
  visible: boolean;
  onReload: () => void;
  onDismiss: () => void;
}

export const AutoSaveConflictBanner = memo(function AutoSaveConflictBanner({
  visible,
  onReload,
  onDismiss,
}: ConflictBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs"
        >
          <span className="text-amber-800 font-medium">
            This card was updated in another tab.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReload}
              className="px-3 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-semibold hover:bg-amber-700 transition-colors"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="px-3 py-1 rounded-lg text-[10px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              Keep Editing
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
