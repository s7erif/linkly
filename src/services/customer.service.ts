import type { CustomerDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import { withTransaction } from "@/lib/database";
import { PrismaCustomerRepository, type CustomerRepository } from "@/repositories";
import { createCustomerSchema, updateCustomerSchema, type CreateCustomerInput, type UpdateCustomerInput } from "@/validation";

export class CustomerService {
  constructor(private readonly repository?: CustomerRepository) {}
  async get(id: string): Promise<CustomerDTO> {
    const customer = await this.repository?.findById(id);
    if (this.repository && !customer) throw new NotFoundError("Customer", id);
    if (customer) return customer;
    return withTransaction(async (tx) => {
      const found = await new PrismaCustomerRepository(tx).findById(id);
      if (!found) throw new NotFoundError("Customer", id);
      return found;
    });
  }
  async create(input: CreateCustomerInput): Promise<CustomerDTO> {
    const data = createCustomerSchema.parse(input);
    return withTransaction((tx) => new PrismaCustomerRepository(tx).create(data));
  }
  async update(id: string, input: UpdateCustomerInput): Promise<CustomerDTO> {
    const data = updateCustomerSchema.parse(input);
    return withTransaction(async (tx) => {
      const repository = new PrismaCustomerRepository(tx);
      if (!await repository.findById(id)) throw new NotFoundError("Customer", id);
      return repository.update(id, data);
    });
  }
  async archive(id: string): Promise<CustomerDTO> {
    return withTransaction(async (tx) => {
      const repository = new PrismaCustomerRepository(tx);
      if (!await repository.findById(id)) throw new NotFoundError("Customer", id);
      return repository.archive(id, new Date());
    });
  }
}
