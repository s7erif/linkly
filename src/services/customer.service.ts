import type { CustomerDTO } from "@/dto";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { CustomerReadRepository, UnitOfWork, UpdateCustomerCommand } from "@/repositories";
import { createCustomerSchema, updateCustomerSchema, type CreateCustomerInput, type UpdateCustomerInput } from "@/validation";

export interface CustomerServiceDependencies {
  customers: CustomerReadRepository;
  unitOfWork: UnitOfWork;
}
export class CustomerService {
  constructor(private readonly dependencies: CustomerServiceDependencies) {}
  async get(id: string): Promise<CustomerDTO> {
    const customer = await this.dependencies.customers.findById(id, null);
    if (!customer) throw new NotFoundError("Customer", id);
    return customer;
  }
  async create(input: CreateCustomerInput): Promise<CustomerDTO> {
    const command = createCustomerSchema.parse(input);
    return this.dependencies.unitOfWork.execute(async ({ customers }) => {
      if (command.email && await customers.findByEmail?.(command.email, null)) throw new ConflictError("A customer with this email address already exists");
      return customers.create(command);
    });
  }
  async update(id: string, input: UpdateCustomerInput): Promise<CustomerDTO> {
    const command: UpdateCustomerCommand = updateCustomerSchema.parse(input);
    return this.dependencies.unitOfWork.execute(async ({ customers }) => {
      if (!await customers.findById(id, null)) throw new NotFoundError("Customer", id);
      if (command.email && await customers.findByEmail?.(command.email, null, id)) throw new ConflictError("A customer with this email address already exists");
      return customers.update(id, command);
    });
  }
  async archive(id: string): Promise<CustomerDTO> {
    return this.dependencies.unitOfWork.execute(async ({ customers }) => {
      if (!await customers.findById(id, null)) throw new NotFoundError("Customer", id);
      return customers.update(id, { status: "ARCHIVED", deletedAt: new Date() });
    });
  }
}
