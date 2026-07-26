import type { PublicCardDTO } from "@/dto";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { BuilderCardProjection, PublicCardMutationResult, TransactionRepositories, UnitOfWork } from "@/repositories";
import type { SessionTokenGenerator } from "@/services/credential-security.service";
import {
  changeCardSlugSchema,
  createCardButtonSchema,
  createSocialLinkSchema,
  deleteCardButtonSchema,
  deleteSocialLinkSchema,
  reorderCardButtonsSchema,
  reorderSocialLinksSchema,
  updateCardButtonSchema,
  updateCardMetadataSchema,
  updateCardSectionsSchema,
  updateSocialLinkSchema,
  validateCardSlugSchema,
  type ChangeCardSlugInput,
  type CreateCardButtonInput,
  type CreateSocialLinkInput,
  type DeleteCardButtonInput,
  type DeleteSocialLinkInput,
  type ReorderCardButtonsInput,
  type ReorderSocialLinksInput,
  type UpdateCardButtonInput,
  type UpdateCardMetadataInput,
  type UpdateCardSectionsInput,
  type UpdateSocialLinkInput,
  type ValidateCardSlugInput,
} from "@/validation/card-builder";
import { toRenderableCardDTO } from "./card-mappers";
import { parseUseCaseInput } from "./shared";
import { requestTag } from "@/lib/request-context";
import { auditAdminWorkspaceEdit, authorizeEditorAccess, type EditorAuthorizationContext } from "./editor-authorization";

