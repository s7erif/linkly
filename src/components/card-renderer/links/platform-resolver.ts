// ═══════════════════════════════════════════════════════════════════════════
// Platform Resolver — single source of truth for platform-derived values.
//
// No component ever queries the LINK_REGISTRY directly for rendering.
// All platform lookups go through this resolver, making it trivial to
// swap icon sets, add new platforms, or change color defaults later.
// ═══════════════════════════════════════════════════════════════════════════

import { LINK_BY_TYPE, isValidLinkType } from "@/features/links/link-registry";

/** Returns the platform color for a link type (falls back to neutral gray). */
export function getPlatformColor(type: string): string {
  if (isValidLinkType(type)) return LINK_BY_TYPE[type].defaultColor;
  return LINK_BY_TYPE["CUSTOM"].defaultColor;
}

/** Returns the human-readable platform label. */
export function getPlatformLabel(type: string): string {
  if (isValidLinkType(type)) return LINK_BY_TYPE[type].label;
  return "Link";
}

/** Returns the icon identifier for a link type (resolved by the icon mapper, not here). */
export function getPlatformIcon(type: string): string {
  if (isValidLinkType(type)) return LINK_BY_TYPE[type].icon;
  return LINK_BY_TYPE["CUSTOM"].icon;
}
