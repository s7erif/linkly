import type { CardBlockKind, CardSectionKind, PublicCardDTO } from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import type {
  CardRendererData,
  CardRendererLayoutOptions,
  CardRendererProps,
} from "./types";

const DEFAULT_SECTION_ORDER = [
  "header",
  "bio",
  "buttons",
  "socialLinks",
  "footer",
] as const;

const blockSection: Record<CardBlockKind, string> = {
  HERO: "header",
  ABOUT: "bio",
  CONTACT: "contact",
  CTA_BUTTONS: "buttons",
  SOCIAL_LINKS: "socialLinks",
  GALLERY: "GALLERY",
  VIDEO: "VIDEO",
  FAQ: "FAQ",
  LOCATION_MAP: "LOCATION_MAP",
  DIVIDER: "DIVIDER",
  RICH_TEXT: "RICH_TEXT",
};

const legacySection: Record<CardSectionKind, string> = {
  PROFILE: "header",
  ABOUT: "bio",
  CONTACT: "contact",
  BUTTONS: "buttons",
  SOCIAL_LINKS: "socialLinks",
};

export function resolveRendererSectionOrder(
  card: Pick<PublicCardDTO, "blocks" | "sections">,
): readonly string[] {
  const blocks = card.blocks
    ?.filter((block) => block.isEnabled)
    .slice()
    .sort((a, b) => a.position - b.position);
  const sections = blocks?.length
    ? blocks.map((block) => blockSection[block.kind])
    : card.sections
        ?.filter((section) => section.isVisible)
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((section) => legacySection[section.kind]);

  return sections?.length
    ? [...new Set([...sections, "footer"])]
    : DEFAULT_SECTION_ORDER;
}

export function resolveRendererLayout(
  appearance: AppearanceSettings,
  sectionOrder: readonly string[] = DEFAULT_SECTION_ORDER,
): CardRendererLayoutOptions {
  return {
    showHeader:
      appearance.sections.profile && sectionOrder.includes("header"),
    showBio: appearance.sections.bio && sectionOrder.includes("bio"),
    showButtons:
      appearance.sections.buttons && sectionOrder.includes("buttons"),
    showSocialLinks:
      appearance.sections.socialLinks && sectionOrder.includes("socialLinks"),
    showFooter: sectionOrder.includes("footer"),
    sectionOrder,
    ...appearance.layout,
  };
}

export function toRendererData(card: PublicCardDTO): CardRendererData {
  return {
    profile: card.profile,
    buttons: card.buttons.map((button) => ({
      id: button.id,
      label: button.label,
      url: button.url,
      type: button.type,
      displayMode: button.displayMode,
      color: button.color,
    })),
    socialLinks: card.socialLinks.map((link) => ({
      id: link.id,
      platform: link.platform,
      label: link.label,
      url: link.url,
    })),
    blocks: card.blocks,
  };
}

export function toCardRendererProps(card: PublicCardDTO): CardRendererProps {
  const sectionOrder = resolveRendererSectionOrder(card);
  return {
    data: toRendererData(card),
    appearance: card.appearance,
    layout: resolveRendererLayout(card.appearance, sectionOrder),
    avatarUrl: card.avatarUrl ?? card.profile?.avatarUrl ?? null,
  };
}
