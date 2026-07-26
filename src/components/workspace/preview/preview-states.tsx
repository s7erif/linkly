"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// Shared transition config (respects reduced motion)
// ═══════════════════════════════════════════════════════════════════════════

function useFadeTransition(delay = 0) {
  const reduced = useReducedMotion();
  return reduced
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
      };
}

// ═══════════════════════════════════════════════════════════════════════════
// Empty Preview
// ═══════════════════════════════════════════════════════════════════════════

export function EmptyPreview() {
  const fade = useFadeTransition();

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full gap-4 text-center px-8"
      {...fade}
    >
      <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm border border-workspace-outline/30">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-workspace-primary">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-workspace-text-primary">
        Start Building Your Profile
      </h3>
      <p className="text-xs text-workspace-text-muted/60 max-w-[240px] leading-relaxed">
        Add your name, photo, and bio in the panel on the right to see your digital card come to life.
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Loading Preview
// ═══════════════════════════════════════════════════════════════════════════

export function LoadingPreview() {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      {/* Spinner */}
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-workspace-primary/20 border-t-workspace-primary"
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
      <p className="text-xs text-workspace-text-muted/80 font-medium">
        Loading your card…
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// Theme Loading Skeleton — mirrors the final card layout exactly.
// Circular avatar + name + badge + bio lines + 3 button rows.
// Subtle shimmer sweep across every element.  Premium, intentional.
// ═══════════════════════════════════════════════════════════════════════════

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}
      style={{ background: "rgba(109,93,246,0.06)" }}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(109,93,246,0.08) 40%, rgba(109,93,246,0.12) 50%, rgba(109,93,246,0.08) 60%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function ThemeLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center w-full pt-10 pb-8 px-6">
      {/* Avatar area */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="w-28 h-28 rounded-full relative overflow-hidden"
          style={{ background: "rgba(109,93,246,0.06)" }}>
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(109,93,246,0.08) 40%, rgba(109,93,246,0.12) 50%, rgba(109,93,246,0.08) 60%, transparent 100%)",
            }}
          />
        </div>
        <Shimmer className="w-36 h-5 rounded-full" />
        <Shimmer className="w-24 h-4 rounded-full" />
      </div>

      {/* Bio area */}
      <div className="w-full max-w-[220px] space-y-2 mb-8">
        <Shimmer className="h-3 w-full rounded-full" />
        <Shimmer className="h-3 w-5/6 rounded-full" />
        <Shimmer className="h-3 w-3/4 rounded-full" />
      </div>

      {/* Button area */}
      <div className="w-full space-y-3">
        <Shimmer className="h-12 rounded-2xl w-full" />
        <Shimmer className="h-12 rounded-2xl w-full" />
        <Shimmer className="h-12 rounded-2xl w-full" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Image / Avatar Placeholder
// ═══════════════════════════════════════════════════════════════════════════

export interface ImagePlaceholderProps {
  size?: "sm" | "lg";
}

export function ImagePlaceholder({ size = "lg" }: ImagePlaceholderProps) {
  const dims = size === "lg" ? "w-28 h-28" : "w-16 h-16";
  return (
    <div
      className={cn(
        dims,
        "rounded-full border-2 border-dashed border-workspace-outline/40 flex items-center justify-center bg-workspace-surface-dim",
      )}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        className="text-workspace-text-muted/30">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}
