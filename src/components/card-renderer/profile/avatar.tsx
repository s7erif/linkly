"use client";

import { useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/use-theme";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<AvatarSize, string> = {
  sm: "w-[72px] h-[72px]",
  md: "w-[96px] h-[96px]",
  lg: "w-[120px] h-[120px] sm:w-[132px] sm:h-[132px] lg:w-[144px] lg:h-[144px]",
  xl: "w-[164px] h-[164px]",
};

export interface ProfileAvatarProps {
  src?: string | null;
  fallback: string;
  size?: AvatarSize;
  selected?: boolean;
  className?: string;
}

/**
 * ProfileAvatar — Premium Identity Focal Point featuring:
 * - Responsive sizing (112px to 132px)
 * - Token-driven radial glow and layered shadow
 * - Token-driven radial glow and layered shadow
 * - Crossfade blur-out transition on image load
 * - Tasteful silhouette placeholder for empty state
 */
export function ProfileAvatar({
  src,
  fallback,
  size = "lg",
  selected = false,
  className,
}: ProfileAvatarProps) {
  const theme = useTheme();
  const [error, setError] = useState(false);
  const showFallback = !src || error;
  const reduced = useReducedMotion();

  return (
    <div className={cn("relative mx-auto shrink-0 group select-none", sizeMap[size], className)}>
      {/* 1. Token-Driven Subtle Radial Glow (Max 5% Visual Intensity) */}
      <div
        className="absolute -inset-6 rounded-full blur-2xl pointer-events-none opacity-30 transition-opacity duration-500 group-hover:opacity-50"
        style={{
          background: `radial-gradient(circle, ${theme.colors.primary}40 0%, transparent 60%)`,
        }}
      />

      {/* 2. Avatar Container */}
      <m.div
        className={cn(
          "relative w-full h-full transition-shadow duration-300",
          selected
            ? "ring-2 shadow-xl"
            : "shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]",
        )}
        style={{
          borderRadius: theme.shape.avatarRadius,
          ...(selected ? { ringColor: theme.colors.primary } : {}),
        }}
        initial={reduced ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* 3. Pure Image Frame with Sub-pixel Border */}
        <div
          className="w-full h-full overflow-hidden relative ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-slate-950"
          style={{ borderRadius: theme.shape.avatarRadius }}
        >
          {/* 4. Crossfade & Blur Image Transition */}
          <m.div
            key={src ?? "empty"}
            initial={{ opacity: 0, filter: "blur(4px)", scale: 0.96 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full"
          >
            {!showFallback ? (
              <img
                src={src!}
                alt={`Profile photo of ${fallback}`}
                fetchPriority="high"
                loading="eager"
                className="w-full h-full object-cover transition-transform duration-700"
                onError={() => setError(true)}
              />
            ) : (
              /* Modern Minimal Empty State Placeholder */
              <div
                className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/40"
              >
                {/* Small Elegant User Glyph */}
                <svg
                  aria-hidden="true"
                  className="w-[28%] h-[28%] text-slate-400/80 dark:text-slate-500/80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </m.div>
        </div>
      </m.div>
    </div>
  );
}
