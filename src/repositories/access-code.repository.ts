import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { AccessCodeDTO, AccessCodeEventDTO } from "@/dto";
import type { AccessCodeEventCommand, AccessCodeReadRepository, AccessCodeWriteRepository, CreateAccessCodeCommand, UpdateAccessCodesCommand } from "./contracts";

const accessCodeSelect = { id: true, cardId: true, version: true, status: true, expiresAt: true, lastUsedAt: true, useCount: true, createdAt: true, revokedAt: true } satisfies Prisma.AccessCodeSelect;
const eventSelect = { id: true, accessCodeId: true, occurredAt: true, success: true, failureReason: true } satisfies Prisma.AccessCodeUsageSelect;
type AccessCodeRow = Prisma.AccessCodeGetPayload<{ select: typeof accessCodeSelect }>;
type EventRow = Prisma.AccessCodeUsageGetPayload<{ select: typeof eventSelect }>;
function mapAccessCode(row: AccessCodeRow): AccessCodeDTO {
  return { id: row.id, cardId: row.cardId, version: row.version, status: row.status, expiresAt: row.expiresAt, lastUsedAt: row.lastUsedAt, useCount: row.useCount, createdAt: row.createdAt, revokedAt: row.revokedAt };
}
function mapEvent(row: EventRow): AccessCodeEventDTO {
  return { id: row.id, accessCodeId: row.accessCodeId, occurredAt: row.occurredAt, success: row.success, failureReason: row.failureReason };
}
interface AccessCodeDatabase { accessCode: Prisma.TransactionClient["accessCode"]; }
abstract class AccessCodeRepositoryBase implements AccessCodeReadRepository {
  constructor(protected readonly db: AccessCodeDatabase) {}
  async findByHash(codeHash: Uint8Array<ArrayBuffer>): Promise<AccessCodeDTO | null> {
    const row = await this.db.accessCode.findUnique({ where: { codeHash }, select: accessCodeSelect });
    return row ? mapAccessCode(row) : null;
  }
  async findLatestByCard(cardId: string, statuses: readonly AccessCodeDTO["status"][]): Promise<AccessCodeDTO | null> {
    const row = await this.db.accessCode.findFirst({ where: { cardId, status: { in: [...statuses] } }, orderBy: { version: "desc" }, select: accessCodeSelect });
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
  constructor(private readonly transaction: Prisma.TransactionClient) { super(transaction); }
  async create(command: CreateAccessCodeCommand): Promise<AccessCodeDTO> {
    return mapAccessCode(await this.transaction.accessCode.create({ data: command, select: accessCodeSelect }));
  }
  async updateMany(command: UpdateAccessCodesCommand): Promise<number> {
    return (await this.transaction.accessCode.updateMany({ where: { cardId: command.cardId, status: { in: [...command.fromStatuses] } }, data: { status: command.status, revokedAt: command.revokedAt } })).count;
  }
  async markUsed(accessCodeId: string, usedAt: Date): Promise<void> {
    await this.transaction.accessCode.update({ where: { id: accessCodeId }, data: { lastUsedAt: usedAt, useCount: { increment: 1 } }, select: { id: true } });
  }
  async recordEvent(command: AccessCodeEventCommand): Promise<AccessCodeEventDTO> {
    return mapEvent(await this.transaction.accessCodeUsage.create({ data: command, select: eventSelect }));
  }
}
