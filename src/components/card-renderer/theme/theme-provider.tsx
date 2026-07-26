"use client";

import { type ReactNode, useMemo } from "react";
import type { AppearanceSettings } from "@/types/appearance";
import { ThemeContext } from "./theme-context";
import { resolveTokens, DEFAULT_THEME_TOKENS, type ThemeTokens } from "./theme-tokens";

export interface ThemeProviderProps {
  /** Appearance settings — when provided, tokens are resolved from them. */
  appearance?: AppearanceSettings | null;
  /** Pre-resolved tokens override (takes precedence over appearance). */
  tokens?: Partial<ThemeTokens>;
  children: ReactNode;
}

/**
 * ThemeProvider — resolves AppearanceSettings into concrete ThemeTokens
 * and provides them via React Context to all preview descendants.
 *
 * When appearance is null/undefined, falls back to Quiet Luxury defaults.
 */
export function ThemeProvider({ appearance, tokens: overrideTokens, children }: ThemeProviderProps) {
  const resolved = useMemo<ThemeTokens>(() => {
    const base = appearance ? resolveTokens(appearance) : DEFAULT_THEME_TOKENS;
    if (!overrideTokens) return base;

    return {
      colors:    { ...base.colors,    ...overrideTokens.colors },
      typography:{ ...base.typography,...overrideTokens.typography },
      shape:     { ...base.shape,     ...overrideTokens.shape },
      shadow:    { ...base.shadow,    ...overrideTokens.shadow },
      spacing:   { ...base.spacing,   ...overrideTokens.spacing },
      surface:   { ...base.surface,   ...overrideTokens.surface },
      buttonStyle: overrideTokens.buttonStyle ?? base.buttonStyle,
    };
  }, [appearance, overrideTokens]);

  return (
    <ThemeContext.Provider value={resolved}>
      {children}
    </ThemeContext.Provider>
  );
}
