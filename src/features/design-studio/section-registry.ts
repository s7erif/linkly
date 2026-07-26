// ═══════════════════════════════════════════════════════════════════════════
// Section Registry — all renderable card sections in order of registration.
//
// Adding a new section:
//   1. Add an entry to SECTION_REGISTRY
//   2. Add its rendering case in InnerRenderer
//   3. Add its visibility flag to PreviewLayoutOptions
//   4. Done — the Layout Studio auto-discovers it.
// ═══════════════════════════════════════════════════════════════════════════

/** Ordered: the default render order for new cards. */
export const SECTION_REGISTRY = [
  { kind: "header",    label: "Profile",     icon: "User" },
  { kind: "bio",       label: "Bio",         icon: "FileText" },
  { kind: "buttons",   label: "Links",       icon: "Link" },
  { kind: "socialLinks", label: "Social",    icon: "Share2" },
  { kind: "footer",    label: "Footer",      icon: "ChevronDown" },
] as const;

export type SectionKind = (typeof SECTION_REGISTRY)[number]["kind"];

/** O(1) lookup. */
export const SECTION_BY_KIND = Object.fromEntries(
  SECTION_REGISTRY.map((s) => [s.kind, s]),
) as Record<SectionKind, (typeof SECTION_REGISTRY)[number]>;

/** Default render order (matches the visual order of a new card). */
export const DEFAULT_SECTION_ORDER: readonly SectionKind[] =
  SECTION_REGISTRY.map((s) => s.kind);
