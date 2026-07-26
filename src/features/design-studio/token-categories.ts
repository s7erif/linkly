// ═══════════════════════════════════════════════════════════════════════════
// Design Token Categories — type-safe, composable design primitives.
//
// Each category is a self-contained unit:
//   - Settings type   → what the editor mutates (persisted)
//   - Token type      → what the preview consumes  (resolved)
//   - Defaults        → factory reset values
//   - Zod schema      → validation (shared client + server)
//   - Resolver        → Settings → Tokens
//
// Adding a new design dimension (e.g. "Cards", "Effects") means adding
// one category here — nothing else changes.
// ═══════════════════════════════════════════════════════════════════════════

import { z } from "zod";

// ── Shared primitives ──────────────────────────────────────────────────────

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color");

// ── 1. Colors ──────────────────────────────────────────────────────────────

export interface ColorSettings {
  primary: string;
  accent: string;
  text: string;
  mutedText: string;
}

export interface ColorTokens {
  primary: string;
  accent: string;
  text: string;
  mutedText: string;
  surface: string;
  surfaceOverlay: string;
  outline: string;
}

export const colorSchema = z.object({
  primary: hexColor,
  accent: hexColor,
  text: hexColor,
  mutedText: hexColor,
}).strict();

export const COLOR_DEFAULTS: ColorSettings = {
  primary: "#6D5DF6",
  accent: "#9182FF",
  text: "#1A1A1A",
  mutedText: "#6B7280",
};

export function resolveColors(settings: ColorSettings, _ctx: ResolveContext): ColorTokens {
  return {
    primary: settings.primary,
    accent: settings.accent,
    text: settings.text,
    mutedText: settings.mutedText,
    surface: "#FFFFFF",
    surfaceOverlay: "#FCFCFD",
    outline: "rgba(0,0,0,0.08)",
  };
}

// ── 2. Typography ──────────────────────────────────────────────────────────

export type TypographyStyleSettings = "SYSTEM" | "SANS" | "SERIF";

export interface TypographySettings {
  style: TypographyStyleSettings;
}

export interface TypographyTokens {
  fontFamily: string;
  headingWeight: number;
  bodyWeight: number;
  headingSize: string;
  bodySize: string;
  captionSize: string;
}

export const typographySchema = z.object({
  style: z.enum(["SYSTEM", "SANS", "SERIF"]),
}).strict();

export const TYPOGRAPHY_DEFAULTS: TypographySettings = {
  style: "SANS",
};

const FONT_FAMILIES: Record<TypographyStyleSettings, string> = {
  SYSTEM: "system-ui, sans-serif",
  SANS: "Inter, system-ui, sans-serif",
  SERIF: "Georgia, serif",
};

export function resolveTypography(settings: TypographySettings, _ctx: ResolveContext): TypographyTokens {
  return {
    fontFamily: FONT_FAMILIES[settings.style],
    headingWeight: 600,
    bodyWeight: 400,
    headingSize: "1.25rem",
    bodySize: "0.875rem",
    captionSize: "0.75rem",
  };
}

// ── 3. Background ──────────────────────────────────────────────────────────

export type BackgroundStyleSettings = "SOLID" | "GRADIENT";

