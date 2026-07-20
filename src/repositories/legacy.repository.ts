import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { LegacyBusinessCardDTO, LegacySocialLinkDTO, LegacyUserDTO } from "@/dto";
import type { LegacyCardPatchCommand, LegacyCardWriteCommand, LegacyLinkCommand, LegacyReadRepository, LegacyWriteRepository } from "./contracts";

const cardSelect = { id: true, name: true, title: true, company: true, address: true, phone: true, email: true, website: true, bio: true, avatar: true, backgroundImage: true, socialLinksJson: true, templateId: true, urlHash: true, slug: true, isActive: true, createTime: true, updateTime: true, userId: true } satisfies Prisma.LegacyBusinessCardSelect;
const linkSelect = { id: true, businessCardId: true, platform: true, url: true, order: true, createdAt: true } satisfies Prisma.LegacySocialLinkSelect;
const userSelect = { id: true, name: true, email: true } satisfies Prisma.LegacyUserSelect;
type CardRow = Prisma.LegacyBusinessCardGetPayload<{ select: typeof cardSelect }>;
type LinkRow = Prisma.LegacySocialLinkGetPayload<{ select: typeof linkSelect }>;
type UserRow = Prisma.LegacyUserGetPayload<{ select: typeof userSelect }>;
const mapCard = (row: CardRow): LegacyBusinessCardDTO => ({ id: row.id, name: row.name, title: row.title, company: row.company, address: row.address, phone: row.phone, email: row.email, website: row.website, bio: row.bio, avatar: row.avatar, backgroundImage: row.backgroundImage, socialLinks: row.socialLinksJson, templateId: row.templateId, urlHash: row.urlHash, slug: row.slug, isActive: row.isActive, createTime: row.createTime, updateTime: row.updateTime, userId: row.userId });
const mapLink = (row: LinkRow): LegacySocialLinkDTO => ({ ...row });
const mapUser = (row: UserRow): LegacyUserDTO => ({ ...row });
interface LegacyDatabase {
  legacyBusinessCard: Prisma.TransactionClient["legacyBusinessCard"];
  legacySocialLink: Prisma.TransactionClient["legacySocialLink"];
  legacyUser: Prisma.TransactionClient["legacyUser"];
}
abstract class LegacyRepositoryBase implements LegacyReadRepository {
  constructor(protected readonly db: LegacyDatabase) {}
  async listCardsByUser(userId: string): Promise<LegacyBusinessCardDTO[]> { return (await this.db.legacyBusinessCard.findMany({ where: { userId }, orderBy: { createTime: "desc" }, select: cardSelect })).map(mapCard); }
  async findCardByIdAndUser(id: string, userId: string): Promise<LegacyBusinessCardDTO | null> { const row = await this.db.legacyBusinessCard.findFirst({ where: { id, userId }, select: cardSelect }); return row ? mapCard(row) : null; }
  async findCardByHash(urlHash: string): Promise<LegacyBusinessCardDTO | null> { const row = await this.db.legacyBusinessCard.findUnique({ where: { urlHash }, select: cardSelect }); return row ? mapCard(row) : null; }
  async cardHashExists(urlHash: string): Promise<boolean> { return await this.db.legacyBusinessCard.count({ where: { urlHash } }) > 0; }
  async cardSlugExists(slug: string): Promise<boolean> { return await this.db.legacyBusinessCard.count({ where: { slug } }) > 0; }
  async listLinks(businessCardId: string): Promise<LegacySocialLinkDTO[]> { return (await this.db.legacySocialLink.findMany({ where: { businessCardId }, orderBy: { order: "asc" }, select: linkSelect })).map(mapLink); }
  async findUserByEmail(email: string): Promise<LegacyUserDTO | null> { const row = await this.db.legacyUser.findFirst({ where: { email }, select: userSelect }); return row ? mapUser(row) : null; }
}
export class PrismaLegacyReadRepository extends LegacyRepositoryBase {
  constructor(db: PrismaClient) { super(db); }
}
export class PrismaLegacyTransactionRepository extends LegacyRepositoryBase implements LegacyWriteRepository {
  constructor(db: Prisma.TransactionClient) { super(db); }
  async createCard(command: LegacyCardWriteCommand & { userId: string; urlHash: string; slug: string }): Promise<LegacyBusinessCardDTO> {
    const { socialLinks, ...data } = command;
    return mapCard(await this.db.legacyBusinessCard.create({ data: { ...data, socialLinksJson: socialLinks }, select: cardSelect }));
  }
  async updateCard(id: string, command: LegacyCardPatchCommand): Promise<LegacyBusinessCardDTO> {
    const { socialLinks, ...data } = command;
    return mapCard(await this.db.legacyBusinessCard.update({ where: { id }, data: { ...data, ...(socialLinks === undefined ? {} : { socialLinksJson: socialLinks }) }, select: cardSelect }));
  }
  async deleteCard(id: string): Promise<void> { await this.db.legacyBusinessCard.delete({ where: { id }, select: { id: true } }); }
  async replaceLinks(businessCardId: string, links: readonly LegacyLinkCommand[]): Promise<LegacySocialLinkDTO[]> {
    await this.db.legacySocialLink.deleteMany({ where: { businessCardId } });
    if (links.length) await this.db.legacySocialLink.createMany({ data: links.map((link) => ({ businessCardId, ...link })) });
    return this.listLinks(businessCardId);
  }
  async deleteLinks(businessCardId: string): Promise<void> { await this.db.legacySocialLink.deleteMany({ where: { businessCardId } }); }
  async createUser(command: { name: string; email: string }): Promise<LegacyUserDTO> { return mapUser(await this.db.legacyUser.create({ data: command, select: userSelect })); }
}
