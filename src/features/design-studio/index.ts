// ═══════════════════════════════════════════════════════════════════════════
// Design Studio — Phase 2 Foundation
//
// Public API:
//   - Token categories     → define colors, typography, buttons, etc.
//   - Theme registry       → theme presets for the gallery/status-bar
//   - Auto-save            → debounced persistence hook
//
// The store gains `resetAppearance()` for factory-reset support.
// ═══════════════════════════════════════════════════════════════════════════

export {
  DESIGN_TOKEN_CATEGORIES,
  getDesignTokenDefaults,
  type DesignTokenCategory,
  type DesignTokenCategoryKey,
  type DesignTokenSettings,
  type ResolveContext,
  // Individual category types
  type ColorSettings,
  type ColorTokens,
  type TypographySettings,
  type TypographyTokens,
  type BackgroundSettings,
  type BackgroundTokens,
  type ButtonSettings,
  type ButtonTokens,
  type ShapeSettings,
  type ShapeTokens,
  type ShadowSettings,
  type ShadowTokens,
  type SpacingSettings,
  type SpacingTokens,
  type SectionsSettings,
  type SectionsTokens,
} from "./token-categories";

export { useAutoSave } from "./use-auto-save";
export {
  THEME_REGISTRY,
  THEME_BY_ID,
  toAppearanceSettings,
  type ThemePreset,
} from "./theme-registry";
