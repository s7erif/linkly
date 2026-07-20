import type { CardDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import type { UnitOfWork } from "@/repositories";
import { createCardUseCaseSchema, type CreateCardUseCaseInput } from "@/validation";
import { parseUseCaseInput } from "./shared";

export class CreateCard {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(input: CreateCardUseCaseInput): Promise<CardDTO> {
    const command = parseUseCaseInput(createCardUseCaseSchema, input);
    return this.unitOfWork.execute(async ({ cards, customers }) => {
      if (!await customers.findById(command.customerId, null)) throw new NotFoundError("Customer", command.customerId);
      return cards.create(command);
    });
  }
}
