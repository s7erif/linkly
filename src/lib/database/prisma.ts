import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "@/generated/prisma/client";
import { getEnvironment } from "@/lib/env";

export type DatabaseClient = PrismaClient | Prisma.TransactionClient;
export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
const globalDatabase = globalThis as unknown as { oiPrisma?: PrismaClient };
export const prisma = globalDatabase.oiPrisma ?? createPrismaClient(getEnvironment().DATABASE_URL);
if (getEnvironment().NODE_ENV !== "production") globalDatabase.oiPrisma = prisma;
export async function withTransaction<T>(work: (transaction: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(work);
}
