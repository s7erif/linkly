"use client";

import { useMemo } from "react";
import { m, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/use-theme";
import { interaction } from "../design-system";
import { getPlatformColor, getPlatformLabel } from "./platform-resolver";
import { getPlatformIcon } from "@/features/links/platform-icons";
import type { PreviewButton } from "../types";

export interface ButtonRendererProps {
  button: PreviewButton;
  primary?: boolean;
}

function getSubtitle(button: PreviewButton, type: string) {
  const t = type ?? "CUSTOM";
  
  // 1. For recognizable platform apps & communication, the icon is enough.
  if (
    t !== "CUSTOM" &&
    t !== "WEBSITE" &&
    t !== "PORTFOLIO"
  ) {
    return null;
  }
  
  // 2. For Custom / Website / Portfolio, the domain adds value
  try {
    const domain = new URL(button.url).hostname.replace(/^www\./, "");
    
    // Avoid redundant metadata
    if (domain.toLowerCase() === button.label.toLowerCase()) return null;
    if (button.label.toLowerCase().includes(domain.toLowerCase())) return null;
    
    return domain;
  } catch {
    return null;
  }
}

export function ButtonRenderer({ button, primary = false }: ButtonRendererProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const type = button.type ?? "CUSTOM";
  const accent = button.color ?? getPlatformColor(type);

  const style = useMemo(
    () => ({
      fontFamily: theme.typography.fontFamily,
      borderRadius: theme.shape.buttonRadius,
    }),
    [theme],
  );

  // 1. Featured / Primary Link (Remains Centered, High Emphasis)
  // This preserves the calm, premium identity and provides distinct treatment for the primary action.
  if (primary) {
    return (
      <m.a
        href={button.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full min-h-[52px] md:min-h-[56px] px-6 text-center font-bold text-[15px] md:text-base text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-shadow"
        style={{
          ...style,
          background: accent,
          boxShadow: theme.shadow.button,
          outlineColor: accent,
        }}
        whileHover={reduced ? undefined : { scale: interaction.states.hover.scale, boxShadow: theme.shadow.elevated }}
        whileTap={reduced ? undefined : { scale: interaction.states.pressed.scale }}
        transition={interaction.states.pressed.transition}
      >
        {button.label}
      </m.a>
    );
  }

  // 2. Secondary Link Cards (Left-Aligned, Icon + Text + Arrow)
  // Optimized for rapid scanning and high click confidence.
  const subtitle = getSubtitle(button, type);
  const showArrow = type === "CUSTOM" || type === "WEBSITE" || type === "PORTFOLIO";
  const hasSubtitle = Boolean(subtitle);

  return (
    <m.a
      href={button.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center w-full ${hasSubtitle ? "min-h-[64px] p-2.5 md:p-3" : "min-h-[52px] p-2 md:p-2.5"} outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-shadow group`}
      style={{
        ...style,
        background: "transparent",
        border: `1.5px solid ${theme.colors.outline}`,
        outlineColor: accent,
      }}
      whileHover={reduced ? undefined : { scale: interaction.states.hover.scale, backgroundColor: `${accent}08`, borderColor: `${accent}40`, boxShadow: theme.shadow.button }}
      whileTap={reduced ? undefined : { scale: interaction.states.pressed.scale }}
      transition={interaction.states.pressed.transition}
    >
      {/* Visual Anchor: Icon */}
      <div 
        className={`flex items-center justify-center shrink-0 rounded-xl ${hasSubtitle ? "w-11 h-11" : "w-10 h-10"}`}
        style={{ background: `${accent}12` }}
      >
        {getPlatformIcon(type, { size: hasSubtitle ? 24 : 20, color: accent })}
      </div>

      {/* Information Hierarchy: Title -> Subtitle */}
      <div className={`flex flex-col flex-1 min-w-0 ml-3.5 text-left ${hasSubtitle ? "" : "justify-center"}`}>
        <span className={`${hasSubtitle ? "font-semibold text-[14px] md:text-[15px]" : "font-semibold text-[14.5px] md:text-[15px]"} truncate`} style={{ color: theme.colors.text }}>
          {button.label}
        </span>
        {hasSubtitle && (
          <span className="font-medium text-[11.5px] md:text-[12px] truncate opacity-60 mt-0.5 tracking-wide uppercase" style={{ color: theme.colors.text }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Interaction Affordance */}
      {showArrow && (
        <div 
          className="shrink-0 ml-3 mr-1 opacity-20 group-hover:opacity-70 transition-opacity duration-150"
          style={{ color: theme.colors.text }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </div>
      )}
    </m.a>
  );
}
