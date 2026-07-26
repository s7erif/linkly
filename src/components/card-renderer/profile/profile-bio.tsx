"use client";

import { motion, useReducedMotion } from "framer-motion";
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
    <motion.div
      className={cn("text-center px-4", className)}
      initial={reduced ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
    >
      <p
        className="leading-[1.6] max-w-[340px] mx-auto font-medium text-[13px] sm:text-[14px] line-clamp-2 opacity-90"
        style={{
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.text,
        }}
      >
        {text}
      </p>
    </motion.div>
  );
}
