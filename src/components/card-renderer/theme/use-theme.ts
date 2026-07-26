"use client";

import { useContext } from "react";
import { ThemeContext } from "./theme-context";
import type { ThemeTokens } from "./theme-tokens";

/**
 * Hook to access resolved ThemeTokens from the nearest ThemeProvider.
 */
export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}