export interface BackgroundSettings {
  style: BackgroundStyleSettings;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface BackgroundTokens {
  css: string;          // full CSS background value
  isGradient: boolean;
}

export const backgroundSchema = z.object({
  style: z.enum(["SOLID", "GRADIENT"]),
  color: hexColor,
  gradientFrom: hexColor,
  gradientTo: hexColor,
}).strict();

export const BACKGROUND_DEFAULTS: BackgroundSettings = {
  style: "SOLID",
  color: "#FCFCFD",
  gradientFrom: "#EEF2FF",
  gradientTo: "#FCFCFD",
};

export function resolveBackground(settings: BackgroundSettings, _ctx: ResolveContext): BackgroundTokens {
  const css = settings.style === "GRADIENT"
    ? `linear-gradient(145deg, ${settings.gradientFrom}, ${settings.gradientTo})`
    : settings.color;
  return { css, isGradient: settings.style === "GRADIENT" };
}

// ── 4. Button Style ────────────────────────────────────────────────────────

export type ButtonStyleSettings = "SOLID" | "OUTLINE" | "SOFT";

export interface ButtonSettings {
  style: ButtonStyleSettings;
}

export type ButtonTokens = ButtonStyleSettings; // pass-through — renderers read directly

export const buttonSchema = z.object({
  style: z.enum(["SOLID", "OUTLINE", "SOFT"]),
}).strict();

export const BUTTON_DEFAULTS: ButtonSettings = {
  style: "SOLID",
};

export function resolveButtons(settings: ButtonSettings, _ctx: ResolveContext): ButtonTokens {
  return settings.style;
}

// ── 5. Shape (Border Radius) ───────────────────────────────────────────────

export interface ShapeSettings {
  borderRadius: number; // 0–32 px
}

export interface ShapeTokens {
  radius: string;
  buttonRadius: string;
  avatarRadius: string;
}

export const shapeSchema = z.object({
  borderRadius: z.number().int().min(0).max(32),
}).strict();

export const SHAPE_DEFAULTS: ShapeSettings = {
  borderRadius: 16,
};

export function resolveShape(settings: ShapeSettings, _ctx: ResolveContext): ShapeTokens {
  return {
    radius: `${settings.borderRadius}px`,
    buttonRadius: `${Math.max(settings.borderRadius - 4, 4)}px`,
    avatarRadius: "9999px",
  };
}

// ── 6. Shadows ─────────────────────────────────────────────────────────────

export type ShadowStyleSettings = "NONE" | "SMALL" | "MEDIUM" | "LARGE";

export interface ShadowSettings {
  style: ShadowStyleSettings;
}

export interface ShadowTokens {
  card: string;
  button: string;
  elevated: string;
}

export const shadowSchema = z.object({
  style: z.enum(["NONE", "SMALL", "MEDIUM", "LARGE"]),
}).strict();

export const SHADOW_DEFAULTS: ShadowSettings = {
  style: "MEDIUM",
};

const SHADOW_PRESETS: Record<ShadowStyleSettings, ShadowTokens> = {
  NONE:   { card: "none", button: "none", elevated: "none" },
  SMALL:  { card: "0 1px 3px rgba(0,0,0,0.04)", button: "0 2px 8px rgba(0,0,0,0.08)", elevated: "0 4px 12px rgba(0,0,0,0.04)" },
  MEDIUM: { card: "0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)", button: "0 4px 12px rgba(0,0,0,0.15)", elevated: "0 8px 32px rgba(0,0,0,0.08)" },
  LARGE:  { card: "0 16px 48px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)", button: "0 8px 24px rgba(0,0,0,0.2)", elevated: "0 20px 50px rgba(0,0,0,0.12)" },
};

export function resolveShadows(settings: ShadowSettings, _ctx: ResolveContext): ShadowTokens {
  return SHADOW_PRESETS[settings.style];
}

// ── 7. Spacing ─────────────────────────────────────────────────────────────

export interface SpacingSettings {
  scale: "COMFORTABLE" | "COMPACT";
}

export interface SpacingTokens {
  section: string;
  element: string;
  tight: string;
}

export const spacingSchema = z.object({
  scale: z.enum(["COMFORTABLE", "COMPACT"]),
}).strict();

export const SPACING_DEFAULTS: SpacingSettings = {
  scale: "COMFORTABLE",
};

const SPACING_SCALES: Record<SpacingSettings["scale"], SpacingTokens> = {
  COMFORTABLE: { section: "2rem", element: "1rem", tight: "0.5rem" },
  COMPACT:     { section: "1.25rem", element: "0.75rem", tight: "0.375rem" },
};

export function resolveSpacing(settings: SpacingSettings, _ctx: ResolveContext): SpacingTokens {
  return SPACING_SCALES[settings.scale];
}

// ── 8. Layout Sections ─────────────────────────────────────────────────────

export interface SectionsSettings {
  profile: boolean;
  bio: boolean;
  contact: boolean;
  buttons: boolean;
  socialLinks: boolean;
}

export type SectionsTokens = SectionsSettings; // boolean pass-through

export const sectionsSchema = z.object({
  profile: z.boolean(),
  bio: z.boolean(),
  contact: z.boolean(),
  buttons: z.boolean(),
  socialLinks: z.boolean(),
}).strict();

export const SECTIONS_DEFAULTS: SectionsSettings = {
  profile: true,
  bio: true,
  contact: true,
  buttons: true,
  socialLinks: true,
};

export function resolveSections(settings: SectionsSettings, _ctx: ResolveContext): SectionsTokens {
  return { ...settings };
}

// ═══════════════════════════════════════════════════════════════════════════
// Category registry — maps category keys to their settings, tokens,
// defaults, schema, and resolver. Extensible without touching the engine.
// ═══════════════════════════════════════════════════════════════════════════

/** Extra context available during token resolution (e.g., other category outputs). */
export interface ResolveContext {
  colors: ColorSettings;
}

export interface DesignTokenCategory<
  TSettings,
  TTokens,
> {
  key: string;
  label: string;
  schema: z.ZodType<TSettings>;
  defaults: TSettings;
  resolve: (settings: TSettings, ctx: ResolveContext) => TTokens;
}

export const DESIGN_TOKEN_CATEGORIES = {
  colors: {
    key: "colors",
    label: "Colors",
    schema: colorSchema,
    defaults: COLOR_DEFAULTS,
    resolve: resolveColors,
  },
  typography: {
    key: "typography",
    label: "Typography",
    schema: typographySchema,
    defaults: TYPOGRAPHY_DEFAULTS,
    resolve: resolveTypography,
  },
  background: {
    key: "background",
    label: "Background",
    schema: backgroundSchema,
    defaults: BACKGROUND_DEFAULTS,
    resolve: resolveBackground,
  },
  buttons: {
    key: "buttons",
    label: "Button Style",
    schema: buttonSchema,
    defaults: BUTTON_DEFAULTS,
    resolve: resolveButtons,
  },
  shape: {
    key: "shape",
    label: "Shape",
    schema: shapeSchema,
    defaults: SHAPE_DEFAULTS,
    resolve: resolveShape,
  },
  shadows: {
    key: "shadows",
    label: "Shadows",
    schema: shadowSchema,
    defaults: SHADOW_DEFAULTS,
    resolve: resolveShadows,
  },
  spacing: {
    key: "spacing",
    label: "Spacing",
    schema: spacingSchema,
    defaults: SPACING_DEFAULTS,
    resolve: resolveSpacing,
  },
  sections: {
    key: "sections",
    label: "Sections",
    schema: sectionsSchema,
    defaults: SECTIONS_DEFAULTS,
    resolve: resolveSections,
  },
} as const;

/** Union of all category keys. */
export type DesignTokenCategoryKey = keyof typeof DESIGN_TOKEN_CATEGORIES;

/** All category settings merged into one settings object. */
export type DesignTokenSettings = {
  [K in DesignTokenCategoryKey]: (typeof DESIGN_TOKEN_CATEGORIES)[K] extends DesignTokenCategory<infer S, unknown> ? S : never;
};

/** Extract default settings for every registered category. */
export function getDesignTokenDefaults(): DesignTokenSettings {
  const defaults = {} as DesignTokenSettings;
  for (const key of Object.keys(DESIGN_TOKEN_CATEGORIES) as DesignTokenCategoryKey[]) {
    (defaults as Record<string, unknown>)[key] = DESIGN_TOKEN_CATEGORIES[key].defaults;
  }
  return defaults;
}
