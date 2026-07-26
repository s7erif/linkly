export interface SocialLinkView {
  platform: string;
  url: string;
}

export interface BusinessCardView {
  id: string;
  templateId: string;
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  avatar?: string | null;
  coverImage?: string | null;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  socialLinks: SocialLinkView[];
}

/**
 * Generates a vCard 3.0 string from a BusinessCardView.
 * Used by the "Save Contact" button to trigger a .vcf file download.
 *
 * Spec reference: https://www.rfc-editor.org/rfc/rfc6350
 */
export function generateVCard(card: BusinessCardView): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
  ];

  // Full name (required)
  lines.push(`FN:${escapeVCard(card.name)}`);

  // Structured name: Last;First;Middle;Prefix;Suffix
  // We only have a display name, so put it in the "first" position
  lines.push(`N:;${escapeVCard(card.name)};;;`);

  if (card.title) {
    lines.push(`TITLE:${escapeVCard(card.title)}`);
  }

  if (card.company) {
    lines.push(`ORG:${escapeVCard(card.company)}`);
  }

  if (card.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(card.phone)}`);
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(card.email)}`);
  }

  if (card.website) {
    lines.push(`URL:${escapeVCard(card.website)}`);
  }

  if (card.address) {
    // ADR: PO Box;Extended;Street;City;Region;Postal;Country
    // We only have a freeform address, put it in the street field
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(card.address)};;;;`);
  }

  if (card.bio) {
    lines.push(`NOTE:${escapeVCard(card.bio)}`);
  }

  if (card.avatar) {
    lines.push(`PHOTO;VALUE=uri:${card.avatar}`);
  }

  // Social links as X-SOCIALPROFILE or URL entries
  for (const link of card.socialLinks) {
    if (link.url) {
      lines.push(`X-SOCIALPROFILE;TYPE=${escapeVCard(link.platform)}:${link.url}`);
    }
  }

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Escapes special vCard characters.
 * Commas, semicolons, and backslashes must be escaped.
 * Newlines become literal \n.
 */
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Triggers a VCF file download in the browser.
 */
export function downloadVCard(card: BusinessCardView): void {
  const vcf = generateVCard(card);
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${card.name.replace(/\s+/g, "_") || "contact"}.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
