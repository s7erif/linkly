import type { PrismaClient } from "@/generated/prisma/client";
import type { TransactionRepositories, UnitOfWork } from "./contracts";
import { PrismaAccessCodeTransactionRepository } from "./access-code.repository";
import { PrismaCardTransactionRepository } from "./card.repository";
import { PrismaCustomerTransactionRepository } from "./customer.repository";
import { PrismaEditorSessionTransactionRepository } from "./editor-session.repository";
import { PrismaLegacyTransactionRepository } from "./legacy.repository";

export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly db: PrismaClient) {}
  execute<T>(work: (repositories: TransactionRepositories) => Promise<T>): Promise<T> {
    return this.db.$transaction((transaction) => work({
      customers: new PrismaCustomerTransactionRepository(transaction),
      cards: new PrismaCardTransactionRepository(transaction),
      accessCodes: new PrismaAccessCodeTransactionRepository(transaction),
      editorSessions: new PrismaEditorSessionTransactionRepository(transaction),
      legacy: new PrismaLegacyTransactionRepository(transaction),
    }));
  }
}
