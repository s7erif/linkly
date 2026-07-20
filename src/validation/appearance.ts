import { z } from "zod";
import type { AppearanceSettings } from "@/types/appearance";

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color");
export const appearanceSettingsSchema = z.object({
  colors: z.object({ primary: color, accent: color, text: color, mutedText: color }).strict(),
  background: z.object({ style: z.enum(["SOLID", "GRADIENT"]), color, gradientFrom: color, gradientTo: color }).strict(),
  typography: z.enum(["SYSTEM", "SANS", "SERIF"]),
  buttonStyle: z.enum(["SOLID", "OUTLINE", "SOFT"]),
  borderRadius: z.number().int().min(0).max(32),
  shadow: z.enum(["NONE", "SMALL", "MEDIUM", "LARGE"]),
  sections: z.object({ profile: z.boolean(), bio: z.boolean(), contact: z.boolean(), buttons: z.boolean(), socialLinks: z.boolean() }).strict(),
}).strict();

export const defaultAppearanceSettings: AppearanceSettings = {
  colors: { primary: "#1d4ed8", accent: "#60a5fa", text: "#0f172a", mutedText: "#64748b" },
  background: { style: "SOLID", color: "#f8fafc", gradientFrom: "#eff6ff", gradientTo: "#f8fafc" },
  typography: "SANS", buttonStyle: "SOLID", borderRadius: 16, shadow: "MEDIUM",
  sections: { profile: true, bio: true, contact: true, buttons: true, socialLinks: true },
};

export function resolveAppearanceSettings(value: unknown): AppearanceSettings {
  const parsed = appearanceSettingsSchema.safeParse(value);
  return parsed.success ? parsed.data : defaultAppearanceSettings;
}
