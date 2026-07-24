import type { CustomerDTO } from "@/dto";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
import { createCustomerUseCaseSchema, type CreateCustomerUseCaseInput } from "@/validation";
import { parseUseCaseInput } from "./shared";
export class CreateCustomer { constructor(private readonly unitOfWork: UnitOfWork) {} execute(input: CreateCustomerUseCaseInput): Promise<CustomerDTO> { return this.unitOfWork.execute(repositories => this.executeIn(repositories, input)); } executeIn(repositories: Pick<TransactionRepositories,"customers">, input: CreateCustomerUseCaseInput): Promise<CustomerDTO> { const command=parseUseCaseInput(createCustomerUseCaseSchema,input); return repositories.customers.create(command); } }
