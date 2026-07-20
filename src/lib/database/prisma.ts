import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getEnvironment } from "@/lib/env";

export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
const globalDatabase = globalThis as unknown as { oiPrisma?: PrismaClient };
export const prisma = globalDatabase.oiPrisma ?? createPrismaClient(getEnvironment().DATABASE_URL);
if (getEnvironment().NODE_ENV !== "production") globalDatabase.oiPrisma = prisma;
