import type { PublicCardMutationResult, UnitOfWork } from "@/repositories";
import type { SessionTokenGenerator } from "@/services/credential-security.service";
import { updateCardAppearanceSchema, type UpdateCardAppearanceInput } from "@/validation/use-cases";
import { parseUseCaseInput } from "./shared";
import { auditAdminWorkspaceEdit, authorizeEditorSession, type EditorAuthorizationContext } from "./editor-authorization";

/**
 * Updates the card appearance.
 *
 * The editor already holds the latest appearance in its Zustand store
 * (optimistic UI).  The client only checks `res.ok` — it never reads the
 * response body.  Therefore we use a lightweight session-only
 * authorization (no findEditorById) and return a minimal result.
 */
export class UpdateCardAppearance {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly tokens: SessionTokenGenerator,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: UpdateCardAppearanceInput, authorization?: EditorAuthorizationContext): Promise<PublicCardMutationResult> {
    const command = parseUseCaseInput(updateCardAppearanceSchema, input);
    return this.unitOfWork.execute(async (repositories) => {
      // Lightweight: validates the editor session without loading the full card.
      const actor = await authorizeEditorSession(repositories, this.tokens, command.cardId, command.sessionToken, this.now(), authorization);
      const result = await repositories.cards.updateAppearance(command.cardId, command.appearance);
      await auditAdminWorkspaceEdit(repositories, actor, command.cardId, "UPDATE_APPEARANCE");
      return result;
    });
  }
}
