"use client";

import { m, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/use-theme";
import { cn } from "@/lib/utils";

export interface ProfileBioProps {
  text: string;
  className?: string;
}

export function ProfileBio({ text, className }: ProfileBioProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  return (
    <m.div
      className={cn("text-center px-4", className)}
      initial={reduced ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
    >
      <p
        className={cn(
          "leading-[1.7] lg:leading-[var(--bio-line-height,1.7)] max-w-[340px] lg:max-w-[var(--bio-max-width,340px)] mx-auto font-normal text-[14px] sm:text-[15px] lg:text-[var(--bio-font-size,15px)] line-clamp-3 md:line-clamp-4 lg:line-clamp-none opacity-85"
        )}
        style={{
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.text,
        }}
      >
        {text}
      </p>
    </m.div>
  );
}
