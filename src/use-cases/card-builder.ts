import type { EditorCardDTO, PublicCardDTO } from "@/dto";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
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
  protected run<T>(
    cardId: string,
    sessionToken: string,
    authorization: EditorAuthorizationContext | undefined,
    work: (
      repositories: TransactionRepositories,
      card: EditorCardDTO,
    ) => Promise<T>,
  ): Promise<T> {
    return this.unitOfWork.execute(async (repositories) => {
      const card = await authorizeEditorAccess(repositories, this.tokens, cardId, sessionToken, this.now(), authorization);
      const result = await work(repositories, card);
      await auditAdminWorkspaceEdit(repositories, authorization, cardId, this.constructor.name);
      return result;
    });
  }
}
export class UpdateCardSections extends BuilderUseCase {
  execute(input: UpdateCardSectionsInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(updateCardSectionsSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }) =>
      toRenderableCardDTO(
        await capability(cards.replaceSections, "replaceSections").call(
          cards,
          value.cardId,
          value.sections.map((section, position) => ({ ...section, position })),
        ),
      ),
    );
  }
}
export class CreateCardButton extends BuilderUseCase {
  execute(input: CreateCardButtonInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(createCardButtonSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }, card) =>
      toRenderableCardDTO(
        await capability(cards.createButton, "createButton").call(cards, {
          cardId: value.cardId,
          label: value.label,
          url: value.url,
          isVisible: value.isVisible,
          position: card.buttons.length,
        }),
      ),
    );
  }
}
export class UpdateCardButton extends BuilderUseCase {
  execute(input: UpdateCardButtonInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(updateCardButtonSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (!card.buttons.some((button) => button.id === value.buttonId))
          throw new NotFoundError("CardButton", value.buttonId);
        return toRenderableCardDTO(
          await capability(cards.updateButton, "updateButton").call(
            cards,
            value,
          ),
        );
      },
    );
  }
}
export class DeleteCardButton extends BuilderUseCase {
  execute(input: DeleteCardButtonInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(deleteCardButtonSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (!card.buttons.some((button) => button.id === value.buttonId))
          throw new NotFoundError("CardButton", value.buttonId);
        return toRenderableCardDTO(
          await capability(cards.deleteButton, "deleteButton").call(
            cards,
            value.cardId,
            value.buttonId,
            this.now(),
          ),
        );
      },
    );
  }
}
export class ReorderCardButtons extends BuilderUseCase {
  execute(input: ReorderCardButtonsInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(reorderCardButtonsSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (
          value.buttonIds.length !== card.buttons.length ||
          value.buttonIds.some(
            (id) => !card.buttons.some((button) => button.id === id),
          )
        )
          throw new ConflictError(
            "Button order must contain every button exactly once",
          );
        return toRenderableCardDTO(
          await capability(cards.reorderButtons, "reorderButtons").call(
            cards,
            value.cardId,
            value.buttonIds,
          ),
        );
      },
    );
  }
}
export class CreateSocialLink extends BuilderUseCase {
  execute(input: CreateSocialLinkInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(createSocialLinkSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }, card) =>
      toRenderableCardDTO(
        await capability(cards.createSocialLink, "createSocialLink").call(
          cards,
          {
            cardId: value.cardId,
            platform: value.platform,
            label: value.label ?? null,
            url: value.url,
            isVisible: value.isVisible,
            position: card.socialLinks.length,
          },
        ),
      ),
    );
  }
}
export class UpdateSocialLink extends BuilderUseCase {
  execute(input: UpdateSocialLinkInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(updateSocialLinkSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (!card.socialLinks.some((link) => link.id === value.socialLinkId))
          throw new NotFoundError("SocialLink", value.socialLinkId);
        return toRenderableCardDTO(
          await capability(cards.updateSocialLink, "updateSocialLink").call(
            cards,
            value,
          ),
        );
      },
    );
  }
}
export class DeleteSocialLink extends BuilderUseCase {
  execute(input: DeleteSocialLinkInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(deleteSocialLinkSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (!card.socialLinks.some((link) => link.id === value.socialLinkId))
          throw new NotFoundError("SocialLink", value.socialLinkId);
        return toRenderableCardDTO(
          await capability(cards.deleteSocialLink, "deleteSocialLink").call(
            cards,
            value.cardId,
            value.socialLinkId,
            this.now(),
          ),
        );
      },
    );
  }
}
export class ReorderSocialLinks extends BuilderUseCase {
  execute(input: ReorderSocialLinksInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(reorderSocialLinksSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async ({ cards }, card) => {
        if (
          value.socialLinkIds.length !== card.socialLinks.length ||
          value.socialLinkIds.some(
            (id) => !card.socialLinks.some((link) => link.id === id),
          )
        )
          throw new ConflictError(
            "Social-link order must contain every link exactly once",
          );
        return toRenderableCardDTO(
          await capability(cards.reorderSocialLinks, "reorderSocialLinks").call(
            cards,
            value.cardId,
            value.socialLinkIds,
          ),
        );
      },
    );
  }
}
export class ChangeCardSlug extends BuilderUseCase {
  execute(input: ChangeCardSlugInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
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
      return toRenderableCardDTO(
        await capability(cards.updateSettings, "updateSettings").call(
          cards,
          value.cardId,
          { slug: value.slug },
        ),
      );
    });
  }
}
export class ValidateCardSlug extends BuilderUseCase {
  execute(
    input: ValidateCardSlugInput,
    authorization?: EditorAuthorizationContext,
  ): Promise<{ slug: string; available: boolean }> {
    const value = parseUseCaseInput(validateCardSlugSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }) => ({
      slug: value.slug,
      available: !(await capability(cards.slugExists, "slugExists").call(
        cards,
        value.slug,
        value.cardId,
      )),
    }));
  }
}
export class UpdateCardMetadata extends BuilderUseCase {
  execute(input: UpdateCardMetadataInput, authorization?: EditorAuthorizationContext): Promise<PublicCardDTO> {
    const value = parseUseCaseInput(updateCardMetadataSchema, input);
    return this.run(value.cardId, value.sessionToken, authorization, async ({ cards }) =>
      toRenderableCardDTO(
        await capability(cards.updateSettings, "updateSettings").call(
          cards,
          value.cardId,
          {
            visibility: value.visibility,
            seoTitle: value.seoTitle,
            seoDescription: value.seoDescription,
          },
        ),
      ),
    );
  }
}
