import { randomBytes } from "node:crypto";

/**
 * Slugs that are reserved and cannot be used as card public links.
 * Merged from activation reserved set + route conflicts.
 */
export const RESERVED_SLUGS = new Set([
  // Existing from activation validation
  "activate", "admin", "api", "app", "auth", "billing", "card", "cards",
  "dashboard", "help", "login", "logout", "register", "reset-password",
  "settings", "support", "workspace", "www",
  // Additional route conflicts (user spec)
  "welcome", "access", "register", "create-card", "profile",
]);

/** Readable suffixes tried in order when generating additional card slugs. */
const READABLE_SUFFIXES = [
  "business", "office", "work", "events",
  "store", "company",
];

/** Numeric suffixes tried after readable ones are exhausted. */
const NUMERIC_SUFFIXES = [2, 3, 4];

/**
 * Normalize a display name into a URL-safe slug segment.
 * NFKD → strip combining marks → lowercase → replace non-alnum with "-" →
 * strip leading/trailing "-" → truncate → strip trailing "-" again.
 */
export function slugify(text: string, maxLen: number): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLen)
    .replace(/-$/g, "");
}

/** Check whether a slug is in the reserved set. */
export function isSlugReserved(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

/**
 * Generate an account username from a display name.
 * Uses only the clean base — no random suffix.
 * Falls back to "user" if the name produces nothing usable.
 */
export function generateAccountUsername(displayName: string): string {
  const base = slugify(displayName, 30) || "user";
  // If the base is reserved, prefix it
  if (RESERVED_SLUGS.has(base)) {
    return `${base}-card`;
  }
  return base;
}

/**
 * Build an ordered list of suggested card slugs given an account username
 * and a set of already-taken slugs.
 *
 * Priority order:
 *   1. The bare username (for the first card)
 *   2. Readable suffixes: -business, -office, -events, -work, -store, -company, -contact, -info
 *   3. Numeric suffixes: -2, -3, -4, …
 *   4. Fallback: card-xxxxxxxx (random hex)
 */
export function suggestCardSlugs(
  baseUsername: string,
  existingSlugs: ReadonlySet<string>,
): string[] {
  const suggestions: string[] = [];

  // 1. Bare username
  if (!existingSlugs.has(baseUsername) && !RESERVED_SLUGS.has(baseUsername)) {
    suggestions.push(baseUsername);
  }

  // 2. Readable suffixes
  for (const suffix of READABLE_SUFFIXES) {
    const candidate = `${baseUsername}-${suffix}`;
    if (!existingSlugs.has(candidate) && candidate.length <= 80) {
      suggestions.push(candidate);
    }
  }

  // 3. Numeric suffixes
  for (const n of NUMERIC_SUFFIXES) {
    const candidate = `${baseUsername}-${n}`;
    if (!existingSlugs.has(candidate) && candidate.length <= 80) {
      suggestions.push(candidate);
    }
  }

  // 4. Fallback: random hex suffix
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `card-${randomBytes(3).toString("hex")}`;
    if (!existingSlugs.has(candidate)) {
      suggestions.push(candidate);
      break;
    }
  }

  return suggestions;
}

/**
 * Pick the first available slug from the suggestion list.
 * Returns null if every option is taken (should be extraordinarily rare).
 */
export function generateCardSlug(
  baseUsername: string,
  existingSlugs: ReadonlySet<string>,
): string {
  const suggestions = suggestCardSlugs(baseUsername, existingSlugs);
  if (suggestions.length > 0) return suggestions[0];
  // Last-resort fallback — loop until we find an unused hex slug
  for (;;) {
    const candidate = `card-${randomBytes(4).toString("hex")}`;
    if (!existingSlugs.has(candidate)) return candidate;
  }
}
