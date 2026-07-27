"use client";

import { useEffect } from "react";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

/**
 * Global keyboard shortcuts for Workspace V2.
 *
 * Ctrl+S       → Save card
 * Ctrl+Z       → Undo
 * Ctrl+Shift+Z → Redo
 * Escape       → Close inspector
 */
export function useWorkspaceKeyboard() {
  const saveCard = useCardEditorStore((s) => s.saveCard);
  const undo = useCardEditorStore((s) => s.undo);
  const redo = useCardEditorStore((s) => s.redo);
  const canUndo = useCardEditorStore((s) => s.canUndo);
  const canRedo = useCardEditorStore((s) => s.canRedo);
  const toggleInspector = useWorkspaceStore((s) => s.toggleInspector);
  const collapsedInspector = useWorkspaceStore((s) => s.collapsedInspector);
  const mobileSidebarOpen = useWorkspaceStore((s) => s.mobileSidebarOpen);
  const mobileInspectorOpen = useWorkspaceStore((s) => s.mobileInspectorOpen);
  const setMobileSidebarOpen = useWorkspaceStore((s) => s.setMobileSidebarOpen);
  const setMobileInspectorOpen = useWorkspaceStore((s) => s.setMobileInspectorOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Ctrl+S / Cmd+S — Save
      if (mod && e.key === "s") {
        e.preventDefault();
        saveCard();
        return;
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z — Redo
      if (mod && e.shiftKey && e.key === "z") {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Ctrl+Z / Cmd+Z — Undo
      if (mod && e.key === "z") {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Escape — Close mobile overlays first, then desktop inspector
      if (e.key === "Escape") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        // Close mobile overlays first
        if (mobileSidebarOpen) { e.preventDefault(); setMobileSidebarOpen(false); return; }
        if (mobileInspectorOpen) { e.preventDefault(); setMobileInspectorOpen(false); return; }
        // Close desktop inspector
        if (!collapsedInspector) { e.preventDefault(); toggleInspector(); }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveCard, undo, redo, canUndo, canRedo, toggleInspector, collapsedInspector, mobileSidebarOpen, mobileInspectorOpen, setMobileSidebarOpen, setMobileInspectorOpen]);
}
