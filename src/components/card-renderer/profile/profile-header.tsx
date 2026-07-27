"use client";

import { m, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/use-theme";
import { cn } from "@/lib/utils";

export interface ProfileHeaderProps {
  fullName: string;
  headline?: string | null;
  company?: string | null;
  address?: string | null;
  className?: string;
}

export function ProfileHeader({ fullName, headline, company, address, className }: ProfileHeaderProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  // 1. Graceful degradation: Combine headline and company, separated by a bullet.
  const roleParts = [headline, company].filter(
    (part) => typeof part === "string" && part.trim().length > 0
  );
  const roleText = roleParts.join(" • ");

  return (
    <m.div
      className={cn("flex flex-col items-center text-center", className)}
      initial={reduced ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
    >
      {/* 2. Display Name: Strongest visual element */}
      <h1
        className="text-[26px] sm:text-[28px] md:text-[30px] font-bold tracking-tight leading-tight"
        style={{
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.text,
        }}
      >
        {fullName}
      </h1>

      {/* 3. Role & Company: Supporting information */}
      {roleText && (
        <span
          className="mt-2 md:mt-2.5 text-[10px] sm:text-[11px] md:text-[12px] font-semibold uppercase tracking-wider opacity-60"
          style={{
            fontFamily: theme.typography.fontFamily,
            color: theme.colors.text,
          }}
        >
          {roleText}
        </span>
      )}

      {/* 4. Location: Muted, Centered with minimal icon */}
      {address && (
        <div
          className="flex items-center justify-center gap-1.5 mt-2 opacity-70"
          style={{ color: theme.colors.mutedText }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span
            className="text-xs font-medium tracking-wide"
            style={{ fontFamily: theme.typography.fontFamily }}
          >
            {address}
          </span>
        </div>
      )}
    </m.div>
  );
}
