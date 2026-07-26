// ═══════════════════════════════════════════════════════════════════════════
// Effect Token Categories — glass, blur, borders, elevation, surface depth.
//
// Each category follows the same contract as the existing design tokens:
//   Settings type → Token type → Schema → Defaults → Resolver
//
// Plug into DESIGN_TOKEN_CATEGORIES to make them available everywhere.
// ═══════════════════════════════════════════════════════════════════════════

import { z } from "zod";

// ── 1. Glass Effect ────────────────────────────────────────────────────────

export interface GlassSettings {
  enabled: boolean;
  blur: number;        // 0–40 px
  opacity: number;     // 0–100 %
  tintStrength: number; // 0–100 %
  borderOpacity: number; // 0–100 %
}

export interface GlassTokens {
  enabled: boolean;
  css: string; // full backdrop-filter + background rgba
}

export const glassSchema = z.object({
  enabled: z.boolean(),
  blur: z.number().int().min(0).max(40),
  opacity: z.number().int().min(0).max(100),
  tintStrength: z.number().int().min(0).max(100),
  borderOpacity: z.number().int().min(0).max(100),
}).strict();

export const GLASS_DEFAULTS: GlassSettings = {
  enabled: false,
  blur: 12,
  opacity: 60,
  tintStrength: 10,
  borderOpacity: 30,
};

export function resolveGlass(s: GlassSettings): GlassTokens {
  if (!s.enabled) return { enabled: false, css: "" };
  const alpha = s.opacity / 100;
  const tint = s.tintStrength / 100;
  const rgba = `rgba(255, 255, 255, ${(alpha * 0.6 + tint * 0.05).toFixed(2)})`;
  return {
    enabled: true,
    css: `backdrop-filter: blur(${s.blur}px); background: ${rgba}; border-color: rgba(255,255,255,${(s.borderOpacity / 100).toFixed(2)})`,
  };
}

// ── 2. Blur ────────────────────────────────────────────────────────────────

export interface BlurSettings {
  amount: number; // 0–40 px
}

export interface BlurTokens {
  css: string; // backdrop-filter or filter
}

export const blurSchema = z.object({
  amount: z.number().int().min(0).max(40),
}).strict();

export const BLUR_DEFAULTS: BlurSettings = { amount: 0 };

export function resolveBlur(s: BlurSettings): BlurTokens {
  if (s.amount === 0) return { css: "" };
  return { css: `backdrop-filter: blur(${s.amount}px);` };
}

// ── 3. Borders ─────────────────────────────────────────────────────────────

export type BorderStyleValue = "NONE" | "THIN" | "MEDIUM" | "THICK";

export interface BorderSettings {
  style: BorderStyleValue;
  width: number;  // 0–4 px
  opacity: number; // 0–100 %
}

export interface BorderTokens {
  css: string;
}

export const borderSchema = z.object({
  style: z.enum(["NONE", "THIN", "MEDIUM", "THICK"]),
  width: z.number().int().min(0).max(4),
  opacity: z.number().int().min(0).max(100),
}).strict();

export const BORDER_DEFAULTS: BorderSettings = {
  style: "THIN",
  width: 1,
  opacity: 15,
};

const BORDER_WIDTHS: Record<BorderStyleValue, number> = {
  NONE: 0, THIN: 1, MEDIUM: 2, THICK: 4,
};

export function resolveBorders(s: BorderSettings, borderColor: string): BorderTokens {
  const w = BORDER_WIDTHS[s.style];
  if (w === 0) return { css: "border: none" };
  return { css: `border: ${w}px solid ${borderColor}${Math.round(s.opacity * 2.55).toString(16).padStart(2, "0")}` };
}

// ── 4. Surface Depth / Elevation ───────────────────────────────────────────

export type ElevationValue = "FLAT" | "RAISED" | "ELEVATED" | "FLOATING";

export interface ElevationSettings {
  level: ElevationValue;
}

export interface ElevationTokens {
  shadow: string;
  scale: number;
}

export const elevationSchema = z.object({
  level: z.enum(["FLAT", "RAISED", "ELEVATED", "FLOATING"]),
}).strict();

