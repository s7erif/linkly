import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ConflictError } from "@/lib/errors";
import type { TransactionRepositories, UnitOfWork } from "./contracts";
import { PrismaAccessCodeTransactionRepository } from "./access-code.repository";
import { PrismaCardTransactionRepository } from "./card.repository";
import { PrismaCustomerTransactionRepository } from "./customer.repository";
import { PrismaEditorSessionTransactionRepository } from "./editor-session.repository";
import { PrismaLegacyTransactionRepository } from "./legacy.repository";

export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly db: PrismaClient) {}
  async execute<T>(work: (repositories: TransactionRepositories) => Promise<T>): Promise<T> {
    try {
      return await this.db.$transaction((transaction) => work({
      customers: new PrismaCustomerTransactionRepository(transaction),
      cards: new PrismaCardTransactionRepository(transaction),
      accessCodes: new PrismaAccessCodeTransactionRepository(transaction),
      editorSessions: new PrismaEditorSessionTransactionRepository(transaction),
      legacy: new PrismaLegacyTransactionRepository(transaction),
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictError("A unique value already exists");
      throw error;
    }
  }
}
