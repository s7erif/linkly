"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/use-theme";
import { getPlatformColor } from "./platform-resolver";
import type { PreviewButton } from "../types";

export interface ButtonRendererProps {
  button: PreviewButton;
  primary?: boolean;
}

export function ButtonRenderer({ button, primary = false }: ButtonRendererProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const accent = button.color ?? getPlatformColor(button.type ?? "CUSTOM");

  const style = useMemo(
    () => ({
      fontFamily: theme.typography.fontFamily,
      fontSize: "0.9375rem",
      borderRadius: theme.shape.buttonRadius,
    }),
    [theme],
  );

  if (primary) {
    return (
      <motion.a
        href={button.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full min-h-[50px] px-6 text-center font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-shadow"
        style={{
          ...style,
          background: accent,
          boxShadow: theme.shadow.button,
          outlineColor: accent,
        }}
        whileHover={reduced ? undefined : { scale: 1.015, y: -1 }}
        whileTap={reduced ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {button.label}
      </motion.a>
    );
  }

  return (
    <motion.a
      href={button.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-full min-h-[46px] px-6 text-center font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-shadow"
      style={{
        ...style,
        color: accent,
        background: "transparent",
        border: `1.5px solid ${accent}33`,
        outlineColor: accent,
      }}
      whileHover={reduced ? undefined : { scale: 1.015, backgroundColor: `${accent}0A` }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {button.label}
    </motion.a>
  );
}
