import { z } from "zod";
import type { AppearanceSettings } from "@/types/appearance";

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color");
export const appearanceSettingsSchema = z.object({
  colors: z.object({ primary: color, accent: color, text: color, mutedText: color }).strict(),
  background: z.object({ style: z.enum(["SOLID", "GRADIENT"]), color, gradientFrom: color, gradientTo: color }).strict(),
  typography: z.enum(["SYSTEM", "SANS", "SERIF"]),
  buttonStyle: z.enum(["SOLID", "OUTLINE", "SOFT"]),
  borderRadius: z.number().int().min(0).max(32),
  avatarBorderRadius: z.number().int().min(0).max(32).nullable().default(null),
  shadow: z.enum(["NONE", "SMALL", "MEDIUM", "LARGE"]),
  sections: z.object({ profile: z.boolean(), bio: z.boolean(), contact: z.boolean(), buttons: z.boolean(), socialLinks: z.boolean() }).strict(),
  layout: z.object({
    alignment: z.enum(["LEFT", "CENTER", "RIGHT"]),
    width: z.enum(["NARROW", "MEDIUM", "WIDE", "FULL"]),
    spacing: z.enum(["COMPACT", "COMFORTABLE", "SPACIOUS"]),
    position: z.enum(["TOP", "INSIDE_HERO", "FLOATING", "COMPACT"]),
    container: z.enum(["FLAT", "CARD", "FLOATING_CARD", "GLASS_CARD"]),
  }).strict(),
}).strict();

export const defaultAppearanceSettings: AppearanceSettings = {
  colors: { primary: "#1d4ed8", accent: "#60a5fa", text: "#0f172a", mutedText: "#64748b" },
  background: { style: "SOLID", color: "#f8fafc", gradientFrom: "#eff6ff", gradientTo: "#f8fafc" },
  typography: "SANS", buttonStyle: "SOLID", borderRadius: 16, avatarBorderRadius: null, shadow: "MEDIUM",
  sections: { profile: true, bio: true, contact: true, buttons: true, socialLinks: true },
  layout: { alignment: "CENTER", width: "MEDIUM", spacing: "COMFORTABLE", position: "TOP", container: "FLAT" },
};

/** Canonical deserializer — merges stored JSON with defaults.  Missing fields
 *  receive their default values; existing user data is never discarded. */
export function deserializeAppearance(value: unknown): AppearanceSettings {
  const parsed = appearanceSettingsSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  // Merge stored partial data with defaults — never lose user customizations
  // just because a newly-added field is absent from an older stored JSON.
  const partial = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = {
    colors: defaultAppearanceSettings.colors,
    background: defaultAppearanceSettings.background,
    typography: partial.typography ?? defaultAppearanceSettings.typography,
    buttonStyle: partial.buttonStyle ?? defaultAppearanceSettings.buttonStyle,
    borderRadius: partial.borderRadius ?? defaultAppearanceSettings.borderRadius,
    avatarBorderRadius: partial.avatarBorderRadius ?? defaultAppearanceSettings.avatarBorderRadius,
    shadow: partial.shadow ?? defaultAppearanceSettings.shadow,
    sections: defaultAppearanceSettings.sections,
    layout: defaultAppearanceSettings.layout,
  };
  // Deep-merge only canonical keys. Unknown legacy metadata is ignored instead
  // of making an otherwise renderable card fail at runtime.
  if (typeof partial.colors === "object" && partial.colors) merged.colors = { ...defaultAppearanceSettings.colors, ...(partial.colors as Record<string, unknown>) };
  if (typeof partial.background === "object" && partial.background) merged.background = { ...defaultAppearanceSettings.background, ...(partial.background as Record<string, unknown>) };
  if (typeof partial.sections === "object" && partial.sections) merged.sections = { ...defaultAppearanceSettings.sections, ...(partial.sections as Record<string, unknown>) };
  if (typeof partial.layout === "object" && partial.layout) merged.layout = { ...defaultAppearanceSettings.layout, ...(partial.layout as Record<string, unknown>) };
  return appearanceSettingsSchema.parse(merged);
}

/** Canonical serializer — spreads the entire AppearanceSettings object.
 *  The repository never lists individual fields again. */
export function serializeAppearance(appearance: AppearanceSettings) {
  return { ...appearance };
}

// Backward-compatible alias — kept so existing callers don't break.
export const resolveAppearanceSettings = deserializeAppearance;
