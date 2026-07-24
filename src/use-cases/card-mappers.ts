import type {
  CardBlockDTO,
  CardBlockKind,
  CardSectionKind,
  EditorCardDTO,
  PublicCardDTO,
  WorkspaceCardDTO,
} from "@/dto";
import { resolveAppearanceSettings } from "@/validation/appearance";
import { safeCardBlockConfig } from "@/validation/card-block";
const sectionBlock: Record<CardSectionKind, CardBlockKind> = {
  PROFILE: "HERO",
  ABOUT: "ABOUT",
  CONTACT: "CONTACT",
  BUTTONS: "CTA_BUTTONS",
  SOCIAL_LINKS: "SOCIAL_LINKS",
};
function compatibilityBlocks(source: EditorCardDTO): readonly CardBlockDTO[] {
  const sections =
    source.sections ??
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
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((section, position) => ({
      id: `legacy-${sectionBlock[section.kind].toLowerCase()}`,
      kind: sectionBlock[section.kind],
      position,
      isEnabled: section.isVisible,
      config: {},
      mediaIds: [],
    }));
}
function persistedBlocks(source: EditorCardDTO): readonly CardBlockDTO[] {
  const mapped = (source.blocks ?? []).flatMap((block) => {
    const valid = safeCardBlockConfig(block.kind, block.config);
    return valid
      ? [
          {
            id: block.id,
            kind: valid.kind,
            position: block.position,
            isEnabled: block.isEnabled,
            config: valid.config,
            mediaIds: block.mediaIds,
          },
        ]
      : [];
  });
  return mapped.length
    ? mapped.sort((a, b) => a.position - b.position)
    : compatibilityBlocks(source);
}
export function toRenderableCardDTO(source: EditorCardDTO): PublicCardDTO {
  const {
    customerId: _customerId,
    accessVersion: _accessVersion,
    themeConfig,
    blocks: _blocks,
    ...card
  } = source;
  return {
    ...card,
    appearance: resolveAppearanceSettings(themeConfig),
    blocks: persistedBlocks(source).filter((block) => block.isEnabled),
    buttons: source.buttons
      .filter((button) => button.isVisible)
      .map(({ isVisible: _isVisible, ...button }) => button),
    socialLinks: source.socialLinks
      .filter((link) => link.isVisible)
      .map(({ isVisible: _isVisible, ...link }) => link),
  };
}
export function toWorkspaceCardDTO(source: EditorCardDTO): WorkspaceCardDTO {
  return {
    ...toRenderableCardDTO(source),
    editorButtons: source.buttons.map((button) => ({ ...button })),
    editorSocialLinks: source.socialLinks.map((link) => ({ ...link })),
    editorBlocks: persistedBlocks(source),
  };
}
