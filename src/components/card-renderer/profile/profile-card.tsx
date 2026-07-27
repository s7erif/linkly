"use client";

import { type ReactNode } from "react";
import { m, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/use-theme";
import { interaction } from "../design-system";
import { cn } from "@/lib/utils";

export interface ProfileCardProps {
  children: ReactNode;
  className?: string;
}

export function ProfileCard({ children, className }: ProfileCardProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  return (
    <m.div
      className={cn("flex flex-col items-center w-full overflow-hidden max-md:!rounded-none max-md:!shadow-none max-md:min-h-[100dvh]", className)}
      style={{
        background: theme.surface.background,
        borderRadius: theme.shape.radius,
        boxShadow: theme.shadow.card,
        fontFamily: theme.typography.fontFamily,
      }}
      initial={reduced ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={interaction.transitions.pageFade}
    >
      <div className="flex flex-col items-center w-full max-md:flex-1">
        {children}
      </div>
    </m.div>
  );
}
