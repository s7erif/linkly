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

// ── Query timing instrumentation ─────────────────────────────────────
// Logs every SQL query with duration.  Filters to findEditorById's
// inner queries by checking for model names in the SQL string.
if (process.env.NODE_ENV === "development") {
  let seq = 0;
  (prisma as any).$on("query", (e: any) => {
    seq++;
    const sql = (e.query as string).replace(/\s+/g, " ").trim().substring(0, 180);
    const model = sql.match(/FROM\s+"(\w+)"/)?.[1] ?? sql.match(/INSERT\s+INTO\s+"(\w+)"/)?.[1] ?? "?";
    console.log(`[prisma][${seq}] ${model} ${e.duration}ms | ${sql}`);
  });
}
