import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ConflictError } from "@/lib/errors";
import { requestTag } from "@/lib/request-context";
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

  /** Non-transactional read — uses the main client (connection pool), no timeout. */
  async read<T>(work: (repositories: TransactionRepositories) => Promise<T>): Promise<T> {
    return work({
      platform:       new PrismaPlatformManagementRepository(this.db),
      customers:      new PrismaCustomerTransactionRepository(this.db),
      cards:          new PrismaCardTransactionRepository(this.db),
      accessCodes:    new PrismaAccessCodeTransactionRepository(this.db),
      editorSessions: new PrismaEditorSessionTransactionRepository(this.db),
      orders:         new PrismaOrderTransactionRepository(this.db),
      legacy:         new PrismaLegacyTransactionRepository(this.db),
      migrations:     new PrismaLegacyMigrationTransactionRepository(this.db),
    });
  }

  /** Transactional read/write — wraps work in an interactive transaction. */
  async execute<T>(work: (repositories: TransactionRepositories) => Promise<T>): Promise<T> {
    const t0 = performance.now();
    const tEnter = performance.now();
    const waitMs = Math.round(tEnter - t0);
    if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [tx] WAIT for connection: ${waitMs}ms`);
    try {
      const callbackStart = performance.now();
      const result = await this.db.$transaction(async (transaction) => {
        const cbEnter = performance.now();
        const cbWaitMs = Math.round(cbEnter - callbackStart);
        if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [tx] callback entered after: ${cbWaitMs}ms (total since execute: ${Math.round(cbEnter - t0)}ms)`);
        const workResult = await work({
          platform:       new PrismaPlatformManagementRepository(transaction),
          customers:      new PrismaCustomerTransactionRepository(transaction),
          cards:          new PrismaCardTransactionRepository(transaction),
          accessCodes:    new PrismaAccessCodeTransactionRepository(transaction),
          editorSessions: new PrismaEditorSessionTransactionRepository(transaction),
          orders:         new PrismaOrderTransactionRepository(transaction),
          legacy:         new PrismaLegacyTransactionRepository(transaction),
          migrations:     new PrismaLegacyMigrationTransactionRepository(transaction),
        });
        const cbDuration = Math.round(performance.now() - cbEnter);
        if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [tx] callback work: ${cbDuration}ms`);
        return workResult;
      });
      const totalMs = Math.round(performance.now() - t0);
      if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [tx] total transaction: ${totalMs}ms`);
      return result;
    } catch (error) {
      const failMs = Math.round(performance.now() - t0);
      console.error(`${requestTag()} [tx] FAILED after: ${failMs}ms`, (error as any)?.code, (error as any)?.message?.slice(0, 80));
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictError("A unique value already exists");
      throw error;
    }
  }
}
