"use client";

import { useMemo } from "react";
import { m, useReducedMotion } from "framer-motion";
import { getPlatformColor } from "./platform-resolver";
import { getPlatformIcon } from "@/features/links/platform-icons";
import { interaction } from "../design-system";
import type { PreviewButton } from "../types";

export interface IconRendererProps {
  button: PreviewButton;
  size?: number;
}

export function IconRenderer({ button, size = 48 }: IconRendererProps) {
  const reduced = useReducedMotion();
  const accent = button.color ?? getPlatformColor(button.type ?? "CUSTOM");
  const type = button.type ?? "CUSTOM";

  const style = useMemo(
    () => ({
      width: size,
      height: size,
      background: `${accent}15`,
      borderColor: `${accent}30`,
    }),
    [accent, size],
  );

  return (
    <m.a
      href={button.url}
      target="_blank"
      rel="noopener noreferrer"
      title={button.label}
      aria-label={button.label}
      className="inline-flex items-center justify-center rounded-2xl border shrink-0 transition-shadow duration-150 shadow-2xs hover:shadow-sm"
      style={style}
      whileHover={reduced ? undefined : { scale: interaction.states.hover.scale }}
      whileTap={reduced ? undefined : { scale: interaction.states.pressed.scale }}
      transition={interaction.states.pressed.transition}
    >
      {getPlatformIcon(type, { size: 28, color: accent })}
    </m.a>
  );
}
