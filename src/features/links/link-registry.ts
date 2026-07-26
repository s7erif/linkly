// ═══════════════════════════════════════════════════════════════════════════
// Link Type Registry — single source of truth for every supported link type.
//
// The UI must never hardcode platform names. Everything is derived from
// this registry via LINK_REGISTRY and the LINK_BY_TYPE lookup map.
// ═══════════════════════════════════════════════════════════════════════════

export type LinkTypeId =
  | "WEBSITE"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "THREADS"
  | "X"
  | "TIKTOK"
  | "YOUTUBE"
  | "LINKEDIN"
  | "GITHUB"
  | "DISCORD"
  | "TELEGRAM"
  | "WHATSAPP"
  | "SPOTIFY"
  | "SOUNDCLOUD"
  | "PINTEREST"
  | "SNAPCHAT"
  | "REDDIT"
  | "MEDIUM"
  | "SUBSTACK"
  | "CALENDLY"
  | "PAYPAL"
  | "STRIPE"
  | "EMAIL"
  | "PHONE"
  | "CUSTOM";

export type LinkCategory =
  | "Social"
  | "Business"
  | "Communication"
  | "Developer"
  | "Streaming"
  | "Commerce"
  | "Other";

export interface LinkTypeDefinition {
  id: LinkTypeId;
  label: string;
  category: LinkCategory;
  defaultColor: string;
  /** Placeholder shown when URL field is empty. */
  urlPlaceholder: string;
  /** Prefix auto-prepended when a bare value is entered (e.g. "@" → "https://instagram.com/"). */
  urlPrefix?: string;
  /** Validation pattern for the URL (beyond basic URL parsing). */
  pattern?: RegExp;
  /** Icon identifier — resolved by the UI. */
  icon: string;
}

/** Category groups for the platform picker (ordered). */
export const LINK_CATEGORIES: readonly LinkCategory[] = [
  "Social",
  "Business",
  "Communication",
  "Developer",
  "Streaming",
  "Commerce",
  "Other",
];

