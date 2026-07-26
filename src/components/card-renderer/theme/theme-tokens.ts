import type { AppearanceSettings, TypographyStyle, ButtonStyle, ShadowStyle } from "@/types/appearance";

// ═══════════════════════════════════════════════════════════════════════════
// Theme Token Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ThemeColorTokens {
  primary: string;
  accent: string;
  text: string;
  mutedText: string;
  surface: string;
  surfaceOverlay: string;
  outline: string;
}

export interface ThemeTypographyTokens {
  fontFamily: string;
  headingWeight: number;
  bodyWeight: number;
  headingSize: string;
  bodySize: string;
  captionSize: string;
}

export interface ThemeShapeTokens {
  radius: string;       // e.g. "16px"
  buttonRadius: string;
  avatarRadius: string;
}

export interface ThemeShadowTokens {
  card: string;
  button: string;
  elevated: string;
}

export interface ThemeSpacingTokens {
  section: string;      // e.g. "2rem"
  element: string;      // e.g. "1rem"
  tight: string;        // e.g. "0.5rem"
}

export interface ThemeSurfaceTokens {
  background: string;   // resolved CSS background value
  isGradient: boolean;
}

export interface ThemeTokens {
  colors: ThemeColorTokens;
  typography: ThemeTypographyTokens;
  shape: ThemeShapeTokens;
  shadow: ThemeShadowTokens;
  spacing: ThemeSpacingTokens;
  surface: ThemeSurfaceTokens;
  buttonStyle: ButtonStyle;
}

// ═══════════════════════════════════════════════════════════════════════════
// Default / fallback tokens (Quiet Luxury identity)
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  colors: {
    primary: "#6D5DF6",
    accent: "#9182FF",
    text: "#1A1A1A",
    mutedText: "#6B7280",
    surface: "#FFFFFF",
    surfaceOverlay: "#FCFCFD",
    outline: "#ECECEC",
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    headingWeight: 600,
    bodyWeight: 400,
    headingSize: "1.25rem",
    bodySize: "0.875rem",
    captionSize: "0.75rem",
  },
  shape: {
    radius: "32px",
    buttonRadius: "28px",
    avatarRadius: "50%",
  },
  shadow: {
    card: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)",
    button: "0 4px 12px rgba(109,93,246,0.2)",
    elevated: "0 8px 32px rgba(0,0,0,0.06)",
  },
  spacing: {
    section: "2rem",
    element: "1rem",
    tight: "0.5rem",
  },
  surface: {
    background: "#FCFCFD",
    isGradient: false,
  },
  buttonStyle: "SOLID",
};

// ═══════════════════════════════════════════════════════════════════════════
// Token resolution from AppearanceSettings
// ═══════════════════════════════════════════════════════════════════════════

const fontFamilies: Record<TypographyStyle, string> = {
  SYSTEM: "system-ui, sans-serif",
  SANS: "Inter, system-ui, sans-serif",
  SERIF: "Georgia, serif",
};

const shadowPresets: Record<ShadowStyle, { card: string; button: string; elevated: string }> = {
  NONE:     { card: "none",                                 button: "none",                                 elevated: "none" },
  SMALL:    { card: "0 2px 8px rgba(0,0,0,0.06)",          button: "0 2px 8px rgba(109,93,246,0.15)",     elevated: "0 4px 16px rgba(0,0,0,0.06)" },
  MEDIUM:   { card: "0 6px 24px rgba(0,0,0,0.09)",         button: "0 4px 16px rgba(109,93,246,0.22)",    elevated: "0 8px 32px rgba(0,0,0,0.10)" },
  LARGE:    { card: "0 16px 48px rgba(0,0,0,0.14)",        button: "0 8px 28px rgba(109,93,246,0.30)",    elevated: "0 20px 60px rgba(0,0,0,0.16)" },
};

/**
 * Resolve AppearanceSettings into concrete ThemeTokens.
 * Pure function — no side effects, no React dependency.
 */
export function resolveTokens(appearance: AppearanceSettings): ThemeTokens {
  const { colors, background, typography, buttonStyle, borderRadius, shadow } = appearance;

  const resolvedBackground =
    background.style === "GRADIENT"
      ? `linear-gradient(145deg, ${background.gradientFrom}, ${background.gradientTo})`
      : background.color;

  return {
    colors: {
      primary: colors.primary,
      accent: colors.accent,
      text: colors.text,
      mutedText: colors.mutedText,
      surface: "#FFFFFF",
      surfaceOverlay: background.style === "GRADIENT" ? "rgba(255,255,255,0.7)" : background.color,
      outline: "rgba(0,0,0,0.08)",
    },
    typography: {
      fontFamily: fontFamilies[typography],
      headingWeight: 600,
      bodyWeight: 400,
      headingSize: "1.25rem",
      bodySize: "0.875rem",
      captionSize: "0.75rem",
    },
    shape: {
      radius: `${borderRadius}px`,
      buttonRadius: `${Math.max(borderRadius - 4, 4)}px`,
      avatarRadius: appearance.avatarBorderRadius != null
        ? (appearance.avatarBorderRadius >= 32 ? "50%" : `${appearance.avatarBorderRadius}px`)
        : (borderRadius >= 32 ? "50%" : `${borderRadius}px`),
    },
    shadow: {
      card: shadowPresets[shadow].card,
      button: shadowPresets[shadow].button,
      elevated: shadowPresets[shadow].elevated,
    },
    spacing: {
      section: "2rem",
      element: "1rem",
      tight: "0.5rem",
    },
    surface: {
      background: resolvedBackground,
      isGradient: background.style === "GRADIENT",
    },
    buttonStyle,
  };
}
