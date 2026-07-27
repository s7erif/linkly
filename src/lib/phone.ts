/**
 * Phone number normalization for tel: URLs.
 *
 * Normalizes user-entered phone numbers for use in tel: links.
 * Strips visual formatting (spaces, dashes, parentheses, dots),
 * applies Egyptian country-code heuristics, and validates that the
 * result is a plausible phone number — not a URL, script, or junk.
 */

/**
 * Characters that are stripped from phone input before normalization:
 * spaces, dashes, parentheses, and dots.
 */
const PHONE_FORMATTING_RE = /[\s\-().]/g;

/**
 * After stripping formatting, the result must match this pattern:
 * an optional leading + followed by 7–15 digits.
 */
const PHONE_DIGITS_RE = /^\+?\d{7,15}$/;

/**
 * Egyptian numbers often start with 01 when the country code is
 * omitted.  Detect these and prepend +20.
 */
const EGYPTIAN_LOCAL_RE = /^01[0-9]{9}$/;

/**
 * Numbers starting with a single zero but not matching the
 * Egyptian local pattern — strip the leading zero and prepend +.
 * Example: 01153914912 (11 digits, starts with 01) → +201153914912
 */
const LEADING_ZERO_RE = /^0/;

/**
 * Normalize a user-supplied phone number for use as a tel: URL value.
 *
 * - Strips spaces, dashes, parentheses, dots
 * - Recognizes Egyptian local numbers (01…) → +20 prefix
 * - Strips leading zero from other local-style numbers
 * - Validates the result is 7–15 digits with optional leading +
 * - Prepends "tel:" to produce a valid URL
 *
 * Returns the normalized "tel:+…" URL, or null if the input is not
 * a plausible phone number.
 */
export function normalizePhoneForUrl(raw: string): string | null {
  // 1. Trim and strip visual formatting
  let digits = raw.trim().replace(PHONE_FORMATTING_RE, "");

  // 2. Bail early on obviously non-phone input
  if (!digits || digits.length < 7) return null;

  // 3. Reject inputs that look like URLs, scripts, or code
  if (/^(?:https?|mailto|tel|sms|javascript|data|file|ftp):/i.test(digits)) {
    return null;
  }
  if (/[<>{}[\]()'";]/.test(digits)) return null;

  // 4. Egyptian local number heuristic: 01XXXXXXXXX → +201XXXXXXXXX
  if (EGYPTIAN_LOCAL_RE.test(digits)) {
    digits = `+2${digits}`;
  }
  // 5. Strip leading zero for local-style numbers that don't have a +
  //    e.g. 0201153914912 → +201153914912
  else if (!digits.startsWith("+") && LEADING_ZERO_RE.test(digits)) {
    digits = digits.replace(LEADING_ZERO_RE, "");
  }

  // 6. Ensure leading + for all-digit numbers
  if (!digits.startsWith("+")) {
    digits = `+${digits}`;
  }

  // 7. Final validation: only digits and a single leading +
  if (!PHONE_DIGITS_RE.test(digits)) {
    return null;
  }

  return `tel:${digits}`;
}

/**
 * Validate whether a raw input looks like it could be a phone number.
 * Lighter than normalizePhoneForUrl — doesn't transform, just checks.
 */
export function isPlausiblePhone(raw: string): boolean {
  return normalizePhoneForUrl(raw) !== null;
}
