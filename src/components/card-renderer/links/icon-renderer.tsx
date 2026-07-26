"use client";

import { useMemo } from "react";
import { getPlatformColor } from "./platform-resolver";
import { getPlatformIcon } from "@/features/links/platform-icons";
import type { PreviewButton } from "../types";

export interface IconRendererProps {
  button: PreviewButton;
  size?: number;
}

export function IconRenderer({ button, size = 48 }: IconRendererProps) {
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
    <a
      href={button.url}
      target="_blank"
      rel="noopener noreferrer"
      title={button.label}
      aria-label={button.label}
      className="inline-flex items-center justify-center rounded-2xl border shrink-0 transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs hover:shadow-md"
      style={style}
    >
      {getPlatformIcon(type, { size: 28, color: accent })}
    </a>
  );
}
