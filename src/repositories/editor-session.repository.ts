import type { Prisma } from "@/generated/prisma/client";
import type { EditorSessionWriteRepository } from "./contracts";

export class PrismaEditorSessionTransactionRepository implements EditorSessionWriteRepository {
  constructor(private readonly db: Prisma.TransactionClient) {}
  async revokeByCard(cardId: string, activeStatus: "ACTIVE", revokedAt: Date): Promise<number> {
    return (await this.db.editorSession.updateMany({ where: { cardId, status: activeStatus }, data: { status: "REVOKED", revokedAt } })).count;
  }
}