const capability = <T>(value: T | undefined, name: string): T => {
  if (!value) throw new Error(`Card repository does not implement ${name}`);
  return value;
};
abstract class BuilderUseCase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    protected readonly tokens: SessionTokenGenerator,
    protected readonly now: () => Date = () => new Date(),
  ) {}
  protected async run(
    cardId: string,
    sessionToken: string,
    authorization: EditorAuthorizationContext | undefined,
    work: (repositories: TransactionRepositories, card: BuilderCardProjection) => Promise<void>,
    returnEditor = true,
  ): Promise<PublicCardDTO | PublicCardMutationResult> {
    const runStart = performance.now();
    return this.unitOfWork.execute(async (repositories) => {
      const t0 = performance.now();
      const { card, actor } = await authorizeEditorAccess(repositories, this.tokens, cardId, sessionToken, this.now(), authorization);
      if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [run] authorizeEditorAccess: ${Math.round(performance.now() - t0)}ms`);
      const t1 = performance.now();
      await work(repositories, card);
      if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [run] work(): ${Math.round(performance.now() - t1)}ms`);
      const t2 = performance.now();
      await auditAdminWorkspaceEdit(repositories, actor, cardId, this.constructor.name);
      if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [run] audit: ${Math.round(performance.now() - t2)}ms`);
      if (!returnEditor) return { id: cardId, slug: card.slug };
      const t3 = performance.now();
      const reloaded = (await (repositories.cards.findWorkspaceById?.(cardId, null) ?? repositories.cards.findEditorById(cardId, null)))!;
      if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [run] findEditorById (reload): ${Math.round(performance.now() - t3)}ms`);
      if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [run] total callback: ${Math.round(performance.now() - t0)}ms total since run(): ${Math.round(performance.now() - runStart)}ms`);
      return toRenderableCardDTO(reloaded);
    });
  }
}
export class UpdateCardSections extends BuilderUseCase {
  execute(input: UpdateCardSectionsInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(updateCardSectionsSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }) => {
      await capability(cards.replaceSections, "replaceSections").call(
        cards,
        value.cardId,
        value.sections.map((section, position) => ({ ...section, position })),
      );
    }, returnEditor);
  }
}
export class CreateCardButton extends BuilderUseCase {
  async execute(input: CreateCardButtonInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(createCardButtonSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }) => {
      // Strip transport/auth fields before the persistence boundary.
      // sessionToken was consumed by authorizeEditorAccess above — the
      // repository must never see it.  Position is computed atomically
      // inside the repository transaction (MAX(position) + 1 across
      // all rows) — the caller never supplies it.
      const { sessionToken: _, ...command } = value;
      await capability(cards.createButton, "createButton").call(cards, command);
    }, returnEditor);
  }
}
export class UpdateCardButton extends BuilderUseCase {
  execute(input: UpdateCardButtonInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(updateCardButtonSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (!card.buttonIds.includes(value.buttonId))
          throw new NotFoundError("CardButton", value.buttonId);
        // Strip transport/auth fields before the persistence boundary.
        // sessionToken was consumed by authorizeEditorAccess above — the
        // repository must never see it.
        const { sessionToken: _, ...command } = value;
        await capability(cards.updateButton, "updateButton").call(
            cards,
            command,
          );
      },
     returnEditor);
  }
}
export class DeleteCardButton extends BuilderUseCase {
  execute(input: DeleteCardButtonInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(deleteCardButtonSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (!card.buttonIds.includes(value.buttonId))
          throw new NotFoundError("CardButton", value.buttonId);
        await capability(cards.deleteButton, "deleteButton").call(
            cards,
            value.cardId,
            value.buttonId,
            this.now(),
        );
      },
     returnEditor);
  }
}
export class ReorderCardButtons extends BuilderUseCase {
  execute(input: ReorderCardButtonsInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(reorderCardButtonsSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (
          value.buttonIds.length !== card.buttonIds.length ||
          value.buttonIds.some(
            (id) => !card.buttonIds.includes(id),
          )
        )
          throw new ConflictError(
            "Button order must contain every button exactly once",
          );
        await capability(cards.reorderButtons, "reorderButtons").call(
            cards,
            value.cardId,
            value.buttonIds,
          );
      },
     returnEditor);
  }
}
export class CreateSocialLink extends BuilderUseCase {
  execute(input: CreateSocialLinkInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(createSocialLinkSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }) => {
      // Strip transport/auth fields before the persistence boundary.
      // sessionToken was consumed by authorizeEditorAccess above — the
      // repository must never see it.  Position is computed atomically
      // inside the repository transaction (MAX(position) + 1 across
      // all rows) — the caller never supplies it.
      const { sessionToken: _, ...command } = value;
      await capability(cards.createSocialLink, "createSocialLink").call(cards, command);
    }, returnEditor);
  }
}
export class UpdateSocialLink extends BuilderUseCase {
  execute(input: UpdateSocialLinkInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(updateSocialLinkSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (!card.socialLinkIds.includes(value.socialLinkId))
          throw new NotFoundError("SocialLink", value.socialLinkId);
        // Strip transport/auth fields before the persistence boundary.
        const { sessionToken: _, ...command } = value;
        await capability(cards.updateSocialLink, "updateSocialLink").call(
            cards,
            command,
          );
      },
     returnEditor);
  }
}
export class DeleteSocialLink extends BuilderUseCase {
  execute(input: DeleteSocialLinkInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(deleteSocialLinkSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (!card.socialLinkIds.includes(value.socialLinkId))
          throw new NotFoundError("SocialLink", value.socialLinkId);
        await capability(cards.deleteSocialLink, "deleteSocialLink").call(
            cards,
            value.cardId,
            value.socialLinkId,
            this.now(),
        );
      },
     returnEditor);
  }
}
export class ReorderSocialLinks extends BuilderUseCase {
  execute(input: ReorderSocialLinksInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(reorderSocialLinksSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (
          value.socialLinkIds.length !== card.socialLinkIds.length ||
          value.socialLinkIds.some(
            (id) => !card.socialLinkIds.includes(id),
          )
        )
          throw new ConflictError(
            "Social-link order must contain every link exactly once",
          );
        await capability(cards.reorderSocialLinks, "reorderSocialLinks").call(
            cards,
            value.cardId,
            value.socialLinkIds,
          );
      },
     returnEditor);
  }
}
export class ChangeCardSlug extends BuilderUseCase {
  execute(input: ChangeCardSlugInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(changeCardSlugSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }) => {
      if (
        await capability(cards.slugExists, "slugExists").call(
          cards,
          value.slug,
          value.cardId,
        )
      )
        throw new ConflictError("This slug is already in use");
      await capability(cards.updateSettings, "updateSettings").call(
          cards,
          value.cardId,
          { slug: value.slug },
        );
    }, returnEditor);
  }
}
export class ValidateCardSlug extends BuilderUseCase {
  execute(
    input: ValidateCardSlugInput,
    authorization?: EditorAuthorizationContext,
  ): Promise<{ slug: string; available: boolean }> {
    const value = parseUseCaseInput(validateCardSlugSchema, input);
    return this.unitOfWork.execute(async (repositories) => {
      await authorizeEditorAccess(repositories, this.tokens, value.cardId, value.sessionToken, this.now(), authorization);
      return {
        slug: value.slug,
        available: !(await capability(repositories.cards.slugExists, "slugExists").call(
          repositories.cards,
          value.slug,
          value.cardId,
        )),
      };
    });
  }
}
export class UpdateCardMetadata extends BuilderUseCase {
  execute(input: UpdateCardMetadataInput, authorization?: EditorAuthorizationContext, returnEditor = true): Promise<PublicCardDTO | PublicCardMutationResult> {
    const value = parseUseCaseInput(updateCardMetadataSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }) => { await capability(cards.updateSettings, "updateSettings").call(
          cards,
          value.cardId,
          {
            visibility: value.visibility,
            seoTitle: value.seoTitle,
            seoDescription: value.seoDescription,
          },
        ); },
     returnEditor);
  }
}