export const ELEVATION_DEFAULTS: ElevationSettings = { level: "RAISED" };

const ELEVATION_SHADOWS: Record<ElevationValue, string> = {
  FLAT:     "none",
  RAISED:   "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
  ELEVATED: "0 4px 16px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
  FLOATING: "0 8px 32px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.06)",
};

export function resolveElevation(s: ElevationSettings): ElevationTokens {
  return { shadow: ELEVATION_SHADOWS[s.level], scale: s.level === "FLOATING" ? 1.01 : 1 };
}

// ── 5. Extended Shadow ─────────────────────────────────────────────────────

export type ShadowStyleValue = "NONE" | "SOFT" | "MEDIUM" | "LARGE" | "FLOATING" | "CUSTOM";

export interface ShadowSettings {
  style: ShadowStyleValue;
  customX: number;
  customY: number;
  customBlur: number;
  customSpread: number;
  customOpacity: number;
}

export interface ShadowTokens {
  card: string;
  button: string;
}

export const shadowSchema = z.object({
  style: z.enum(["NONE", "SOFT", "MEDIUM", "LARGE", "FLOATING", "CUSTOM"]),
  customX: z.number().int().min(-20).max(20),
  customY: z.number().int().min(-20).max(20),
  customBlur: z.number().int().min(0).max(100),
  customSpread: z.number().int().min(-20).max(20),
  customOpacity: z.number().min(0).max(1),
}).strict();

export const SHADOW_DEFAULTS: ShadowSettings = {
  style: "MEDIUM",
  customX: 0, customY: 4, customBlur: 16, customSpread: 0, customOpacity: 0.08,
};

const SHADOW_MAP: Record<Exclude<ShadowStyleValue, "CUSTOM">, ShadowTokens> = {
  NONE:     { card: "none", button: "none" },
  SOFT:     { card: "0 1px 3px rgba(0,0,0,0.04)", button: "0 2px 8px rgba(0,0,0,0.08)" },
  MEDIUM:   { card: "0 4px 16px rgba(0,0,0,0.06)", button: "0 4px 12px rgba(0,0,0,0.12)" },
  LARGE:    { card: "0 8px 32px rgba(0,0,0,0.08)", button: "0 6px 20px rgba(0,0,0,0.15)" },
  FLOATING: { card: "0 12px 40px rgba(0,0,0,0.10)", button: "0 8px 28px rgba(0,0,0,0.18)" },
};

export function resolveShadow(s: ShadowSettings): ShadowTokens {
  if (s.style === "CUSTOM") {
    const v = `rgba(0,0,0,${s.customOpacity})`;
    const custom = `${s.customX}px ${s.customY}px ${s.customBlur}px ${s.customSpread}px ${v}`;
    return { card: custom, button: custom };
  }
  return SHADOW_MAP[s.style];
}

// ── 6. Extended Shape / Radius ─────────────────────────────────────────────

export type RadiusStyleValue = "SHARP" | "SMALL" | "MEDIUM" | "LARGE" | "XL" | "PILL";

export interface RadiusSettings {
  style: RadiusStyleValue;
}

export interface RadiusTokens {
  cardRadius: string;
  buttonRadius: string;
  avatarRadius: string;
}

export const radiusSchema = z.object({
  style: z.enum(["SHARP", "SMALL", "MEDIUM", "LARGE", "XL", "PILL"]),
}).strict();

export const RADIUS_DEFAULTS: RadiusSettings = { style: "MEDIUM" };

const RADIUS_MAP: Record<RadiusStyleValue, number> = {
  SHARP: 4, SMALL: 8, MEDIUM: 16, LARGE: 24, XL: 32, PILL: 9999,
};

