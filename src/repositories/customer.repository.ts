import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { CustomerDTO } from "@/dto";
import type { CreateCustomerCommand, CustomerReadRepository, CustomerWriteRepository, UpdateCustomerCommand } from "./contracts";

const customerSelect = {
  id: true, displayName: true, email: true, phone: true, status: true,
  locale: true, timezone: true, createdAt: true, updatedAt: true,
} satisfies Prisma.CustomerSelect;
type CustomerRow = Prisma.CustomerGetPayload<{ select: typeof customerSelect }>;
function mapCustomer(row: CustomerRow): CustomerDTO {
  return { id: row.id, displayName: row.displayName, email: row.email, phone: row.phone, status: row.status, locale: row.locale, timezone: row.timezone, createdAt: row.createdAt, updatedAt: row.updatedAt };
}
export class PrismaCustomerReadRepository implements CustomerReadRepository {
  constructor(private readonly db: PrismaClient) {}
  async findById(id: string, deletedAt: null | Date): Promise<CustomerDTO | null> {
    const row = await this.db.customer.findFirst({ where: { id, deletedAt }, select: customerSelect });
    return row ? mapCustomer(row) : null;
  }
}
export class PrismaCustomerTransactionRepository implements CustomerReadRepository, CustomerWriteRepository {
  constructor(private readonly db: Prisma.TransactionClient) {}
  async findById(id: string, deletedAt: null | Date): Promise<CustomerDTO | null> {
    const row = await this.db.customer.findFirst({ where: { id, deletedAt }, select: customerSelect });
    return row ? mapCustomer(row) : null;
  }
  async create(command: CreateCustomerCommand): Promise<CustomerDTO> {
    return mapCustomer(await this.db.customer.create({ data: command, select: customerSelect }));
  }
  async update(id: string, command: UpdateCustomerCommand): Promise<CustomerDTO> {
    return mapCustomer(await this.db.customer.update({ where: { id }, data: command, select: customerSelect }));
  }
}
