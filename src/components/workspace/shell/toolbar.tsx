"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { cn } from "@/lib/utils";

export interface WorkspaceToolbarProps extends HTMLAttributes<HTMLElement> {
  cardName?: string;
  isLoading?: boolean;
  saving?: boolean;
  lastSaved?: string;
  onPublish?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const ZOOM_STOPS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export const WorkspaceToolbar = forwardRef<HTMLElement, WorkspaceToolbarProps>(
  (
    {
      cardName,
      isLoading = false,
      saving = false,
      lastSaved,
      onPublish,
      onUndo,
      onRedo,
      canUndo = false,
      canRedo = false,
      className,
      ...props
    },
    ref,
  ) => {
    const zoom = useWorkspaceStore((s) => s.zoom);
    const setZoom = useWorkspaceStore((s) => s.setZoom);

    const cycleZoom = () => {
      const currentIdx = ZOOM_STOPS.indexOf(zoom as typeof ZOOM_STOPS[number]);
      const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % ZOOM_STOPS.length : 2;
      setZoom(ZOOM_STOPS[nextIdx]);
    };

    // Derived states
    const isSaved = !saving && !!lastSaved;
    const isUnsaved = !saving && !lastSaved;

    return (
      <motion.header
        ref={ref}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "flex items-center gap-2 md:gap-4 px-2 py-2 h-[56px] rounded-[22px]",
          "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl",
          "border border-white/60 dark:border-white/10",
          "shadow-[0_4px_24px_-2px_rgba(0,0,0,0.04),0_0_1px_rgba(0,0,0,0.1)]",
          "transition-all duration-300",
          className,
        )}
        role="toolbar"
        aria-label="Workspace toolbar"
        {...props as any}
      >
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 pl-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUndo}
            disabled={isLoading || !canUndo}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRedo}
            disabled={isLoading || !canRedo}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
          </motion.button>
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* Zoom */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={cycleZoom}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 w-[4ch] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </motion.button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* Workspace Name */}
        <div className="flex items-center gap-2.5 px-2 max-w-[220px] shrink-0">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] ring-1 ring-indigo-500/20">
            W
          </div>
          <span className="text-[14px] font-semibold text-slate-900 dark:text-white truncate">
            {cardName || "Workspace"}
          </span>
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 shrink-0 hidden md:block" />

        {/* Status */}
        <div className="flex items-center justify-center min-w-[90px] shrink-0">
          <AnimatePresence mode="wait">
            {saving ? (
              <motion.div key="saving" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                <span className="text-[11px] font-bold text-slate-500 tracking-wide">Saving</span>
              </motion.div>
            ) : isSaved ? (
              <motion.div key="saved" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full ring-1 ring-emerald-500/20">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-[11px] font-bold text-emerald-600 tracking-wide">Saved</span>
              </motion.div>
            ) : (
              <motion.div key="unsaved" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[11px] font-bold text-amber-600 tracking-wide">Unsaved</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Publish */}
        <div className="pl-1 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPublish}
            disabled={saving || isLoading}
            className="relative flex items-center justify-center h-10 px-6 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_2px_12px_rgba(99,102,241,0.25)] overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <span className="text-[13px] font-bold tracking-wider uppercase">
              Publish
            </span>
          </motion.button>
        </div>
      </motion.header>
    );
  },
);

WorkspaceToolbar.displayName = "WorkspaceToolbar";
