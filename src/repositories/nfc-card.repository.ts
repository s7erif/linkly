import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { PageResult } from "@/types/admin-read";
import type { NfcCardInventoryItem, NfcCardInventoryQuery, NfcCardInventorySummary, NfcCardStatus } from "@/types/nfc-card";
import type { NfcCardRepository } from "./contracts";

const select = {
  id: true,
  activationToken: true,
  status: true,
  activatedAt: true,
  createdAt: true,
  customer: { select: { id: true, displayName: true, email: true } },
  workspace: { select: { id: true, primaryCard: { select: { slug: true } } } },
} satisfies Prisma.NfcCardSelect;

export class PrismaNfcCardRepository implements NfcCardRepository {
  constructor(private readonly db: PrismaClient) {}

  private where(query: Pick<NfcCardInventoryQuery, "search" | "status">): Prisma.NfcCardWhereInput {
    return {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { OR: [
        { activationToken: { contains: query.search, mode: "insensitive" } },
        { customer: { displayName: { contains: query.search, mode: "insensitive" } } },
        { customer: { email: { contains: query.search, mode: "insensitive" } } },
        { workspace: { primaryCard: { slug: { contains: query.search, mode: "insensitive" } } } },
      ] } : {}),
    };
  }

  private workspaceWhere(workspaceId: string, query: Pick<NfcCardInventoryQuery, "search" | "status">): Prisma.NfcCardWhereInput {
    return { AND: [{ workspaceId }, this.where(query)] };
  }

  private async page(where: Prisma.NfcCardWhereInput, query: NfcCardInventoryQuery): Promise<PageResult<NfcCardInventoryItem>> {
    const [total, items] = await Promise.all([
      this.db.nfcCard.count({ where }),
      this.db.nfcCard.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: [{ createdAt: query.sortDirection }, { activationToken: "asc" }], select }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) };
  }

  list(query: NfcCardInventoryQuery) {
    return this.page(this.where(query), query);
  }

  listForWorkspace(workspaceId: string, query: NfcCardInventoryQuery) {
    return this.page(this.workspaceWhere(workspaceId, query), query);
  }

  async inventory(query: NfcCardInventoryQuery) {
    const where = this.where(query);
    const summaryPromise = this.summary();
    const [summary, items] = await Promise.all([
      summaryPromise,
      this.db.nfcCard.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: [{ createdAt: query.sortDirection }, { activationToken: "asc" }], select }),
    ]);
    const total = query.search || query.status ? await this.db.nfcCard.count({ where }) : summary.TOTAL;
    return { page: { items, total, page: query.page, pageSize: query.pageSize, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) }, summary };
  }

  listForExport(query: Pick<NfcCardInventoryQuery, "search" | "status" | "sortDirection">) {
    return this.db.nfcCard.findMany({ where: this.where(query), orderBy: [{ createdAt: query.sortDirection }, { activationToken: "asc" }], select });
  }

  summary(): Promise<NfcCardInventorySummary> {
    return this.summarize();
  }

  summaryForWorkspace(workspaceId: string): Promise<NfcCardInventorySummary> {
    return this.summarize({ workspaceId });
  }

  private async summarize(where?: Prisma.NfcCardWhereInput): Promise<NfcCardInventorySummary> {
    const groups = await this.db.nfcCard.groupBy({ by: ["status"], where, _count: { _all: true } });
    const result: NfcCardInventorySummary = { TOTAL: 0, AVAILABLE: 0, RESERVED: 0, ACTIVATED: 0, DISABLED: 0, LOST: 0, ARCHIVED: 0 };
    for (const group of groups) { result[group.status] = group._count._all; result.TOTAL += group._count._all; }
    return result;
  }

  async createCards(tokens: readonly string[]) {
    return (await this.db.nfcCard.createMany({ data: tokens.map((activationToken) => ({ activationToken })) })).count;
  }

  findByIdForWorkspace(workspaceId: string, id: string) {
    return this.db.nfcCard.findFirst({ where: { id, workspaceId }, select });
  }

  async updateStatus(id: string, status: NfcCardStatus) {
    const existing = await this.db.nfcCard.findUnique({ where: { id }, select: { id: true } });
    return existing ? this.db.nfcCard.update({ where: { id }, data: { status }, select }) : null;
  }

  async softDelete(id: string) {
    return (await this.db.nfcCard.updateMany({ where: { id, status: { not: "ACTIVATED" } }, data: { status: "ARCHIVED" } })).count === 1;
  }

  async updateStatusForWorkspace(workspaceId: string, id: string, status: NfcCardStatus) {
    const changed = await this.db.nfcCard.updateMany({ where: { id, workspaceId }, data: { status } });
    return changed.count === 1 ? this.findByIdForWorkspace(workspaceId, id) : null;
  }

  async softDeleteForWorkspace(workspaceId: string, id: string) {
    return (await this.db.nfcCard.updateMany({ where: { id, workspaceId, status: { not: "ACTIVATED" } }, data: { status: "ARCHIVED" } })).count === 1;
  }
}
