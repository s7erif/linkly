import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ConflictError } from "@/lib/errors";
import type { TransactionRepositories, UnitOfWork } from "./contracts";
import { PrismaAccessCodeTransactionRepository } from "./access-code.repository";
import { PrismaCardTransactionRepository } from "./card.repository";
import { PrismaCustomerTransactionRepository } from "./customer.repository";
import { PrismaEditorSessionTransactionRepository } from "./editor-session.repository";
import { PrismaLegacyTransactionRepository } from "./legacy.repository";
import { PrismaLegacyMigrationTransactionRepository } from "./legacy-migration.repository";
import { PrismaOrderTransactionRepository } from "./order.repository";
import { PrismaPlatformManagementRepository } from "./platform-management.repository";

export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly db: PrismaClient) {}
  async execute<T>(work: (repositories: TransactionRepositories) => Promise<T>): Promise<T> {
    try {
      return await this.db.$transaction((transaction) => work({
      platform: new PrismaPlatformManagementRepository(transaction),
      customers: new PrismaCustomerTransactionRepository(transaction),
      cards: new PrismaCardTransactionRepository(transaction),
      accessCodes: new PrismaAccessCodeTransactionRepository(transaction),
      editorSessions: new PrismaEditorSessionTransactionRepository(transaction),
      orders: new PrismaOrderTransactionRepository(transaction),
      legacy: new PrismaLegacyTransactionRepository(transaction),
      migrations: new PrismaLegacyMigrationTransactionRepository(transaction),
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictError("A unique value already exists");
      throw error;
    }
  }
}
