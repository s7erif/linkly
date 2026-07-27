"use client";

import { m, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/use-theme";
import { cn } from "@/lib/utils";

export interface FooterActionsProps {
  branding?: string;
  className?: string;
}

export function FooterActions({ branding = "Built with Linkly", className }: FooterActionsProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  return (
    <m.div
      className={cn("flex flex-col items-center justify-center opacity-70 mt-6 md:mt-8 hover:opacity-100 transition-opacity", className)}
      initial={reduced ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="w-8 h-px opacity-40" style={{ background: theme.colors.outline }} />
      <p
        className="font-bold tracking-widest uppercase text-[9px] md:text-[10px]"
        style={{
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.mutedText,
          opacity: 0.4,
        }}
      >
        {branding}
      </p>
    </m.div>
  );
}
