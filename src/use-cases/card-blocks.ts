import type { CardBlockDTO, EditorCardDTO, WorkspaceCardDTO } from "@/dto";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import type {
  CardBlockCommand,
  TransactionRepositories,
  UnitOfWork,
} from "@/repositories";
import type { SessionTokenGenerator } from "@/services/credential-security.service";
import {
  cardBlockKindSchema,
  createCardBlockSchema,
  deleteCardBlockSchema,
  duplicateCardBlockSchema,
  parseCardBlockConfig,
  reorderCardBlocksSchema,
  updateCardBlockSchema,
} from "@/validation/card-block";
import { toWorkspaceCardDTO } from "./card-mappers";
import { parseUseCaseInput } from "./shared";
import { auditAdminWorkspaceEdit, authorizeEditorAccess, type EditorAuthorizationContext } from "./editor-authorization";
const capability = <T>(value: T | undefined, name: string): T => {
  if (!value) throw new Error(`Card repository does not implement ${name}`);
  return value;
};
function referencedMedia(config: unknown): readonly string[] {
  if (!config || typeof config !== "object") return [];
  const value = config as Record<string, unknown>,
    ids: string[] = [];
  if (typeof value.mediaId === "string") ids.push(value.mediaId);
  if (Array.isArray(value.mediaIds))
    for (const id of value.mediaIds) if (typeof id === "string") ids.push(id);
  return [...new Set(ids)];
}
function command(block: CardBlockDTO): CardBlockCommand {
  return {
    kind: block.kind,
    position: block.position,
    isEnabled: block.isEnabled,
    config: block.config,
    mediaIds: block.mediaIds,
  };
}
async function materialize(
  repositories: TransactionRepositories,
  card: EditorCardDTO,
): Promise<EditorCardDTO> {
  if (card.blocks?.length) return card;
  const legacy = toWorkspaceCardDTO(card).editorBlocks ?? [];
  return capability(repositories.cards.replaceBlocks, "replaceBlocks").call(
    repositories.cards,
    card.id,
    legacy.map(command),
  );
}
async function validateMedia(
  repositories: TransactionRepositories,
  cardId: string,
  ids: readonly string[],
) {
  if (
    ids.length &&
    !(await capability(
      repositories.cards.mediaIdsBelongToCardCustomer,
      "mediaIdsBelongToCardCustomer",
    ).call(repositories.cards, cardId, ids))
  )
    throw new ForbiddenError(
      "One or more media references do not belong to this card owner",
    );
}
abstract class BlockUseCase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    protected readonly tokens: SessionTokenGenerator,
    protected readonly now: () => Date = () => new Date(),
  ) {}
  protected run<T>(
    cardId: string,
    token: string,
    authorization: EditorAuthorizationContext | undefined,
    work: (
      repositories: TransactionRepositories,
      card: EditorCardDTO,
    ) => Promise<T>,
  ) {
    return this.unitOfWork.execute(async (repositories) => {
      const card = await authorizeEditorAccess(repositories, this.tokens, cardId, token, this.now(), authorization);
      const result = await work(repositories, card);
      await auditAdminWorkspaceEdit(repositories, authorization, cardId, this.constructor.name);
      return result;
    });
  }
}
export class InitializeCardBlocks extends BlockUseCase {
  execute(input: {
    cardId: string;
    sessionToken: string;
  }, authorization?: EditorAuthorizationContext): Promise<WorkspaceCardDTO> {
    const value = parseUseCaseInput(
      deleteCardBlockSchema.omit({ blockId: true }),
      input,
    );
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async (repositories, card) =>
        toWorkspaceCardDTO(await materialize(repositories, card)),
    );
  }
}
export class CreateCardBlock extends BlockUseCase {
  execute(input: unknown, authorization?: EditorAuthorizationContext): Promise<WorkspaceCardDTO> {
    const value = parseUseCaseInput(createCardBlockSchema, input),
      config = parseCardBlockConfig(value.kind, value.config),
      mediaIds = referencedMedia(config);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async (repositories, source) => {
        const card = await materialize(repositories, source);
        await validateMedia(repositories, value.cardId, mediaIds);
        return toWorkspaceCardDTO(
          await capability(repositories.cards.createBlock, "createBlock").call(
            repositories.cards,
            {
              cardId: value.cardId,
              kind: value.kind,
              config,
              isEnabled: value.isEnabled,
              mediaIds,
              position: card.blocks?.length ?? 0,
            },
          ),
        );
      },
    );
  }
}
export class UpdateCardBlock extends BlockUseCase {
  execute(input: unknown, authorization?: EditorAuthorizationContext): Promise<WorkspaceCardDTO> {
    const value = parseUseCaseInput(updateCardBlockSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async (repositories, card) => {
        const existing = card.blocks?.find(
          (block) => block.id === value.blockId,
        );
        if (!existing) throw new NotFoundError("CardBlock", value.blockId);
        const parsed =
            typeof value.config === "undefined"
              ? undefined
              : parseCardBlockConfig(
                  cardBlockKindSchema.parse(existing.kind),
                  value.config,
                ),
          mediaIds = parsed ? referencedMedia(parsed) : undefined;
        if (mediaIds) await validateMedia(repositories, value.cardId, mediaIds);
        return toWorkspaceCardDTO(
          await capability(repositories.cards.updateBlock, "updateBlock").call(
            repositories.cards,
            {
              cardId: value.cardId,
              blockId: value.blockId,
              config: parsed,
              isEnabled: value.isEnabled,
              mediaIds,
            },
          ),
        );
      },
    );
  }
}
export class DeleteCardBlock extends BlockUseCase {
  execute(input: unknown, authorization?: EditorAuthorizationContext): Promise<WorkspaceCardDTO> {
    const value = parseUseCaseInput(deleteCardBlockSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async (repositories, card) => {
        if ((card.blocks?.length ?? 0) <= 1)
          throw new ConflictError("A card must keep at least one block");
        if (!card.blocks?.some((block) => block.id === value.blockId))
          throw new NotFoundError("CardBlock", value.blockId);
        return toWorkspaceCardDTO(
          await capability(repositories.cards.deleteBlock, "deleteBlock").call(
            repositories.cards,
            value.cardId,
            value.blockId,
            this.now(),
          ),
        );
      },
    );
  }
}
export class DuplicateCardBlock extends BlockUseCase {
  execute(input: unknown, authorization?: EditorAuthorizationContext): Promise<WorkspaceCardDTO> {
    const value = parseUseCaseInput(duplicateCardBlockSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async (repositories, card) => {
        if (!card.blocks?.some((block) => block.id === value.blockId))
          throw new NotFoundError("CardBlock", value.blockId);
        return toWorkspaceCardDTO(
          await capability(
            repositories.cards.duplicateBlock,
            "duplicateBlock",
          ).call(repositories.cards, value.cardId, value.blockId),
        );
      },
    );
  }
}
export class ReorderCardBlocks extends BlockUseCase {
  execute(input: unknown, authorization?: EditorAuthorizationContext): Promise<WorkspaceCardDTO> {
    const value = parseUseCaseInput(reorderCardBlocksSchema, input);
    return this.run(
      value.cardId,
      value.sessionToken,
      authorization,
      async (repositories, card) => {
        const ids = card.blocks?.map((block) => block.id) ?? [];
        if (
          value.blockIds.length !== ids.length ||
          value.blockIds.some((id) => !ids.includes(id))
        )
          throw new ConflictError(
            "Block order must contain every block exactly once",
          );
        return toWorkspaceCardDTO(
          await capability(
            repositories.cards.reorderBlocks,
            "reorderBlocks",
          ).call(repositories.cards, value.cardId, value.blockIds),
        );
      },
    );
  }
}