export function resolveRadius(s: RadiusSettings): RadiusTokens {
  const r = RADIUS_MAP[s.style];
  return {
    cardRadius: `${r}px`,
    buttonRadius: `${Math.max(r - 4, 4)}px`,
    avatarRadius: s.style === "PILL" ? "9999px" : `${r}px`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Effect Presets — combos of effect settings
// ═══════════════════════════════════════════════════════════════════════════

export interface EffectPreset {
  id: string;
  name: string;
  description: string;
  glass: GlassSettings;
  blur: BlurSettings;
  borders: BorderSettings;
  elevation: ElevationSettings;
  shadow: ShadowSettings;
  radius: RadiusSettings;
}

export const EFFECT_PRESETS: readonly EffectPreset[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Standard shadows and medium radius",
    glass:  { ...GLASS_DEFAULTS, enabled: false },
    blur:   BLUR_DEFAULTS,
    borders:{ ...BORDER_DEFAULTS, style: "THIN", opacity: 15 },
    elevation: { level: "RAISED" },
    shadow: { ...SHADOW_DEFAULTS, style: "MEDIUM" },
    radius: { style: "MEDIUM" },
  },
  {
    id: "soft",
    name: "Soft",
    description: "Gentle shadows and large radius",
    glass:  { ...GLASS_DEFAULTS, enabled: false },
    blur:   BLUR_DEFAULTS,
    borders:{ ...BORDER_DEFAULTS, style: "THIN", opacity: 10 },
    elevation: { level: "RAISED" },
    shadow: { ...SHADOW_DEFAULTS, style: "SOFT" },
    radius: { style: "LARGE" },
  },
  {
    id: "glass",
    name: "Glass",
    description: "Full frosted glass with strong blur",
    glass:  { enabled: true, blur: 16, opacity: 50, tintStrength: 5, borderOpacity: 20 },
    blur:   { amount: 0 },
    borders:{ ...BORDER_DEFAULTS, style: "THIN", opacity: 20 },
    elevation: { level: "RAISED" },
    shadow: { ...SHADOW_DEFAULTS, style: "SOFT" },
    radius: { style: "LARGE" },
  },
  {
    id: "floating",
    name: "Floating",
    description: "High elevation, large shadows, XL radius",
    glass:  { ...GLASS_DEFAULTS, enabled: false },
    blur:   BLUR_DEFAULTS,
    borders:{ ...BORDER_DEFAULTS, style: "NONE", opacity: 0 },
    elevation: { level: "FLOATING" },
    shadow: { ...SHADOW_DEFAULTS, style: "FLOATING" },
    radius: { style: "XL" },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Sharp edges, no shadows, no borders",
    glass:  { ...GLASS_DEFAULTS, enabled: false },
    blur:   BLUR_DEFAULTS,
    borders:{ ...BORDER_DEFAULTS, style: "NONE", opacity: 0 },
    elevation: { level: "FLAT" },
    shadow: { ...SHADOW_DEFAULTS, style: "NONE" },
    radius: { style: "SHARP" },
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Subtle glass tint with medium shadows",
    glass:  { enabled: true, blur: 8, opacity: 30, tintStrength: 3, borderOpacity: 15 },
    blur:   BLUR_DEFAULTS,
    borders:{ ...BORDER_DEFAULTS, style: "THIN", opacity: 12 },
    elevation: { level: "ELEVATED" },
    shadow: { ...SHADOW_DEFAULTS, style: "MEDIUM" },
    radius: { style: "MEDIUM" },
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Clean borders, subtle shadow, small radius",
    glass:  { ...GLASS_DEFAULTS, enabled: false },
    blur:   BLUR_DEFAULTS,
    borders:{ ...BORDER_DEFAULTS, style: "MEDIUM", opacity: 20 },
    elevation: { level: "RAISED" },
    shadow: { ...SHADOW_DEFAULTS, style: "SOFT" },
    radius: { style: "SMALL" },
  },
  {
    id: "modern",
    name: "Modern",
    description: "Large shadows, glass, pill radius",
    glass:  { enabled: true, blur: 10, opacity: 40, tintStrength: 3, borderOpacity: 20 },
    blur:   BLUR_DEFAULTS,
    borders:{ ...BORDER_DEFAULTS, style: "THIN", opacity: 15 },
    elevation: { level: "ELEVATED" },
    shadow: { ...SHADOW_DEFAULTS, style: "LARGE" },
    radius: { style: "PILL" },
  },
];
