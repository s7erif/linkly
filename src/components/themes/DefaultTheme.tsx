import { memo, type CSSProperties } from "react";
import type {
  CardBlockDTO,
  CardBlockKind,
  CardSectionKind,
  PublicCardDTO,
} from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import { BlockRenderer } from "./blocks/BlockRenderer";
import styles from "./default-theme.module.css";
export interface DefaultThemeProps {
  card: PublicCardDTO;
  appearance: AppearanceSettings;
}
const fonts = {
    SYSTEM: "system-ui,sans-serif",
    SANS: "Inter,system-ui,sans-serif",
    SERIF: "Georgia,serif",
  } as const,
  shadows = {
    NONE: "none",
    SMALL: "0 4px 12px rgb(15 23 42 / 10%)",
    MEDIUM: "0 16px 40px rgb(15 23 42 / 16%)",
    LARGE: "0 24px 64px rgb(15 23 42 / 24%)",
  } as const,
  sectionBlock: Record<CardSectionKind, CardBlockKind> = {
    PROFILE: "HERO",
    ABOUT: "ABOUT",
    CONTACT: "CONTACT",
    BUTTONS: "CTA_BUTTONS",
    SOCIAL_LINKS: "SOCIAL_LINKS",
  };
export function orderedVisibleBlocks(
  card: PublicCardDTO,
): readonly CardBlockDTO[] {
  if (card.blocks?.length)
    return card.blocks
      .filter((block) => block.isEnabled)
      .slice()
      .sort((a, b) => a.position - b.position);
  const sections =
    card.sections ??
    (
      [
        "PROFILE",
        "ABOUT",
        "CONTACT",
        "BUTTONS",
        "SOCIAL_LINKS",
      ] as CardSectionKind[]
    ).map((kind, position) => ({
      id: `legacy-section-${kind}`,
      kind,
      title: null,
      position,
      isVisible: true,
    }));
  return sections
    .filter((section) => section.isVisible)
    .sort((a, b) => a.position - b.position)
    .map((section, position) => ({
      id: `legacy-${sectionBlock[section.kind]}`,
      kind: sectionBlock[section.kind],
      position,
      isEnabled: true,
      config: {},
      mediaIds: [],
    }));
}
export const DefaultTheme = memo(function DefaultTheme({
  card,
  appearance,
}: DefaultThemeProps) {
  const background =
      appearance.background.style === "GRADIENT"
        ? `linear-gradient(145deg,${appearance.background.gradientFrom},${appearance.background.gradientTo})`
        : appearance.background.color,
    variables = {
      "--primary": appearance.colors.primary,
      "--accent": appearance.colors.accent,
      "--text": appearance.colors.text,
      "--muted": appearance.colors.mutedText,
      "--radius": `${appearance.borderRadius}px`,
      "--card-shadow": shadows[appearance.shadow],
      "--font": fonts[appearance.typography],
      "--background": background,
      background,
    } as CSSProperties;
  return (
    <main className={styles.viewport} style={variables}>
      <article className={styles.card}>
        {orderedVisibleBlocks(card).map((block) => (
          <div
            className={styles.blockSlot}
            data-block={block.kind}
            key={block.id}
          >
            <BlockRenderer block={block} card={card} appearance={appearance} />
          </div>
        ))}
      </article>
    </main>
  );
});
