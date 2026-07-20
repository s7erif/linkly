import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { AccessCodeDTO } from "@/dto";
import type { AccessCodeLookupCriteria, AccessCodeReadRepository, AccessCodeWriteRepository, CreateAccessCodeCommand, UpdateAccessCodesCommand } from "./contracts";

const select = { id: true, cardId: true, version: true, status: true, expiresAt: true, lastUsedAt: true, useCount: true, createdAt: true, revokedAt: true } satisfies Prisma.AccessCodeSelect;
type Row = Prisma.AccessCodeGetPayload<{ select: typeof select }>;
function mapAccessCode(row: Row): AccessCodeDTO {
  return { id: row.id, cardId: row.cardId, version: row.version, status: row.status, expiresAt: row.expiresAt, lastUsedAt: row.lastUsedAt, useCount: row.useCount, createdAt: row.createdAt, revokedAt: row.revokedAt };
}
interface AccessCodeDatabase { accessCode: Prisma.TransactionClient["accessCode"]; }
abstract class AccessCodeRepositoryBase implements AccessCodeReadRepository {
  constructor(protected readonly db: AccessCodeDatabase) {}
  async findByHash(criteria: AccessCodeLookupCriteria): Promise<AccessCodeDTO | null> {
    const row = await this.db.accessCode.findFirst({ where: { codeHash: criteria.hash, status: { in: [...criteria.statuses] }, OR: [{ expiresAt: null }, { expiresAt: { gt: criteria.validAt } }] }, select });
    return row ? mapAccessCode(row) : null;
  }
  async findLatestByCard(cardId: string, statuses: readonly AccessCodeDTO["status"][]): Promise<AccessCodeDTO | null> {
    const row = await this.db.accessCode.findFirst({ where: { cardId, status: { in: [...statuses] } }, orderBy: { version: "desc" }, select });
    return row ? mapAccessCode(row) : null;
  }
  async findMaximumVersion(cardId: string): Promise<number | null> {
    return (await this.db.accessCode.aggregate({ where: { cardId }, _max: { version: true } }))._max.version;
  }
}
export class PrismaAccessCodeReadRepository extends AccessCodeRepositoryBase {
  constructor(db: PrismaClient) { super(db); }
}
export class PrismaAccessCodeTransactionRepository extends AccessCodeRepositoryBase implements AccessCodeWriteRepository {
  constructor(db: Prisma.TransactionClient) { super(db); }
  async create(command: CreateAccessCodeCommand): Promise<AccessCodeDTO> {
    const row = await this.db.accessCode.create({ data: { cardId: command.cardId, codeHash: command.codeHash, version: command.version, expiresAt: command.expiresAt, rotatedFromId: command.rotatedFromId }, select });
    return mapAccessCode(row);
  }
  async updateMany(command: UpdateAccessCodesCommand): Promise<number> {
    return (await this.db.accessCode.updateMany({ where: { cardId: command.cardId, status: { in: [...command.fromStatuses] } }, data: { status: command.status, revokedAt: command.revokedAt } })).count;
  }
}
