"use client";

import { motion, useReducedMotion } from "framer-motion";
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
    <motion.div
      className={cn("flex flex-col items-center gap-3 mt-auto pt-2 pb-2", className)}
      initial={reduced ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="w-8 h-px opacity-40" style={{ background: theme.colors.outline }} />
      <p
        className="font-bold tracking-widest uppercase"
        style={{
          fontFamily: theme.typography.fontFamily,
          fontSize: "9px",
          color: theme.colors.mutedText,
          opacity: 0.5,
        }}
      >
        {branding}
      </p>
    </motion.div>
  );
}