export const LINK_REGISTRY: readonly LinkTypeDefinition[] = [
  { id: "WEBSITE",    label: "Website",    category: "Business",       defaultColor: "#4F46E5", urlPlaceholder: "https://yourwebsite.com",     icon: "Globe" },
  { id: "INSTAGRAM",  label: "Instagram",  category: "Social",         defaultColor: "#E4405F", urlPlaceholder: "https://instagram.com/username", urlPrefix: "https://instagram.com/", icon: "Instagram" },
  { id: "FACEBOOK",   label: "Facebook",   category: "Social",         defaultColor: "#1877F2", urlPlaceholder: "https://facebook.com/username",  urlPrefix: "https://facebook.com/",  icon: "Facebook" },
  { id: "THREADS",    label: "Threads",    category: "Social",         defaultColor: "#000000", urlPlaceholder: "https://threads.net/@username",   urlPrefix: "https://threads.net/@", icon: "Threads" },
  { id: "X",          label: "X (Twitter)",category: "Social",         defaultColor: "#0F172A", urlPlaceholder: "https://x.com/username",         urlPrefix: "https://x.com/",        icon: "Twitter" },
  { id: "TIKTOK",     label: "TikTok",     category: "Social",         defaultColor: "#000000", urlPlaceholder: "https://tiktok.com/@username",    urlPrefix: "https://tiktok.com/@",  icon: "TikTok" },
  { id: "YOUTUBE",    label: "YouTube",    category: "Streaming",      defaultColor: "#FF0000", urlPlaceholder: "https://youtube.com/@channel",    urlPrefix: "https://youtube.com/@", icon: "Youtube" },
  { id: "LINKEDIN",   label: "LinkedIn",   category: "Business",       defaultColor: "#0A66C2", urlPlaceholder: "https://linkedin.com/in/username",urlPrefix: "https://linkedin.com/in/",icon: "Linkedin" },
  { id: "GITHUB",     label: "GitHub",     category: "Developer",      defaultColor: "#24292E", urlPlaceholder: "https://github.com/username",    urlPrefix: "https://github.com/",   icon: "Github" },
  { id: "DISCORD",    label: "Discord",    category: "Communication",  defaultColor: "#5865F2", urlPlaceholder: "https://discord.gg/invite",      urlPrefix: "https://discord.gg/",   icon: "Discord" },
  { id: "TELEGRAM",   label: "Telegram",   category: "Communication",  defaultColor: "#26A5E4", urlPlaceholder: "https://t.me/username",          urlPrefix: "https://t.me/",         icon: "Telegram" },
  { id: "WHATSAPP",   label: "WhatsApp",   category: "Communication",  defaultColor: "#25D366", urlPlaceholder: "https://wa.me/123456789",        urlPrefix: "https://wa.me/",        icon: "Whatsapp" },
  { id: "SPOTIFY",    label: "Spotify",    category: "Streaming",      defaultColor: "#1DB954", urlPlaceholder: "https://open.spotify.com/artist/...",icon: "Spotify" },
  { id: "SOUNDCLOUD", label: "SoundCloud", category: "Streaming",      defaultColor: "#FF5500", urlPlaceholder: "https://soundcloud.com/username",icon: "Soundcloud" },
  { id: "PINTEREST",  label: "Pinterest",  category: "Social",         defaultColor: "#E60023", urlPlaceholder: "https://pinterest.com/username", urlPrefix: "https://pinterest.com/",icon: "Pinterest" },
  { id: "SNAPCHAT",   label: "Snapchat",   category: "Social",         defaultColor: "#D97706", urlPlaceholder: "https://snapchat.com/add/username",urlPrefix: "https://snapchat.com/add/",icon: "Snapchat" },
  { id: "REDDIT",     label: "Reddit",     category: "Social",         defaultColor: "#FF4500", urlPlaceholder: "https://reddit.com/user/username",urlPrefix: "https://reddit.com/user/",icon: "Reddit" },
  { id: "MEDIUM",     label: "Medium",     category: "Social",         defaultColor: "#000000", urlPlaceholder: "https://medium.com/@username",    urlPrefix: "https://medium.com/@",  icon: "Medium" },
  { id: "SUBSTACK",   label: "Substack",   category: "Social",         defaultColor: "#FF6719", urlPlaceholder: "https://username.substack.com",  icon: "Substack" },
  { id: "CALENDLY",   label: "Calendly",   category: "Business",       defaultColor: "#006BFF", urlPlaceholder: "https://calendly.com/username",   urlPrefix: "https://calendly.com/", icon: "Calendar" },
  { id: "PAYPAL",     label: "PayPal",     category: "Commerce",       defaultColor: "#003087", urlPlaceholder: "https://paypal.me/username",      urlPrefix: "https://paypal.me/",    icon: "Paypal" },
  { id: "STRIPE",     label: "Stripe",     category: "Commerce",       defaultColor: "#635BFF", urlPlaceholder: "https://buy.stripe.com/...",      icon: "Stripe" },
  { id: "EMAIL",      label: "Email",      category: "Communication",  defaultColor: "#EA4335", urlPlaceholder: "mailto:hello@example.com",       icon: "Mail" },
  { id: "PHONE",      label: "Phone",      category: "Communication",  defaultColor: "#16A34A", urlPlaceholder: "tel:+1234567890",               icon: "Phone" },
  { id: "CUSTOM",     label: "Custom Link",category: "Other",          defaultColor: "#64748B", urlPlaceholder: "https://...",                   icon: "Link" },
];

/** O(1) lookup: LINK_BY_TYPE["INSTAGRAM"] → LinkTypeDefinition */
export const LINK_BY_TYPE: Record<LinkTypeId, LinkTypeDefinition> =
  Object.fromEntries(
    LINK_REGISTRY.map((def) => [def.id, def]),
  ) as Record<LinkTypeId, LinkTypeDefinition>;

/** Validate a link type id is in the registry. */
export function isValidLinkType(id: string): id is LinkTypeId {
  return id in LINK_BY_TYPE;
}
