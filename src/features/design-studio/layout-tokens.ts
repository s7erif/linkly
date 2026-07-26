// ═══════════════════════════════════════════════════════════════════════════
// Layout Tokens — page structure, alignment, spacing, container style.
//
// These extend the existing AppearanceSettings.sections (visibility
// booleans) with additional layout dimensions.  All values flow through
// token-categories → ThemeProvider → Preview.
// ═══════════════════════════════════════════════════════════════════════════

import { z } from "zod";

// ── Alignment ──────────────────────────────────────────────────────────────

export type ProfileAlignment = "LEFT" | "CENTER" | "RIGHT";

export interface AlignmentSettings {
  profile: ProfileAlignment;
  socialLinks: "LEFT" | "CENTER";
}

export interface AlignmentTokens {
  profile: string;       // CSS text-align / flex alignment
  socialLinks: string;
}

export const alignmentSchema = z.object({
  profile: z.enum(["LEFT", "CENTER", "RIGHT"]),
  socialLinks: z.enum(["LEFT", "CENTER"]),
}).strict();

export const ALIGNMENT_DEFAULTS: AlignmentSettings = { profile: "CENTER", socialLinks: "CENTER" };

export function resolveAlignment(s: AlignmentSettings): AlignmentTokens {
  const map: Record<string, string> = { LEFT: "flex-start", CENTER: "center", RIGHT: "flex-end" };
  return { profile: map[s.profile], socialLinks: map[s.socialLinks] };
}

// ── Profile Position ───────────────────────────────────────────────────────

export type ProfilePosition = "TOP" | "INSIDE_HERO" | "FLOATING" | "COMPACT";

export interface PositionSettings {
  profile: ProfilePosition;
}

export interface PositionTokens {
  profile: ProfilePosition;
  /** CSS class hint for the renderer. */
  profileClass: string;
}

export const positionSchema = z.object({
  profile: z.enum(["TOP", "INSIDE_HERO", "FLOATING", "COMPACT"]),
}).strict();

export const POSITION_DEFAULTS: PositionSettings = { profile: "TOP" };

export function resolvePosition(s: PositionSettings): PositionTokens {
  const classes: Record<ProfilePosition, string> = {
    TOP: "order-first pt-2",
    INSIDE_HERO: "order-first",
    FLOATING: "order-first -mt-16 z-10",
    COMPACT: "order-first scale-90",
  };
  return { profile: s.profile, profileClass: classes[s.profile] };
}

// ── Section Width ──────────────────────────────────────────────────────────

export type SectionWidth = "NARROW" | "MEDIUM" | "WIDE" | "FULL";

export interface WidthSettings {
  content: SectionWidth;
}

export interface WidthTokens {
  maxWidth: string;
}

export const widthSchema = z.object({
  content: z.enum(["NARROW", "MEDIUM", "WIDE", "FULL"]),
}).strict();

export const WIDTH_DEFAULTS: WidthSettings = { content: "MEDIUM" };

const WIDTH_MAP: Record<SectionWidth, string> = {
  NARROW: "280px", MEDIUM: "360px", WIDE: "440px", FULL: "100%",
};

export function resolveWidth(s: WidthSettings): WidthTokens {
  return { maxWidth: WIDTH_MAP[s.content] };
}

// ── Vertical Spacing ───────────────────────────────────────────────────────

export type SpacingScale = "COMPACT" | "COMFORTABLE" | "SPACIOUS";

export interface VerticalSpacingSettings {
  scale: SpacingScale;
}

export interface VerticalSpacingTokens {
  sectionGap: string;
  elementGap: string;
}

export const verticalSpacingSchema = z.object({
  scale: z.enum(["COMPACT", "COMFORTABLE", "SPACIOUS"]),
}).strict();

export const VERTICAL_SPACING_DEFAULTS: VerticalSpacingSettings = { scale: "COMFORTABLE" };

const SPACING_MAP: Record<SpacingScale, VerticalSpacingTokens> = {
  COMPACT:     { sectionGap: "0.75rem", elementGap: "0.5rem" },
  COMFORTABLE: { sectionGap: "1.5rem",  elementGap: "1rem" },
  SPACIOUS:    { sectionGap: "2.5rem",  elementGap: "1.5rem" },
};

export function resolveVerticalSpacing(s: VerticalSpacingSettings): VerticalSpacingTokens {
  return SPACING_MAP[s.scale];
}

