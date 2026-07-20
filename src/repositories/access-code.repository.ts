import type { Prisma } from "@/generated/prisma/client";
import type { AccessCodeDTO } from "@/dto";
import type { DatabaseClient } from "@/lib/database";

const accessCodeSelect = { id: true, cardId: true, version: true, status: true, expiresAt: true, lastUsedAt: true, useCount: true, createdAt: true, revokedAt: true } satisfies Prisma.AccessCodeSelect;
type AccessCodeRow = Prisma.AccessCodeGetPayload<{ select: typeof accessCodeSelect }>;
const toDTO = (row: AccessCodeRow): AccessCodeDTO => ({ ...row });

export interface AccessCodeRepository {
  findActiveByHash(hash: Uint8Array<ArrayBuffer>): Promise<AccessCodeDTO | null>;
  findActiveByCard(cardId: string): Promise<AccessCodeDTO | null>;
  nextVersion(cardId: string): Promise<number>;
  create(data: Prisma.AccessCodeCreateInput): Promise<AccessCodeDTO>;
  revokeActive(cardId: string, at: Date, replacementStatus?: "ROTATED" | "REVOKED"): Promise<number>;
}
export class PrismaAccessCodeRepository implements AccessCodeRepository {
  constructor(private readonly db: DatabaseClient) {}
  async findActiveByHash(codeHash: Uint8Array<ArrayBuffer>) { const row = await this.db.accessCode.findFirst({ where: { codeHash, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, select: accessCodeSelect }); return row ? toDTO(row) : null; }
  async findActiveByCard(cardId: string) { const row = await this.db.accessCode.findFirst({ where: { cardId, status: "ACTIVE" }, orderBy: { version: "desc" }, select: accessCodeSelect }); return row ? toDTO(row) : null; }
  async nextVersion(cardId: string) { const row = await this.db.accessCode.aggregate({ where: { cardId }, _max: { version: true } }); return (row._max.version ?? 0) + 1; }
  async create(data: Prisma.AccessCodeCreateInput) { return toDTO(await this.db.accessCode.create({ data, select: accessCodeSelect })); }
  async revokeActive(cardId: string, at: Date, replacementStatus: "ROTATED" | "REVOKED" = "REVOKED") { const result = await this.db.accessCode.updateMany({ where: { cardId, status: "ACTIVE" }, data: { status: replacementStatus, revokedAt: at } }); return result.count; }
}
