import type { PublicCardDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import type { CardReadRepository } from "@/repositories";
import { readPublicCardSchema, type ReadPublicCardInput } from "@/validation";
import { resolveAppearanceSettings } from "@/validation/appearance";
import { parseUseCaseInput } from "./shared";

export class ReadPublicCard {
  constructor(private readonly cards: CardReadRepository) {}
  async execute(input: ReadPublicCardInput): Promise<PublicCardDTO> {
    const { slug } = parseUseCaseInput(readPublicCardSchema, input);
    const source = await this.cards.findRenderSourceBySlug({ slug, statuses: ["PUBLISHED"], visibilities: ["PUBLIC", "UNLISTED"], deletedAt: null });
    if (!source) throw new NotFoundError("Card", slug);
    const { customerId: _customerId, accessVersion: _accessVersion, themeConfig, ...card } = source;
    return {
      ...card,
      appearance: resolveAppearanceSettings(themeConfig),
      buttons: source.buttons.filter((button) => button.isVisible).map(({ isVisible: _visible, ...button }) => button),
      socialLinks: source.socialLinks.filter((link) => link.isVisible).map(({ isVisible: _visible, ...link }) => link),
    };
  }
}
