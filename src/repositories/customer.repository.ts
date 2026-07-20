import type { Prisma } from "@/generated/prisma/client";
import type { CustomerDTO } from "@/dto";
import type { DatabaseClient } from "@/lib/database";

const customerSelect = {
  id: true, displayName: true, email: true, phone: true, status: true,
  locale: true, timezone: true, createdAt: true, updatedAt: true,
} satisfies Prisma.CustomerSelect;
type CustomerRow = Prisma.CustomerGetPayload<{ select: typeof customerSelect }>;
const toDTO = (row: CustomerRow): CustomerDTO => ({ ...row });

export interface CustomerRepository {
  findById(id: string): Promise<CustomerDTO | null>;
  create(data: Prisma.CustomerCreateInput): Promise<CustomerDTO>;
  update(id: string, data: Prisma.CustomerUpdateInput): Promise<CustomerDTO>;
  archive(id: string, at: Date): Promise<CustomerDTO>;
}
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly db: DatabaseClient) {}
  async findById(id: string) { const row = await this.db.customer.findFirst({ where: { id, deletedAt: null }, select: customerSelect }); return row ? toDTO(row) : null; }
  async create(data: Prisma.CustomerCreateInput) { return toDTO(await this.db.customer.create({ data, select: customerSelect })); }
  async update(id: string, data: Prisma.CustomerUpdateInput) { return toDTO(await this.db.customer.update({ where: { id }, data, select: customerSelect })); }
  async archive(id: string, at: Date) { return toDTO(await this.db.customer.update({ where: { id }, data: { status: "ARCHIVED", deletedAt: at }, select: customerSelect })); }
}
