import type { CardDTO, EditorCardDTO, PublicCardDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import { withTransaction } from "@/lib/database";
import { PrismaCardRepository, PrismaCustomerRepository, type CardRepository } from "@/repositories";
import { createCardSchema, updateCardSchema, type CreateCardInput, type UpdateCardInput } from "@/validation";

export class CardService {
  constructor(private readonly repository?: CardRepository) {}
  async getEditorCard(id: string): Promise<EditorCardDTO> {
    const card = this.repository ? await this.repository.findEditorById(id) : await withTransaction((tx) => new PrismaCardRepository(tx).findEditorById(id));
    if (!card) throw new NotFoundError("Card", id);
    return card;
  }
  async getPublicCard(slug: string): Promise<PublicCardDTO> {
    const card = this.repository ? await this.repository.findPublicBySlug(slug) : await withTransaction((tx) => new PrismaCardRepository(tx).findPublicBySlug(slug));
    if (!card) throw new NotFoundError("Card", slug);
    return card;
  }
  async create(input: CreateCardInput): Promise<CardDTO> {
    const data = createCardSchema.parse(input);
    return withTransaction(async (tx) => {
      if (!await new PrismaCustomerRepository(tx).findById(data.customerId)) throw new NotFoundError("Customer", data.customerId);
      return new PrismaCardRepository(tx).create({
        customer: { connect: { id: data.customerId } },
        slug: data.slug,
        name: data.name,
        profile: { create: { fullName: data.fullName } },
      });
    });
  }
  async update(id: string, input: UpdateCardInput): Promise<CardDTO> {
    const data = updateCardSchema.parse(input);
    return withTransaction(async (tx) => {
      const repository = new PrismaCardRepository(tx);
      if (!await repository.findById(id)) throw new NotFoundError("Card", id);
      const { profile, ...card } = data;
      return repository.update(id, { ...card, ...(profile ? { profile: { update: profile } } : {}) });
    });
  }
  async archive(id: string): Promise<CardDTO> {
    return withTransaction(async (tx) => {
      const repository = new PrismaCardRepository(tx);
      if (!await repository.findById(id)) throw new NotFoundError("Card", id);
      return repository.archive(id, new Date());
    });
  }
}
