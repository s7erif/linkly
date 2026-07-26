import { z } from "zod";

// ── Shared field-level schemas — used by both client and server ──────

export const emailField = z.string().email("Enter a valid email address").nullable();

export const phoneField = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()\-.]{7,40}$/, "Enter a valid phone number")
  .nullable();

export const websiteField = z.string().url("Website URL is invalid").nullable();

const ISO_COUNTRIES = new Set([
  "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ",
  "CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ",
  "DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET",
  "FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY",
  "HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT",
  "JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ",
  "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
  "MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ",
  "NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM",
  "PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA",
  "RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ",
  "TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
  "UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","YE","YT","ZA","ZM","ZW",
]);

export const countryCodeField = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => !value || ISO_COUNTRIES.has(value), "Enter a valid 2-letter country code")
  .nullable();

// ── Profile validation (shared client + server) ─────────────────────

export const profileFieldsSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  headline: z.string().trim().max(160).nullable(),
  company: z.string().trim().max(160).nullable(),
  bio: z.string().trim().max(2000).nullable(),
  email: emailField,
  phone: phoneField,
  website: websiteField,
  address: z.string().trim().max(300).nullable(),
  countryCode: countryCodeField,
});

export type ProfileFields = z.infer<typeof profileFieldsSchema>;
export type ProfileFieldKey = keyof ProfileFields;

// ── Client-side normalization + validation ──────────────────────────

/**
 * Normalize user-friendly input before validation.
 * - Website: prepend https:// if missing
 * - Country code: uppercase
 */
export function normalizeProfileFields(data: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...data };
  if (typeof normalized.website === "string" && normalized.website && !/^https?:\/\//i.test(normalized.website) && /^[\w.-]+\.[a-z]{2,}/i.test(normalized.website)) {
    normalized.website = `https://${normalized.website}`;
  }
  if (typeof normalized.countryCode === "string" && normalized.countryCode) {
    normalized.countryCode = normalized.countryCode.toUpperCase();
  }
  return normalized;
}

/** Client-side validation — returns field→error map or null if valid */
export function validateProfileFields(data: Partial<ProfileFields>): Partial<Record<ProfileFieldKey, string>> | null {
  const normalized = normalizeProfileFields(data as Record<string, unknown>);
  const result = profileFieldsSchema.safeParse(normalized);
  if (result.success) return null;
  const errors: Partial<Record<ProfileFieldKey, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as ProfileFieldKey;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return Object.keys(errors).length ? errors : null;
}
