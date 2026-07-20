import type { EditorCardDTO } from "@/dto";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import type { UnitOfWork } from "@/repositories";
import type { SessionTokenGenerator } from "@/services/credential-security.service";
import { updateCardAppearanceSchema, type UpdateCardAppearanceInput } from "@/validation/use-cases";
import { parseUseCaseInput } from "./shared";

export class UpdateCardAppearance {
  constructor(private readonly unitOfWork: UnitOfWork, private readonly tokens: SessionTokenGenerator, private readonly now: () => Date = () => new Date()) {}
  async execute(input: UpdateCardAppearanceInput): Promise<EditorCardDTO> {
    const command = parseUseCaseInput(updateCardAppearanceSchema, input);
    const tokenHash = await this.tokens.hash(command.sessionToken);
    return this.unitOfWork.execute(async ({ editorSessions, cards }) => {
      const session = await editorSessions.findByTokenHash(tokenHash);
      if (!session || session.status !== "ACTIVE" || session.expiresAt <= this.now()) throw new UnauthorizedError("Editor session is invalid or expired");
      if (session.cardId !== command.cardId) throw new ForbiddenError("Editor session does not grant access to this card");
      if (!await cards.findById(command.cardId, null)) throw new NotFoundError("Card", command.cardId);
      return cards.updateAppearance(command.cardId, command.appearance);
    });
  }
}
