import type { WorkspaceScope } from "@/domain/workspace-access";
import type { UnitOfWork } from "@/repositories";
import type { MediaService } from "@/services/media.service";
import type { SessionTokenGenerator } from "@/services/credential-security.service";
import { uuidSchema } from "@/validation/common";
import { z } from "zod";
import { requestTag } from "@/lib/request-context";
import { authorizeEditorAccess, type EditorAuthorizationContext } from "./editor-authorization";
import { parseUseCaseInput } from "./shared";

const uploadCardAvatarSchema = z.object({
  cardId: uuidSchema,
  sessionToken: z.string().regex(/^[0-9a-f]{64}$/),
});

export interface UploadCardAvatarFile {
  fileName: string;
  contentType: string;
  byteSize: number;
  extension: string;
  body: Uint8Array;
}

export interface UploadCardAvatarResult {
  mediaAssetId: string;
  publicUrl: string | null;
  slug: string;
}

/**
 * Uploads a card profile avatar.
 *
 * Resolves the card's REAL workspace + customer (never the cardId) so the
 * resulting MediaFolder/MediaAsset rows satisfy their Workspace foreign key,
 * then stores the asset through the existing MediaService.
 */
export class UploadCardAvatar {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly media: MediaService,
    private readonly tokens: SessionTokenGenerator,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(
    input: UploadCardAvatarFile & { cardId: string; sessionToken: string },
    authorization?: EditorAuthorizationContext,
  ): Promise<UploadCardAvatarResult> {
    const reqStart = performance.now();
    const command = parseUseCaseInput(uploadCardAvatarSchema, {
      cardId: input.cardId,
      sessionToken: input.sessionToken,
    });

    // Verify the editor session, then resolve the card's real ownership
    // (workspace + customer). Media is scoped to this real workspace so the
    // MediaFolder_workspaceId_fkey constraint is satisfied.
    const t1 = performance.now();
    const ownership = await this.unitOfWork.execute(async (repositories) => {
      const ta = performance.now();
      await authorizeEditorAccess(
        repositories,
        this.tokens,
        command.cardId,
        command.sessionToken,
        this.now(),
        authorization,
        "AUTOSAVE",
      );
      if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [upload] Tx1 authorizeEditorAccess: ${Math.round(performance.now() - ta)}ms`);
      const tb = performance.now();
      const owner = await repositories.cards.findOwnership?.(command.cardId);
      if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [upload] Tx1 findOwnership: ${Math.round(performance.now() - tb)}ms`);
      if (!owner) {
        throw new Error("Unable to resolve card ownership for upload");
      }
      return owner;
    });
    if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [upload] Tx1 total: ${Math.round(performance.now() - t1)}ms`);

    const scope: WorkspaceScope = {
      workspaceId: ownership.workspaceId,
      accountId: ownership.customerId,
      membershipId: ownership.customerId,
      role: "OWNER",
    };

    const t2 = performance.now();
    const asset = await this.media.upload({
      fileName: input.fileName,
      originalFilename: input.fileName,
      contentType: input.contentType,
      byteSize: input.byteSize,
      extension: input.extension,
      body: input.body,
      scope,
      customerId: ownership.customerId,
      altText: "Profile photo",
      tags: ["avatar", "profile"],
    });
    if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [upload] media.upload: ${Math.round(performance.now() - t2)}ms`);

    // Link the media asset to the card so it survives refresh
    const t3 = performance.now();
    await this.unitOfWork.execute(async (repositories) => {
      await repositories.cards.linkMediaAsset?.(command.cardId, asset.id, "AVATAR");
    });
    if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [upload] Tx2 linkMediaAsset: ${Math.round(performance.now() - t3)}ms`);

    if (process.env.NODE_ENV === "development") console.log(`${requestTag()} [upload] total request: ${Math.round(performance.now() - reqStart)}ms`);
    return { mediaAssetId: asset.id, publicUrl: asset.publicUrl, slug: ownership.slug };
  }
}
