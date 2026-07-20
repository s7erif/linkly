import type { CustomerDTO } from "@/dto";
import type { UnitOfWork } from "@/repositories";
import { createCustomerUseCaseSchema, type CreateCustomerUseCaseInput } from "@/validation";
import { parseUseCaseInput } from "./shared";

export class CreateCustomer {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(input: CreateCustomerUseCaseInput): Promise<CustomerDTO> {
    const command = parseUseCaseInput(createCustomerUseCaseSchema, input);
    return this.unitOfWork.execute(({ customers }) => customers.create(command));
  }
}
