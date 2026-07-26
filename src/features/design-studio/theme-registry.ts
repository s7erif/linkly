// ═══════════════════════════════════════════════════════════════════════════
// Theme Registry — professionally designed theme presets.
//
// Every theme is a complete DesignTokenSettings object.  Applying a theme
// converts it to AppearanceSettings via toAppearanceSettings() and feeds
// the result into the store's applyTheme().  The preview ThemeProvider
// resolves AppearanceSettings via resolveTokens().
//
// Adding a new theme is one object in the array below.  Nothing else.
// ═══════════════════════════════════════════════════════════════════════════

import type { DesignTokenSettings } from "./token-categories";

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  /** Visual category for gallery grouping. */
  category: "Minimal" | "Business" | "Dark" | "Glass" | "Warm" | "Cool" | "Bold";
  settings: DesignTokenSettings;
}

const SECTIONS = { profile: true, bio: true, contact: true, buttons: true, socialLinks: true };

export const THEME_REGISTRY: readonly ThemePreset[] = [
  // ── 1. Default ───────────────────────────────────────────────────────
  {
    id: "default",
    name: "Default",
    description: "Clean purple and slate",
    category: "Business",
    settings: {
      colors:     { primary: "#6D5DF6", accent: "#9182FF", text: "#1A1A1A", mutedText: "#6B7280" },
      typography: { style: "SANS" },
      background: { style: "SOLID", color: "#FCFCFD", gradientFrom: "#EEF2FF", gradientTo: "#FCFCFD" },
      buttons:    { style: "SOLID" },
      shape:      { borderRadius: 16 },
      shadows:    { style: "MEDIUM" },
      spacing:    { scale: "COMFORTABLE" },
      sections:   SECTIONS,
    },
  },

  // ── 2. Minimal ───────────────────────────────────────────────────────
  {
    id: "minimal",
    name: "Minimal",
    description: "Quiet monochrome clarity",
    category: "Minimal",
    settings: {
      colors:     { primary: "#18181B", accent: "#A1A1AA", text: "#18181B", mutedText: "#71717A" },
      typography: { style: "SYSTEM" },
      background: { style: "SOLID", color: "#FFFFFF", gradientFrom: "#FFFFFF", gradientTo: "#F4F4F5" },
      buttons:    { style: "OUTLINE" },
      shape:      { borderRadius: 8 },
      shadows:    { style: "NONE" },
      spacing:    { scale: "COMPACT" },
      sections:   SECTIONS,
    },
  },

  // ── 3. Dark ──────────────────────────────────────────────────────────
  {
    id: "dark",
    name: "Dark",
    description: "High-contrast night mode",
    category: "Dark",
    settings: {
      colors:     { primary: "#A78BFA", accent: "#22D3EE", text: "#F8FAFC", mutedText: "#94A3B8" },
      typography: { style: "SANS" },
      background: { style: "GRADIENT", color: "#0F172A", gradientFrom: "#020617", gradientTo: "#1E293B" },
      buttons:    { style: "SOFT" },
      shape:      { borderRadius: 18 },
      shadows:    { style: "LARGE" },
      spacing:    { scale: "COMFORTABLE" },
      sections:   SECTIONS,
    },
  },

  // ── 4. Glass ─────────────────────────────────────────────────────────
  {
    id: "glass",
    name: "Glass",
    description: "Frosted translucent layers",
    category: "Glass",
    settings: {
      colors:     { primary: "#6366F1", accent: "#A5B4FC", text: "#1E1B4B", mutedText: "#6B7280" },
      typography: { style: "SANS" },
      background: { style: "GRADIENT", color: "#F8FAFC", gradientFrom: "#EEF2FF", gradientTo: "#E0E7FF" },
      buttons:    { style: "OUTLINE" },
      shape:      { borderRadius: 24 },
      shadows:    { style: "MEDIUM" },
      spacing:    { scale: "COMFORTABLE" },
      sections:   SECTIONS,
    },
  },

  // ── 5. Corporate ─────────────────────────────────────────────────────
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional navy and steel",
    category: "Business",
    settings: {
      colors:     { primary: "#1E40AF", accent: "#3B82F6", text: "#0F172A", mutedText: "#475569" },
      typography: { style: "SANS" },
      background: { style: "SOLID", color: "#F1F5F9", gradientFrom: "#E2E8F0", gradientTo: "#F8FAFC" },
      buttons:    { style: "SOLID" },
      shape:      { borderRadius: 12 },
      shadows:    { style: "SMALL" },
      spacing:    { scale: "COMFORTABLE" },
      sections:   SECTIONS,
    },
  },

  // ── 6. Luxury ────────────────────────────────────────────────────────
  {
    id: "luxury",
    name: "Luxury",
    description: "Black, ivory, and gold",
    category: "Warm",
    settings: {
      colors:     { primary: "#A16207", accent: "#FACC15", text: "#1C1917", mutedText: "#78716C" },
      typography: { style: "SERIF" },
      background: { style: "GRADIENT", color: "#FAFAF9", gradientFrom: "#FFFBEB", gradientTo: "#E7E5E4" },
      buttons:    { style: "OUTLINE" },
      shape:      { borderRadius: 4 },
      shadows:    { style: "LARGE" },
      spacing:    { scale: "COMFORTABLE" },
      sections:   SECTIONS,
    },
  },

  // ── 7. Ocean ─────────────────────────────────────────────────────────
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep blue coastal calm",
    category: "Cool",
    settings: {
      colors:     { primary: "#0369A1", accent: "#2DD4BF", text: "#082F49", mutedText: "#0E7490" },
      typography: { style: "SANS" },
      background: { style: "GRADIENT", color: "#ECFEFF", gradientFrom: "#E0F2FE", gradientTo: "#CCFBF1" },
      buttons:    { style: "SOLID" },
      shape:      { borderRadius: 22 },
      shadows:    { style: "MEDIUM" },
      spacing:    { scale: "COMFORTABLE" },
      sections:   SECTIONS,
    },
  },

  // ── 8. Forest ────────────────────────────────────────────────────────
  {
    id: "forest",
    name: "Forest",
    description: "Earthy greens and timber",
    category: "Cool",
    settings: {
      colors:     { primary: "#166534", accent: "#4ADE80", text: "#052E16", mutedText: "#15803D" },
      typography: { style: "SERIF" },
      background: { style: "GRADIENT", color: "#F0FDF4", gradientFrom: "#DCFCE7", gradientTo: "#BBF7D0" },
      buttons:    { style: "SOFT" },
      shape:      { borderRadius: 20 },
      shadows:    { style: "MEDIUM" },
      spacing:    { scale: "COMFORTABLE" },
      sections:   SECTIONS,
    },
  },

  // ── 9. Sunset ────────────────────────────────────────────────────────
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm coral evening glow",
    category: "Warm",
    settings: {
      colors:     { primary: "#C2410C", accent: "#E11D48", text: "#431407", mutedText: "#9A3412" },
      typography: { style: "SANS" },
      background: { style: "GRADIENT", color: "#FFF7ED", gradientFrom: "#FFEDD5", gradientTo: "#FFE4E6" },
      buttons:    { style: "SOFT" },
      shape:      { borderRadius: 24 },
      shadows:    { style: "LARGE" },
      spacing:    { scale: "COMFORTABLE" },
      sections:   SECTIONS,
    },
  },

  // ── 10. Mono ─────────────────────────────────────────────────────────
  {
    id: "mono",
    name: "Mono",
    description: "Stark grayscale precision",
    category: "Minimal",
    settings: {
      colors:     { primary: "#000000", accent: "#525252", text: "#0A0A0A", mutedText: "#737373" },
      typography: { style: "SYSTEM" },
      background: { style: "SOLID", color: "#FAFAFA", gradientFrom: "#FFFFFF", gradientTo: "#F5F5F5" },
      buttons:    { style: "SOLID" },
      shape:      { borderRadius: 10 },
      shadows:    { style: "SMALL" },
      spacing:    { scale: "COMPACT" },
      sections:   SECTIONS,
    },
  },

  // ── 11. Gradient ─────────────────────────────────────────────────────
  {
    id: "gradient",
    name: "Gradient",
    description: "Vibrant purple-to-cyan flow",
    category: "Bold",
    settings: {
      colors:     { primary: "#7C3AED", accent: "#06B6D4", text: "#1E1B4B", mutedText: "#6B7280" },
      typography: { style: "SANS" },
      background: { style: "GRADIENT", color: "#F5F3FF", gradientFrom: "#EDE9FE", gradientTo: "#CFFAFE" },
      buttons:    { style: "SOLID" },
      shape:      { borderRadius: 20 },
      shadows:    { style: "LARGE" },
      spacing:    { scale: "COMFORTABLE" },
      sections:   SECTIONS,
    },
  },
];

/** O(1) lookup by id. */
export const THEME_BY_ID: Record<string, ThemePreset> = Object.fromEntries(
  THEME_REGISTRY.map((t) => [t.id, t]),
);

/**
 * Converts DesignTokenSettings (new architecture) → AppearanceSettings
 * (legacy store format).  This bridge exists until the store is migrated.
 */
import type { AppearanceSettings } from "@/types/appearance";

export function toAppearanceSettings(settings: DesignTokenSettings): AppearanceSettings {
  return {
    colors:     { ...settings.colors },
    background: {
      style:        settings.background.style as "SOLID" | "GRADIENT",
      color:        settings.background.color,
      gradientFrom: settings.background.gradientFrom,
      gradientTo:   settings.background.gradientTo,
    },
    typography:   settings.typography.style,
    buttonStyle:  settings.buttons.style,
    borderRadius: settings.shape.borderRadius,
    avatarBorderRadius: null,
    shadow:       settings.shadows.style,
    sections:     { ...settings.sections },
    layout:       { alignment: "CENTER", width: "MEDIUM", spacing: "COMFORTABLE", position: "TOP", container: "FLAT" },
  };
}
