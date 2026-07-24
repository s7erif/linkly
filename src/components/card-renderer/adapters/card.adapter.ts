import { BusinessCardView, SocialLinkView } from "../types";

export function normalizeCard(card: unknown): BusinessCardView {
  if (!card || typeof card !== "object") {
    return {
      id: "",
      templateId: "default",
      name: "Unknown",
      socialLinks: [],
    };
  }

  const data = card as Record<string, unknown>;

  // Safely parse socialLinks without throwing
  let parsedSocials: SocialLinkView[] = [];
  try {
    const rawSocials = data.socialLinks;
    if (typeof rawSocials === "string") {
      const parsed = JSON.parse(rawSocials);
      if (typeof parsed === "object" && parsed !== null) {
        parsedSocials = Object.entries(parsed).map(([platform, url]) => ({
          platform: String(platform),
          url: String(url),
        }));
      }
    } else if (Array.isArray(rawSocials)) {
      parsedSocials = rawSocials.map((link) => ({
        platform: String(link.platform || ""),
        url: String(link.url || ""),
      }));
    } else if (typeof rawSocials === "object" && rawSocials !== null) {
      parsedSocials = Object.entries(rawSocials).map(([platform, url]) => ({
        platform: String(platform),
        url: String(url),
      }));
    }
  } catch {
    // Return empty array if parsing fails
    parsedSocials = [];
  }

  // Filter out invalid links
  parsedSocials = parsedSocials.filter(
    (s) => s.platform && s.url && s.url.trim() !== ""
  );

  return {
    id: typeof data.id === "string" ? data.id : "",
    templateId: typeof data.templateId === "string" ? data.templateId : "default",
    name: typeof data.name === "string" ? data.name : "Unnamed Card",
    title: typeof data.title === "string" ? data.title : undefined,
    company: typeof data.company === "string" ? data.company : undefined,
    bio: typeof data.bio === "string" ? data.bio : undefined,
    avatar: typeof data.avatar === "string" ? data.avatar : null,
    coverImage: typeof data.coverImage === "string" ? data.coverImage : null,
    phone: typeof data.phone === "string" ? data.phone : undefined,
    email: typeof data.email === "string" ? data.email : undefined,
    website: typeof data.website === "string" ? data.website : undefined,
    address: typeof data.address === "string" ? data.address : undefined,
    socialLinks: parsedSocials,
  };
}
