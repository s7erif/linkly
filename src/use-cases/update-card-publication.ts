import type { WorkspaceCardDTO } from "@/dto";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { UnitOfWork } from "@/repositories";
import type { SessionTokenGenerator } from "@/services/credential-security.service";
import {
  cardPublicationSchema,
  type CardPublicationInput,
} from "@/validation/publication";
import { toWorkspaceCardDTO } from "./card-mappers";
import {
  auditAdminWorkspaceEdit,
  authorizeEditorAccess,
  type EditorAuthorizationContext,
} from "./editor-authorization";
import { parseUseCaseInput } from "./shared";

export class UpdateCardPublication {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly tokens: SessionTokenGenerator,
    private readonly now: () => Date = () => new Date(),
  ) {}

  execute(
    input: CardPublicationInput,
    authorization?: EditorAuthorizationContext,
  ): Promise<WorkspaceCardDTO> {
    const command = parseUseCaseInput(cardPublicationSchema, input);
    return this.unitOfWork.execute(async (repositories) => {
      const current = await authorizeEditorAccess(
        repositories,
        this.tokens,
        command.cardId,
        command.sessionToken,
        this.now(),
        authorization,
      );
      if (command.action === "PUBLISH" && !["DRAFT", "UNPUBLISHED"].includes(current.status))
        throw new ConflictError(`Cannot publish a ${current.status.toLowerCase()} card`);
      if (command.action === "UNPUBLISH" && current.status !== "PUBLISHED")
        throw new ConflictError(`Cannot unpublish a ${current.status.toLowerCase()} card`);
      if (command.action === "RESTORE" && current.status !== "ARCHIVED")
        throw new ConflictError(`Cannot restore a ${current.status.toLowerCase()} card`);
      const now = this.now();
      const update =
        command.action === "PUBLISH"
          ? { status: "PUBLISHED" as const, visibility: "PUBLIC" as const, publishedAt: now }
          : { status: "DRAFT" as const, visibility: "PRIVATE" as const, publishedAt: null };
      await repositories.cards.update(command.cardId, update);
      const saved = await repositories.cards.findEditorById(command.cardId, null);
      if (!saved) throw new NotFoundError("Card", command.cardId);
      await auditAdminWorkspaceEdit(
        repositories,
        authorization,
        command.cardId,
        `PUBLICATION_${command.action}`,
      );
      return toWorkspaceCardDTO(saved);
    });
  }
}
