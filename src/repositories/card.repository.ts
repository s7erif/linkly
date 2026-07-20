import type { Prisma } from "@/generated/prisma/client";
import type { CardDTO, EditorCardDTO, PublicCardDTO } from "@/dto";
import type { DatabaseClient } from "@/lib/database";

const profileSelect = { fullName: true, headline: true, company: true, bio: true, email: true, phone: true, website: true, address: true, countryCode: true } satisfies Prisma.CardProfileSelect;
const baseSelect = { id: true, customerId: true, themeId: true, slug: true, name: true, status: true, visibility: true, publishedAt: true, accessVersion: true, createdAt: true, updatedAt: true, profile: { select: profileSelect } } satisfies Prisma.CardSelect;
const publicSelect = { ...baseSelect, buttons: { where: { isVisible: true, deletedAt: null }, orderBy: { position: "asc" as const }, select: { id: true, label: true, url: true, position: true } }, socialLinks: { where: { isVisible: true, deletedAt: null }, orderBy: { position: "asc" as const }, select: { id: true, platform: true, label: true, url: true, position: true } } } satisfies Prisma.CardSelect;
const editorSelect = { ...baseSelect, themeConfig: true, buttons: { where: { deletedAt: null }, orderBy: { position: "asc" as const }, select: { id: true, label: true, url: true, position: true, isVisible: true } }, socialLinks: { where: { deletedAt: null }, orderBy: { position: "asc" as const }, select: { id: true, platform: true, label: true, url: true, position: true, isVisible: true } } } satisfies Prisma.CardSelect;
type CardRow = Prisma.CardGetPayload<{ select: typeof baseSelect }>;
const toDTO = (row: CardRow): CardDTO => ({ ...row });

export interface CardRepository {
  findById(id: string): Promise<CardDTO | null>;
  findEditorById(id: string): Promise<EditorCardDTO | null>;
  findPublicBySlug(slug: string): Promise<PublicCardDTO | null>;
  create(data: Prisma.CardCreateInput): Promise<CardDTO>;
  update(id: string, data: Prisma.CardUpdateInput): Promise<CardDTO>;
  archive(id: string, at: Date): Promise<CardDTO>;
}
export class PrismaCardRepository implements CardRepository {
  constructor(private readonly db: DatabaseClient) {}
  async findById(id: string) { const row = await this.db.card.findFirst({ where: { id, deletedAt: null }, select: baseSelect }); return row ? toDTO(row) : null; }
  async findEditorById(id: string) { return this.db.card.findFirst({ where: { id, deletedAt: null }, select: editorSelect }) as Promise<EditorCardDTO | null>; }
  async findPublicBySlug(slug: string) { return this.db.card.findFirst({ where: { slug, status: "PUBLISHED", visibility: { in: ["PUBLIC", "UNLISTED"] }, deletedAt: null }, select: publicSelect }) as Promise<PublicCardDTO | null>; }
  async create(data: Prisma.CardCreateInput) { return toDTO(await this.db.card.create({ data, select: baseSelect })); }
  async update(id: string, data: Prisma.CardUpdateInput) { return toDTO(await this.db.card.update({ where: { id }, data, select: baseSelect })); }
  async archive(id: string, at: Date) { return toDTO(await this.db.card.update({ where: { id }, data: { status: "ARCHIVED", deletedAt: at }, select: baseSelect })); }
}
