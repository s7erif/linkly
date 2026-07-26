/**
 * Slugs reserved by application routes and unavailable as public card names.
 *
 * This module is deliberately runtime-agnostic so the same set can be reused
 * by server-side slug generation and client-side Workspace validation.
 */
export const RESERVED_SLUGS = new Set([
  "activate",
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "card",
  "cards",
  "dashboard",
  "help",
  "login",
  "logout",
  "register",
  "reset-password",
  "settings",
  "support",
  "workspace",
  "www",
  "welcome",
  "create-card",
  "profile",
]);

export function isSlugReserved(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}
