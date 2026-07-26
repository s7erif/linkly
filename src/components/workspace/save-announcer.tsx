"use client";

import { useCardEditorStore } from "@/store/use-card-editor-store";

/**
 * Screen-reader announcer for save status.
 * Uses aria-live="polite" to announce save state changes without
 * interrupting the user's current task.
 */
export function SaveAnnouncer() {
  const saveState = useCardEditorStore((s) => s.saveState);
  const saveMessage = useCardEditorStore((s) => s.saveMessage);

  const announcement =
    saveState === "saving" ? "Saving your changes" :
    saveState === "saved" ? "All changes saved" :
    saveState === "error" ? `Unable to save. ${saveMessage || "Please check your connection and try again."}` :
    saveState === "dirty" ? "You have unsaved changes" :
    undefined;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
