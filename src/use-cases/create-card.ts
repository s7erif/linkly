import type { CardDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
import { createCardUseCaseSchema, type CreateCardUseCaseInput } from "@/validation";
import { parseUseCaseInput } from "./shared";
export class CreateCard { constructor(private readonly unitOfWork: UnitOfWork) {} execute(input: CreateCardUseCaseInput): Promise<CardDTO> { return this.unitOfWork.execute(repositories=>this.executeIn(repositories,input)); } async executeIn(repositories:Pick<TransactionRepositories,"cards"|"customers">,input:CreateCardUseCaseInput,context?:{orderId?:string;initialProfile?:{company?:string|null;email?:string|null;phone?:string|null}}):Promise<CardDTO>{const command=parseUseCaseInput(createCardUseCaseSchema,input);if(!await repositories.customers.findById(command.customerId,null))throw new NotFoundError("Customer",command.customerId);return repositories.cards.create({...command,orderId:context?.orderId,initialProfile:context?.initialProfile});} }
