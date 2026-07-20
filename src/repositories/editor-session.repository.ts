import type { Prisma } from "@/generated/prisma/client";
import type { EditorSessionDTO } from "@/dto";
import type { CreateEditorSessionCommand, EditorSessionWriteRepository } from "./contracts";

const select = { id: true, cardId: true, accessCodeId: true, status: true, expiresAt: true, lastSeenAt: true, createdAt: true, revokedAt: true } satisfies Prisma.EditorSessionSelect;
type Row = Prisma.EditorSessionGetPayload<{ select: typeof select }>;
function mapSession(row: Row): EditorSessionDTO {
  return { id: row.id, cardId: row.cardId, accessCodeId: row.accessCodeId, status: row.status, expiresAt: row.expiresAt, lastSeenAt: row.lastSeenAt, createdAt: row.createdAt, revokedAt: row.revokedAt };
}
export class PrismaEditorSessionTransactionRepository implements EditorSessionWriteRepository {
  constructor(private readonly db: Prisma.TransactionClient) {}
  async create(command: CreateEditorSessionCommand): Promise<EditorSessionDTO> {
    return mapSession(await this.db.editorSession.create({ data: command, select }));
  }
  async revokeByCard(cardId: string, activeStatus: "ACTIVE", revokedAt: Date): Promise<number> {
    return (await this.db.editorSession.updateMany({ where: { cardId, status: activeStatus }, data: { status: "REVOKED", revokedAt } })).count;
  }
}
