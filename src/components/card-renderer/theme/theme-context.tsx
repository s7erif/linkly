"use client";

import { createContext } from "react";
import type { ThemeTokens } from "./theme-tokens";
import { DEFAULT_THEME_TOKENS } from "./theme-tokens";

/**
 * Theme context — holds resolved ThemeTokens for consumption by
 * all preview components. Defaults to Quiet Luxury identity tokens.
 */
export const ThemeContext = createContext<ThemeTokens>(DEFAULT_THEME_TOKENS);
