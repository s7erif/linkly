// ═══════════════════════════════════════════════════════════════════════════
// Advanced Color System — semantic token derivation from base colors.
//
// The store only stores 4 base colors (primary, accent, text, mutedText).
// This module derives the other 7 semantic tokens from those 4 using
// color-theory heuristics, giving the impression of a full 11-color palette
// without adding storage fields.
//
// Palette presets only set the 4 base colors — typography, spacing, etc.
// are left untouched so the user can swap color schemes independently.
// ═══════════════════════════════════════════════════════════════════════════

// ── Full semantic color token set ──────────────────────────────────────────

export interface SemanticColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
}

// ── Color manipulation helpers ─────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

function darken(hex: string, amount: number): string {
  return lighten(hex, -amount);
}

function mix(a: string, b: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(
    Math.round(r1 * (1 - ratio) + r2 * ratio),
    Math.round(g1 * (1 - ratio) + g2 * ratio),
    Math.round(b1 * (1 - ratio) + b2 * ratio),
  );
}

// ── Derive semantic tokens from base 4 colors ──────────────────────────────

export function deriveSemanticColors(colors: {
  primary: string;
  accent: string;
  text: string;
  mutedText: string;
}): SemanticColors {
  return {
    primary:     colors.primary,
    secondary:   mix(colors.primary, colors.mutedText, 0.55),
    accent:      colors.accent,
    background:  lighten(colors.primary, 220),
    surface:     lighten(colors.primary, 235),
    text:        colors.text,
    mutedText:   colors.mutedText,
    border:      mix(colors.mutedText, "#FFFFFF", 0.85),
    success:     "#16A34A",
    warning:     "#D97706",
    danger:      "#DC2626",
  };
}

// ── Color palettes (only modify colors, leave everything else alone) ───────

export interface ColorPalette {
  id: string;
  name: string;
  colors: { primary: string; accent: string; text: string; mutedText: string };
}

export const COLOR_PALETTES: readonly ColorPalette[] = [
  { id: "ocean",      name: "Ocean",      colors: { primary: "#0369A1", accent: "#2DD4BF", text: "#0F172A", mutedText: "#475569" } },
  { id: "forest",     name: "Forest",     colors: { primary: "#166534", accent: "#4ADE80", text: "#0F172A", mutedText: "#475569" } },
  { id: "sunset",     name: "Sunset",     colors: { primary: "#C2410C", accent: "#F97316", text: "#1C1917", mutedText: "#78716C" } },
  { id: "midnight",   name: "Midnight",   colors: { primary: "#4F46E5", accent: "#818CF8", text: "#1E1B4B", mutedText: "#6B7280" } },
  { id: "lavender",   name: "Lavender",   colors: { primary: "#7C3AED", accent: "#C084FC", text: "#1E1B4B", mutedText: "#6B7280" } },
  { id: "corporate",  name: "Corporate",  colors: { primary: "#1E40AF", accent: "#3B82F6", text: "#0F172A", mutedText: "#475569" } },
  { id: "emerald",    name: "Emerald",    colors: { primary: "#047857", accent: "#34D399", text: "#0F172A", mutedText: "#475569" } },
  { id: "rose",       name: "Rose",       colors: { primary: "#BE123C", accent: "#FB7185", text: "#1C1917", mutedText: "#78716C" } },
  { id: "monochrome", name: "Monochrome", colors: { primary: "#18181B", accent: "#71717A", text: "#09090B", mutedText: "#71717A" } },
  { id: "warm",       name: "Warm",       colors: { primary: "#B45309", accent: "#D97706", text: "#1C1917", mutedText: "#78716C" } },
];

// ── WCAG contrast ratio (AA = 4.5 for normal text, 3.0 for large) ─────────

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg), l2 = luminance(bg);
  const l = Math.max(l1, l2), d = Math.min(l1, l2);
  return (l + 0.05) / (d + 0.05);
}

export function contrastStatus(fg: string, bg: string): "pass" | "warn" | "fail" {
  const ratio = contrastRatio(fg, bg);
  if (ratio >= 4.5) return "pass";
  if (ratio >= 3.0) return "warn";
  return "fail";
}

// ── Recent colors (sessionStorage-backed, max 10) ──────────────────────────

const RECENT_KEY = "design-studio:recent-colors";

export function getRecentColors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

export function addRecentColor(color: string): void {
  if (typeof window === "undefined") return;
  const recent = getRecentColors().filter((c) => c !== color);
  recent.unshift(color);
  sessionStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 10)));
}
