import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { LegacyBusinessCardDTO, LegacySocialLinkDTO, LegacyUserDTO } from "@/dto";
import type { LegacyCardPatchCommand, LegacyCardWriteCommand, LegacyLinkCommand, LegacyReadRepository, LegacyWriteRepository } from "./contracts";

const cardSelect = { id: true, name: true, title: true, company: true, address: true, phone: true, email: true, website: true, bio: true, avatar: true, backgroundImage: true, socialLinksJson: true, templateId: true, urlHash: true, slug: true, isActive: true, createTime: true, updateTime: true } satisfies Prisma.LegacyBusinessCardSelect;
type CardRow = Prisma.LegacyBusinessCardGetPayload<{ select: typeof cardSelect }>;
const mapCard = (row: CardRow): LegacyBusinessCardDTO => ({ id: row.id, name: row.name, title: row.title, company: row.company, address: row.address, phone: row.phone, email: row.email, website: row.website, bio: row.bio, avatar: row.avatar, backgroundImage: row.backgroundImage, socialLinks: row.socialLinksJson, templateId: row.templateId, urlHash: row.urlHash, slug: row.slug, isActive: row.isActive, createTime: row.createTime, updateTime: row.updateTime, userId: row.id });
interface LegacyDatabase {
  legacyBusinessCard: Prisma.TransactionClient["legacyBusinessCard"];
}
abstract class LegacyRepositoryBase implements LegacyReadRepository {
  constructor(protected readonly db: LegacyDatabase) {}
  async listCardsByUser(): Promise<LegacyBusinessCardDTO[]> { return []; }
  async findCardByIdAndUser(): Promise<LegacyBusinessCardDTO | null> { return null; }
  async findCardByHash(urlHash: string): Promise<LegacyBusinessCardDTO | null> { const row = await this.db.legacyBusinessCard.findUnique({ where: { urlHash }, select: cardSelect }); return row ? mapCard(row) : null; }
  async cardHashExists(urlHash: string): Promise<boolean> { return await this.db.legacyBusinessCard.count({ where: { urlHash } }) > 0; }
  async cardSlugExists(slug: string): Promise<boolean> { return await this.db.legacyBusinessCard.count({ where: { slug } }) > 0; }
  async listLinks(): Promise<LegacySocialLinkDTO[]> { return []; }
  async findUserByEmail(): Promise<LegacyUserDTO | null> { return null; }
}
export class PrismaLegacyReadRepository extends LegacyRepositoryBase {
  constructor(db: PrismaClient) { super(db); }
}
export class PrismaLegacyTransactionRepository extends LegacyRepositoryBase implements LegacyWriteRepository {
  constructor(db: Prisma.TransactionClient) { super(db); }
  async createCard(_command: LegacyCardWriteCommand & { userId: string; urlHash: string; slug: string }): Promise<LegacyBusinessCardDTO> {
    throw new Error("The legacy card API has been retired");
  }
  async updateCard(_id: string, _command: LegacyCardPatchCommand): Promise<LegacyBusinessCardDTO> { throw new Error("The legacy card API has been retired"); }
  async deleteCard(): Promise<void> { throw new Error("The legacy card API has been retired"); }
  async replaceLinks(_businessCardId: string, _links: readonly LegacyLinkCommand[]): Promise<LegacySocialLinkDTO[]> { throw new Error("The legacy card API has been retired"); }
  async deleteLinks(): Promise<void> { throw new Error("The legacy card API has been retired"); }
  async createUser(): Promise<LegacyUserDTO> { throw new Error("The legacy card API has been retired"); }
}
