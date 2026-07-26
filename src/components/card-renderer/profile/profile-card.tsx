"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/use-theme";
import { cn } from "@/lib/utils";

export interface ProfileCardProps {
  children: ReactNode;
  className?: string;
}

export function ProfileCard({ children, className }: ProfileCardProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn("flex flex-col items-center w-full overflow-hidden", className)}
      style={{
        background: theme.surface.background,
        borderRadius: theme.shape.radius,
        boxShadow: theme.shadow.card,
        fontFamily: theme.typography.fontFamily,
      }}
      initial={reduced ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col items-center w-full">
        {children}
      </div>
    </motion.div>
  );
}