// ── Container Style ────────────────────────────────────────────────────────

export type ContainerStyle = "FLAT" | "CARD" | "FLOATING_CARD" | "GLASS_CARD";

export interface ContainerSettings {
  style: ContainerStyle;
}

export interface ContainerTokens {
  background: string;
  shadow: string;
  radius: string;
  padding: string;
}

export const containerSchema = z.object({
  style: z.enum(["FLAT", "CARD", "FLOATING_CARD", "GLASS_CARD"]),
}).strict();

export const CONTAINER_DEFAULTS: ContainerSettings = { style: "FLAT" };

export function resolveContainer(s: ContainerSettings): ContainerTokens {
  switch (s.style) {
    case "FLAT":          return { background: "transparent", shadow: "none", radius: "0", padding: "0" };
    case "CARD":          return { background: "#FFFFFF", shadow: "0 1px 3px rgba(0,0,0,0.04)", radius: "16px", padding: "24px" };
    case "FLOATING_CARD": return { background: "#FFFFFF", shadow: "0 8px 32px rgba(0,0,0,0.08)", radius: "24px", padding: "32px" };
    case "GLASS_CARD":    return { background: "rgba(255,255,255,0.6)", shadow: "0 4px 16px rgba(0,0,0,0.04)", radius: "24px", padding: "24px" };
  }
}

// ── Layout Presets ─────────────────────────────────────────────────────────

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  alignment: AlignmentSettings;
  position: PositionSettings;
  width: WidthSettings;
  spacing: VerticalSpacingSettings;
  container: ContainerSettings;
}

export const LAYOUT_PRESETS: readonly LayoutPreset[] = [
  {
    id: "creator", name: "Creator", description: "Centered profile, spacious layout",
    alignment: { profile: "CENTER", socialLinks: "CENTER" },
    position: { profile: "TOP" },
    width: { content: "MEDIUM" },
    spacing: { scale: "SPACIOUS" },
    container: { style: "FLAT" },
  },
  {
    id: "developer", name: "Developer", description: "Compact, left-aligned, narrow",
    alignment: { profile: "LEFT", socialLinks: "LEFT" },
    position: { profile: "COMPACT" },
    width: { content: "NARROW" },
    spacing: { scale: "COMPACT" },
    container: { style: "FLAT" },
  },
  {
    id: "business", name: "Business", description: "Floating card, wide, centered",
    alignment: { profile: "CENTER", socialLinks: "CENTER" },
    position: { profile: "FLOATING" },
    width: { content: "WIDE" },
    spacing: { scale: "COMFORTABLE" },
    container: { style: "CARD" },
  },
  {
    id: "agency", name: "Agency", description: "Full width, bold, glass card",
    alignment: { profile: "CENTER", socialLinks: "CENTER" },
    position: { profile: "INSIDE_HERO" },
    width: { content: "FULL" },
    spacing: { scale: "SPACIOUS" },
    container: { style: "GLASS_CARD" },
  },
  {
    id: "minimal", name: "Minimal", description: "Compact, narrow, flat",
    alignment: { profile: "LEFT", socialLinks: "LEFT" },
    position: { profile: "COMPACT" },
    width: { content: "NARROW" },
    spacing: { scale: "COMPACT" },
    container: { style: "FLAT" },
  },
  {
    id: "portfolio", name: "Portfolio", description: "Wide, floating, spacious",
    alignment: { profile: "CENTER", socialLinks: "CENTER" },
    position: { profile: "FLOATING" },
    width: { content: "WIDE" },
    spacing: { scale: "SPACIOUS" },
    container: { style: "FLOATING_CARD" },
  },
  {
    id: "modern", name: "Modern", description: "Glass card, centered, medium width",
    alignment: { profile: "CENTER", socialLinks: "CENTER" },
    position: { profile: "TOP" },
    width: { content: "MEDIUM" },
    spacing: { scale: "COMFORTABLE" },
    container: { style: "GLASS_CARD" },
  },
  {
    id: "startup", name: "Startup", description: "Inside hero, full width, compact",
    alignment: { profile: "CENTER", socialLinks: "CENTER" },
    position: { profile: "INSIDE_HERO" },
    width: { content: "FULL" },
    spacing: { scale: "COMPACT" },
    container: { style: "FLAT" },
  },
];
