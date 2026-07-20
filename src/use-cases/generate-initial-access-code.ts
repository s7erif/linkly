import type { IssuedAccessCodeDTO } from "@/dto";
import { InitialAccessCodeExistsError, NotFoundError } from "@/lib/errors";
import type { UnitOfWork } from "@/repositories";
import type { AccessCodeGenerator, SecretHasher } from "@/services/credential-security.service";
import { generateInitialAccessCodeSchema, type GenerateInitialAccessCodeInput } from "@/validation";
import { parseUseCaseInput } from "./shared";

export class GenerateInitialAccessCode {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly hasher: SecretHasher,
    private readonly generator: AccessCodeGenerator,
  ) {}
  async execute(input: GenerateInitialAccessCodeInput): Promise<IssuedAccessCodeDTO> {
    const command = parseUseCaseInput(generateInitialAccessCodeSchema, input);
    const plaintext = this.generator.generate();
    const codeHash = await this.hasher.hash(plaintext);
    const accessCode = await this.unitOfWork.execute(async ({ accessCodes, cards }) => {
      if (!await cards.findById(command.cardId, null)) throw new NotFoundError("Card", command.cardId);
      if (await accessCodes.findMaximumVersion(command.cardId) !== null) throw new InitialAccessCodeExistsError(command.cardId);
      const created = await accessCodes.create({ cardId: command.cardId, codeHash, version: 1, expiresAt: command.expiresAt });
      return created;
    });
    return { accessCode, code: this.generator.format(plaintext) };
  }
}
