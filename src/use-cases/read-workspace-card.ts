import type { WorkspaceCardDTO } from "@/dto";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import type { UnitOfWork } from "@/repositories";
import type { SessionTokenGenerator } from "@/services/credential-security.service";
import {
  readWorkspaceCardSchema,
  type ReadWorkspaceCardInput,
} from "@/validation/use-cases";
import { toWorkspaceCardDTO } from "./card-mappers";
import { parseUseCaseInput } from "./shared";

export class ReadWorkspaceCard {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly tokens: SessionTokenGenerator,
    private readonly now: () => Date = () => new Date(),
  ) {}
  async execute(input: ReadWorkspaceCardInput): Promise<WorkspaceCardDTO> {
    const command = parseUseCaseInput(readWorkspaceCardSchema, input);
    const tokenHash = await this.tokens.hash(command.sessionToken);
    return this.unitOfWork.execute(async (repositories) => { const { editorSessions, cards } = repositories;
      const session = await editorSessions.findByTokenHash(tokenHash);
      if (
        !session ||
        session.status !== "ACTIVE" ||
        session.expiresAt <= this.now()
      )
        throw new UnauthorizedError("Editor session is invalid or expired");
      if (session.cardId !== command.cardId)
        throw new ForbiddenError(
          "Editor session does not grant access to this card",
        );
      const card = await cards.findEditorById(command.cardId, null);
      if (!card) throw new NotFoundError("Card", command.cardId);
      const subscription = repositories.platform ? await repositories.platform.findLatestSubscriptionByCard(card.id) : null;
      return {...toWorkspaceCardDTO(card), plan:{subscription,enabledFeatures:subscription?.plan.features.filter(feature=>feature.enabled)??[],disabledFeatures:subscription?.plan.features.filter(feature=>!feature.enabled)??[]}};
    });
  }
}
