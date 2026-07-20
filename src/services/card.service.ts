import type { CardDTO, EditorCardDTO, PublicCardDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import { resolveAppearanceSettings } from "@/validation/appearance";
import type { CardReadRepository, UnitOfWork, UpdateCardCommand } from "@/repositories";
import { createCardSchema, updateCardSchema, type CreateCardInput, type UpdateCardInput } from "@/validation";

export interface CardServiceDependencies { cards: CardReadRepository; unitOfWork: UnitOfWork; }
export class CardService {
  constructor(private readonly dependencies: CardServiceDependencies) {}
  async getEditorCard(id: string): Promise<EditorCardDTO> {
    const card = await this.dependencies.cards.findEditorById(id, null);
    if (!card) throw new NotFoundError("Card", id);
    return card;
  }
  async getPublicCard(slug: string): Promise<PublicCardDTO> {
    const source = await this.dependencies.cards.findRenderSourceBySlug({ slug, statuses: ["PUBLISHED"], visibilities: ["PUBLIC", "UNLISTED"], deletedAt: null });
    if (!source) throw new NotFoundError("Card", slug);
    const { customerId: _customerId, accessVersion: _accessVersion, themeConfig, ...card } = source;
    return { ...card, appearance: resolveAppearanceSettings(themeConfig), buttons: source.buttons.filter((button) => button.isVisible).map(({ isVisible: _isVisible, ...button }) => button), socialLinks: source.socialLinks.filter((link) => link.isVisible).map(({ isVisible: _isVisible, ...link }) => link) };
  }
  async create(input: CreateCardInput): Promise<CardDTO> {
    const command = createCardSchema.parse(input);
    return this.dependencies.unitOfWork.execute(async ({ cards, customers }) => {
      if (!await customers.findById(command.customerId, null)) throw new NotFoundError("Customer", command.customerId);
      return cards.create(command);
    });
  }
  async update(id: string, input: UpdateCardInput): Promise<CardDTO> {
    const command: UpdateCardCommand = updateCardSchema.parse(input);
    return this.dependencies.unitOfWork.execute(async ({ cards }) => {
      if (!await cards.findById(id, null)) throw new NotFoundError("Card", id);
      return cards.update(id, command);
    });
  }
  async archive(id: string): Promise<CardDTO> {
    return this.dependencies.unitOfWork.execute(async ({ cards }) => {
      if (!await cards.findById(id, null)) throw new NotFoundError("Card", id);
      return cards.update(id, { status: "ARCHIVED", deletedAt: new Date() });
    });
  }
}
