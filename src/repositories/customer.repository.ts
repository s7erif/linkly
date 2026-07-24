import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { WorkspaceScope } from "@/domain/workspace-access";
import type { CustomerDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import type { CreateCustomerCommand, CustomerReadRepository, CustomerWriteRepository, UpdateCustomerCommand, WorkspaceCustomerRepository } from "./contracts";

const customerSelect = {
  id: true, displayName: true, email: true, phone: true, status: true,
  locale: true, timezone: true, createdAt: true, updatedAt: true,
} satisfies Prisma.CustomerSelect;
type CustomerRow = Prisma.CustomerGetPayload<{ select: typeof customerSelect }>;
function mapCustomer(row: CustomerRow): CustomerDTO {
  return { id: row.id, displayName: row.displayName, email: row.email, phone: row.phone, status: row.status, locale: row.locale, timezone: row.timezone, createdAt: row.createdAt, updatedAt: row.updatedAt };
}
type CustomerDatabase =
  | Pick<PrismaClient, "customer" | "workspace" | "customerAccount" | "workspaceMembership">
  | Pick<Prisma.TransactionClient, "customer" | "workspace" | "customerAccount" | "workspaceMembership">;

abstract class CustomerRepositoryBase {
  constructor(protected readonly db: CustomerDatabase) {}
  /** Platform-admin compatibility path; tenant callers must use findByIdInWorkspace. */
  async findById(id: string, deletedAt: null | Date): Promise<CustomerDTO | null> {
    return this.findByIdForPlatformAdmin(id, deletedAt);
  }
  async findByIdForPlatformAdmin(id: string, deletedAt: null | Date): Promise<CustomerDTO | null> {
    const row = await this.db.customer.findFirst({ where: { id, deletedAt }, select: customerSelect });
    return row ? mapCustomer(row) : null;
  }
  /** Platform-admin compatibility path; tenant callers must use findByEmailInWorkspace. */
  async findByEmail(email: string, deletedAt: null | Date, excludeId?: string): Promise<CustomerDTO | null> {
    return this.findByEmailForPlatformAdmin(email, deletedAt, excludeId);
  }
  async findByEmailForPlatformAdmin(email: string, deletedAt: null | Date, excludeId?: string): Promise<CustomerDTO | null> {
    const row = await this.db.customer.findFirst({ where: { email: { equals: email, mode: "insensitive" }, deletedAt, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: customerSelect });
    return row ? mapCustomer(row) : null;
  }
  async findByIdInWorkspace(scope: WorkspaceScope, id: string, deletedAt: null | Date): Promise<CustomerDTO | null> {
    const row = await this.db.customer.findFirst({ where: { workspaceId: scope.workspaceId, id, deletedAt }, select: customerSelect });
    return row ? mapCustomer(row) : null;
  }
  async findByEmailInWorkspace(scope: WorkspaceScope, email: string, deletedAt: null | Date, excludeId?: string): Promise<CustomerDTO | null> {
    const row = await this.db.customer.findFirst({ where: { workspaceId: scope.workspaceId, email: { equals: email, mode: "insensitive" }, deletedAt, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: customerSelect });
    return row ? mapCustomer(row) : null;
  }
}
export class PrismaCustomerReadRepository extends CustomerRepositoryBase implements CustomerReadRepository, Pick<WorkspaceCustomerRepository, "findByIdInWorkspace" | "findByEmailInWorkspace"> {
  constructor(db: PrismaClient) { super(db); }
}
export class PrismaCustomerTransactionRepository extends CustomerRepositoryBase implements CustomerReadRepository, CustomerWriteRepository, WorkspaceCustomerRepository {
  constructor(db: Prisma.TransactionClient) { super(db); }
  async create(command: CreateCustomerCommand): Promise<CustomerDTO> {
    const workspace = await this.db.workspace.create({ data: {}, select: { id: true } });
    const customer = await this.db.customer.create({
      data: { ...command, workspaceId: workspace.id },
      select: customerSelect,
    });
    await this.db.workspace.update({
      where: { id: workspace.id },
      data: { customerId: customer.id },
    });
    return mapCustomer(customer);
  }
  async provisionAccount(input: { customerId: string; email: string; passwordHash: Uint8Array<ArrayBuffer>; passwordSalt: Uint8Array<ArrayBuffer> }): Promise<{ accountId: string; workspaceId: string }> {
    const customer = await this.db.customer.findUnique({ where: { id: input.customerId }, select: { id: true, workspaceId: true } });
    if (!customer) throw new NotFoundError("Customer", input.customerId);
    const account = await this.db.customerAccount.create({ data: { customerId: customer.id, email: input.email, passwordHash: input.passwordHash, passwordSalt: input.passwordSalt }, select: { id: true } });
    await this.db.workspaceMembership.create({ data: { workspaceId: customer.workspaceId, accountId: account.id, role: "OWNER", status: "ACTIVE" } });
    return { accountId: account.id, workspaceId: customer.workspaceId };
  }
  async update(id: string, command: UpdateCustomerCommand): Promise<CustomerDTO> {
    return mapCustomer(await this.db.customer.update({ where: { id }, data: command, select: customerSelect }));
  }
  async createInWorkspace(scope: WorkspaceScope, command: CreateCustomerCommand): Promise<CustomerDTO> {
    return mapCustomer(await this.db.customer.create({ data: { ...command, workspaceId: scope.workspaceId }, select: customerSelect }));
  }
  async updateInWorkspace(scope: WorkspaceScope, id: string, command: UpdateCustomerCommand): Promise<CustomerDTO | null> {
    const result = await this.db.customer.updateMany({ where: { workspaceId: scope.workspaceId, id }, data: command });
    if (result.count !== 1) return null;
    const row = await this.db.customer.findFirst({ where: { workspaceId: scope.workspaceId, id }, select: customerSelect });
    return row ? mapCustomer(row) : null;
  }
}
