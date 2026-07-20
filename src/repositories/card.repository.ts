import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { CardDTO, CardProfileDTO, EditorCardDTO } from "@/dto";
import type { CardLookupCriteria, CardReadRepository, CardWriteRepository, CreateCardCommand, UpdateCardCommand } from "./contracts";
import type { AppearanceSettings } from "@/types/appearance";

const profileSelect = { fullName: true, headline: true, company: true, bio: true, email: true, phone: true, website: true, address: true, countryCode: true } satisfies Prisma.CardProfileSelect;
const baseSelect = { id: true, customerId: true, themeId: true, slug: true, name: true, status: true, visibility: true, publishedAt: true, accessVersion: true, createdAt: true, updatedAt: true, profile: { select: profileSelect } } satisfies Prisma.CardSelect;
const editorSelect = { ...baseSelect, themeConfig: true, buttons: { where: { deletedAt: null }, orderBy: { position: "asc" as const }, select: { id: true, label: true, url: true, position: true, isVisible: true } }, socialLinks: { where: { deletedAt: null }, orderBy: { position: "asc" as const }, select: { id: true, platform: true, label: true, url: true, position: true, isVisible: true } } } satisfies Prisma.CardSelect;
type CardRow = Prisma.CardGetPayload<{ select: typeof baseSelect }>;
type EditorCardRow = Prisma.CardGetPayload<{ select: typeof editorSelect }>;
function mapProfile(row: CardRow["profile"]): CardProfileDTO | null {
  return row ? { fullName: row.fullName, headline: row.headline, company: row.company, bio: row.bio, email: row.email, phone: row.phone, website: row.website, address: row.address, countryCode: row.countryCode } : null;
}
function mapCard(row: CardRow): CardDTO {
  return { id: row.id, customerId: row.customerId, themeId: row.themeId, slug: row.slug, name: row.name, status: row.status, visibility: row.visibility, publishedAt: row.publishedAt, accessVersion: row.accessVersion, profile: mapProfile(row.profile), createdAt: row.createdAt, updatedAt: row.updatedAt };
}
function mapEditorCard(row: EditorCardRow): EditorCardDTO {
  return { ...mapCard(row), themeConfig: row.themeConfig ?? null, buttons: row.buttons.map((button) => ({ ...button })), socialLinks: row.socialLinks.map((link) => ({ ...link })) };
}
interface CardDatabase {
  card: Prisma.TransactionClient["card"];
}
abstract class CardRepositoryBase implements CardReadRepository {
  constructor(protected readonly db: CardDatabase) {}
  async findById(id: string, deletedAt: null | Date): Promise<CardDTO | null> {
    const row = await this.db.card.findFirst({ where: { id, deletedAt }, select: baseSelect });
    return row ? mapCard(row) : null;
  }
  async findEditorById(id: string, deletedAt: null | Date): Promise<EditorCardDTO | null> {
    const row = await this.db.card.findFirst({ where: { id, deletedAt }, select: editorSelect });
    return row ? mapEditorCard(row) : null;
  }
  async findRenderSourceBySlug(criteria: CardLookupCriteria): Promise<EditorCardDTO | null> {
    const row = await this.db.card.findFirst({ where: { slug: criteria.slug, status: { in: [...criteria.statuses] }, visibility: { in: [...criteria.visibilities] }, deletedAt: criteria.deletedAt }, select: editorSelect });
    return row ? mapEditorCard(row) : null;
  }
}
export class PrismaCardReadRepository extends CardRepositoryBase {
  constructor(db: PrismaClient) { super(db); }
}
export class PrismaCardTransactionRepository extends CardRepositoryBase implements CardWriteRepository {
  constructor(db: Prisma.TransactionClient) { super(db); }
  async create(command: CreateCardCommand): Promise<CardDTO> {
    const row = await this.db.card.create({ data: { customerId: command.customerId, slug: command.slug, name: command.name, profile: { create: { fullName: command.fullName } } }, select: baseSelect });
    return mapCard(row);
  }
  async update(id: string, command: UpdateCardCommand): Promise<CardDTO> {
    const { profile, ...card } = command;
    const row = await this.db.card.update({ where: { id }, data: { ...card, ...(profile ? { profile: { update: profile } } : {}) }, select: baseSelect });
    return mapCard(row);
  }
  async updateAppearance(cardId: string, appearance: AppearanceSettings): Promise<EditorCardDTO> {
    const row = await this.db.card.update({ where: { id: cardId }, data: { themeConfig: { colors: appearance.colors, background: appearance.background, typography: appearance.typography, buttonStyle: appearance.buttonStyle, borderRadius: appearance.borderRadius, shadow: appearance.shadow, sections: appearance.sections } }, select: editorSelect });
    return mapEditorCard(row);
  }
  async incrementAccessVersion(cardId: string): Promise<void> {
    await this.db.card.update({ where: { id: cardId }, data: { accessVersion: { increment: 1 } }, select: { id: true } });
  }
}
