import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "src");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const failures = [];

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : sourceExtensions.has(extname(path)) ? [path] : [];
  }));
  return nested.flat();
}
function report(file, rule, detail) {
  failures.push(`${relative(root, file)}: ${rule}: ${detail}`);
}
for (const file of await filesUnder(sourceRoot)) {
  const normalized = relative(root, file).split(sep).join("/");
  if (normalized.startsWith("src/generated/")) continue;
  const source = await readFile(file, "utf8");
  const isRepository = normalized.startsWith("src/repositories/");
  const isDatabase = normalized.startsWith("src/lib/database/");
  const isService = normalized.startsWith("src/services/") || normalized.startsWith("src/lib/services/") || normalized.startsWith("src/use-cases/");
  const isFeature = normalized.startsWith("src/features/");

  if ((source.includes("@/generated/prisma") || source.includes("@prisma/client")) && !isRepository && !isDatabase) {
    report(file, "ARCH001", "Prisma imports are restricted to repository implementations and database infrastructure");
  }
  if (/\bprisma\s*\./.test(source) && !isRepository && !isDatabase) {
    report(file, "ARCH002", "Direct Prisma model access is forbidden outside repositories");
  }
  if (isService && /from\s+["']@\/lib\/database/.test(source)) {
    report(file, "ARCH003", "Services must use UnitOfWork and repository ports, not database infrastructure");
  }
  if (isService && /(from\s+["'](?:react|next(?:\/[^"']*)?)["']|NextResponse|NextRequest|cookies\s*\(|headers\s*\()/m.test(source)) {
    report(file, "ARCH004", "Services must not import UI, Next.js, or request-context APIs");
  }
  if (isService && /\b(?:tx|transaction)\s*\./.test(source)) {
    report(file, "ARCH005", "Services must not use persistence transaction clients directly");
  }
  if (isRepository && /(from\s+["'](?:react|next(?:\/[^"']*)?)["']|NextResponse|NextRequest|cookies\s*\(|headers\s*\(|\bRequest\b)/m.test(source)) {
    report(file, "ARCH006", "Repositories must not depend on UI, Next.js, cookies, headers, or request objects");
  }
  if (normalized === "src/repositories/contracts.ts" && /\bPrisma(?:Client)?\b|generated\/prisma|@prisma\/client/.test(source)) {
    report(file, "ARCH007", "Repository ports must be persistence-independent");
  }
  if (isFeature && /repositories|Prisma[A-Za-z]+Repository/.test(source)) {
    report(file, "ARCH008", "Feature entry points must not export or import repositories");
  }
  if (!isRepository && normalized !== "src/lib/composition-root.ts" && /Prisma[A-Za-z]+(?:Read|Transaction)?Repository/.test(source)) {
    report(file, "ARCH011", "Concrete repositories are private to the DAL composition root");
  }
  if (isRepository && /\bas\s+(?:Promise<)?(?:[A-Za-z]+DTO)/.test(source)) {
    report(file, "ARCH009", "Repository DTOs require explicit mapping; type assertions are forbidden");
  }
  if (source.includes("@/lib/prisma") || source.includes("./lib/prisma") || source.includes("../prisma")) {
    report(file, "ARCH010", "The legacy Prisma access path is forbidden");
  }
}
if (failures.length) {
  console.error("Architecture boundary check failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Architecture boundary check passed.");
