import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type {
  CardDTO,
  CardProfileDTO,
  CardSectionDTO,
  CardSectionKind,
  EditorCardDTO,
} from "@/dto";
import type {
  AutosaveCardProjection,
  BuilderCardProjection,
  PublishCardProjection,
  PublicCardProjection,
  CardLookupCriteria,
  CardReadRepository,
  MutationResult,
  CardWriteRepository,
  CreateCardButtonCommand,
  CreateCardCommand,
  CreateSocialLinkCommand,
  UpdateCardButtonCommand,
  UpdateCardCommand,
  UpdateCardSettingsCommand,
  UpdateSocialLinkCommand,
  CardSectionCommand,
  CardBlockCommand,
  CreateCardBlockCommand,
  UpdateCardBlockCommand,
} from "./contracts";
import type { AppearanceSettings } from "@/types/appearance";
import { serializeAppearance } from "@/validation/appearance";
import {
  autosaveCardSelect,
  builderCardSelect,
  cardBaseSelect,
  duplicateCardSelect,
  publicCardSelect,
  publishCardSelect,
  workspaceCardSelect,
  type AutosaveCardRow,
  type BuilderCardRow,
  type CardRow,
  type DuplicateCardRow,
  type PublicCardRow,
  type PublishCardRow,
  type WorkspaceCardRow,
} from "./card.projections";

const SECTION_KINDS: readonly CardSectionKind[] = [
  "PROFILE",
  "ABOUT",
  "CONTACT",
  "BUTTONS",
  "SOCIAL_LINKS",
];
const isSectionKind = (value: string): value is CardSectionKind =>
  SECTION_KINDS.some((kind) => kind === value);
function mapProfile(row: CardRow["profile"]): CardProfileDTO | null {
  return row
    ? {
        fullName: row.fullName,
        headline: row.headline,
        company: row.company,
        bio: row.bio,
        email: row.email,
        phone: row.phone,
        website: row.website,
        address: row.address,
        countryCode: row.countryCode,
      }
    : null;
}
function mapCard(row: CardRow): CardDTO {
  return {
    id: row.id,
    customerId: row.customerId,
    slug: row.slug,
    name: row.name,
    status: row.status,
    visibility: row.visibility,
    publishedAt: row.publishedAt,
    accessVersion: row.accessVersion,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    profile: mapProfile(row.profile),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
function mapSections(
  rows: WorkspaceCardRow["sections"],
): readonly CardSectionDTO[] {
  const valid = rows
    .filter((row): row is typeof row & { kind: CardSectionKind } =>
      isSectionKind(row.kind),
    )
    .map((row) => ({ ...row, kind: row.kind }));
  const missing = SECTION_KINDS.filter(
    (kind) => !valid.some((row) => row.kind === kind),
  ).map((kind, index) => ({
    id: `default-${kind.toLowerCase()}`,
    kind,
    title: null,
    position: valid.length + index,
    isVisible: true,
  }));
  return [...valid, ...missing].sort((a, b) => a.position - b.position);
}
function mapEditorCard(
  row: WorkspaceCardRow | DuplicateCardRow,
): EditorCardDTO {
  const avatarUrl = "media" in row ? row.media[0]?.mediaAsset.publicUrl ?? null : null;
  return {
    ...mapCard(row),
    themeConfig: row.themeConfig ?? null,
    sections: mapSections(row.sections),
    blocks: row.blocks.map((block) => ({
      id: block.id,
      kind: block.kind,
      position: block.position,
      isEnabled: block.isEnabled,
      config: block.config,
      mediaIds: block.media.map((item) => item.mediaAssetId),
    })),
    buttons: row.buttons.map((button) => ({ ...button })),
    socialLinks: row.socialLinks.map((link) => ({ ...link })),
    avatarUrl,
  };
}
function mapBuilderCard(row: BuilderCardRow): BuilderCardProjection {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    sections: mapSections(row.sections),
    blocks: row.blocks.map((block) => ({
      id: block.id,
      kind: block.kind,
      position: block.position,
      isEnabled: block.isEnabled,
      config: block.config,
      mediaIds: block.media.map((item) => item.mediaAssetId),
    })),
    buttonIds: row.buttons.map((button) => button.id),
    socialLinkIds: row.socialLinks.map((link) => link.id),
  };
}
function mapPublicCard(row: PublicCardRow): PublicCardProjection {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    visibility: row.visibility,
    publishedAt: row.publishedAt,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    profile: mapProfile(row.profile),
    themeConfig: row.themeConfig ?? null,
    sections: mapSections(row.sections),
    blocks: row.blocks.map((block) => ({
      id: block.id,
      kind: block.kind,
      position: block.position,
      isEnabled: block.isEnabled,
      config: block.config,
      mediaIds: block.media.map((item) => item.mediaAssetId),
    })),
    buttons: row.buttons.map((button) => ({ ...button })),
    socialLinks: row.socialLinks.map((link) => ({ ...link })),
    avatarUrl: row.media[0]?.mediaAsset.publicUrl ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
interface CardDatabase {
  card: Prisma.TransactionClient["card"];
  cardSection: Prisma.TransactionClient["cardSection"];
  cardButton: Prisma.TransactionClient["cardButton"];
  socialLink: Prisma.TransactionClient["socialLink"];
  cardBlock: Prisma.TransactionClient["cardBlock"];
  cardBlockMedia: Prisma.TransactionClient["cardBlockMedia"];
  cardMedia: Prisma.TransactionClient["cardMedia"];
  mediaAsset: Prisma.TransactionClient["mediaAsset"];
  customer: Prisma.TransactionClient["customer"];
}
abstract class CardRepositoryBase implements CardReadRepository {
  constructor(protected readonly db: CardDatabase, protected readonly workspaceId?: string) {}
  protected ownedWhere(id: string): Prisma.CardWhereInput {
    return { id, ...(this.workspaceId ? { workspaceId: this.workspaceId } : {}) };
  }
  async findById(id: string, deletedAt: null | Date): Promise<CardDTO | null> {
    const row = await this.db.card.findFirst({
      where: { ...this.ownedWhere(id), deletedAt },
      select: cardBaseSelect,
    });
    return row ? mapCard(row) : null;
  }
  async findWorkspaceById(
    id: string,
    deletedAt: null | Date,
  ): Promise<EditorCardDTO | null> {
    const t0 = performance.now();
    const row = await this.db.card.findFirst({
      where: { ...this.ownedWhere(id), deletedAt },
      select: workspaceCardSelect,
    });
    const queryMs = Math.round(performance.now() - t0);
    const mapped = row ? mapEditorCard(row) : null;
    const totalMs = Math.round(performance.now() - t0);
    if (process.env.NODE_ENV === "development" && queryMs > 100) {
      console.log(`[findWorkspaceById] Prisma query: ${queryMs}ms, mapping: ${totalMs - queryMs}ms, total: ${totalMs}ms`);
    }
    return mapped;
  }
  async findAutosaveById(
    id: string,
    deletedAt: null | Date,
  ): Promise<AutosaveCardProjection | null> {
    const row: AutosaveCardRow | null = await this.db.card.findFirst({
      where: { ...this.ownedWhere(id), deletedAt },
      select: autosaveCardSelect,
    });
    return row;
  }
  async findPublishById(
    id: string,
    deletedAt: null | Date,
  ): Promise<PublishCardProjection | null> {
    const row: PublishCardRow | null = await this.db.card.findFirst({
      where: { ...this.ownedWhere(id), deletedAt },
      select: publishCardSelect,
    });
    return row;
  }
  async findBuilderById(
    id: string,
    deletedAt: null | Date,
  ): Promise<BuilderCardProjection | null> {
    const row = await this.db.card.findFirst({
      where: { ...this.ownedWhere(id), deletedAt },
      select: builderCardSelect,
    });
    return row ? mapBuilderCard(row) : null;
  }
  async findDuplicateById(
    id: string,
    deletedAt: null | Date,
  ): Promise<EditorCardDTO | null> {
    const row = await this.db.card.findFirst({
      where: { ...this.ownedWhere(id), deletedAt },
      select: duplicateCardSelect,
    });
    return row ? mapEditorCard(row) : null;
  }
  async findPublicBySlug(
    criteria: CardLookupCriteria,
  ): Promise<PublicCardProjection | null> {
    const row = await this.db.card.findFirst({
      where: {
        slug: criteria.slug,
        status: { in: [...criteria.statuses] },
        visibility: { in: [...criteria.visibilities] },
        deletedAt: criteria.deletedAt,
      },
      select: publicCardSelect,
    });
    return row ? mapPublicCard(row) : null;
  }
  async findEditorById(id: string, deletedAt: null | Date): Promise<EditorCardDTO | null> {
    return this.findWorkspaceById(id, deletedAt);
  }
  async findEditorForMutationById(id: string, deletedAt: null | Date): Promise<EditorCardDTO | null> {
    return this.findDuplicateById(id, deletedAt);
  }
  async findRenderSourceBySlug(
    criteria: CardLookupCriteria,
  ): Promise<EditorCardDTO | null> {
    const row = await this.db.card.findFirst({
      where: {
        slug: criteria.slug,
        status: { in: [...criteria.statuses] },
        visibility: { in: [...criteria.visibilities] },
        deletedAt: criteria.deletedAt,
      },
      select: workspaceCardSelect,
    });
    return row ? mapEditorCard(row) : null;
  }
  async slugExists(slug: string, excludeCardId?: string): Promise<boolean> {
    return (
      (await this.db.card.count({
        where: {
          slug,
          deletedAt: null,
          ...(this.workspaceId ? { workspaceId: this.workspaceId } : {}),
          ...(excludeCardId ? { id: { not: excludeCardId } } : {}),
        },
      })) > 0
    );
  }
  async mediaIdsBelongToCardCustomer(
    cardId: string,
    mediaIds: readonly string[],
  ): Promise<boolean> {
    if (!mediaIds.length) return true;
    const card = await this.db.card.findFirst({
      where: this.ownedWhere(cardId),
      select: { customerId: true, workspaceId: true },
    });
    if (!card) return false;
    return (
      (await this.db.mediaAsset.count({
        where: {
          id: { in: [...mediaIds] },
          customerId: card.customerId,
          workspaceId: card.workspaceId,
          deletedAt: null,
        },
      })) === new Set(mediaIds).size
    );
  }
  async findOwnership(
    cardId: string,
  ): Promise<{ customerId: string; workspaceId: string; slug: string } | null> {
    const row = await this.db.card.findFirst({
      where: this.ownedWhere(cardId),
      select: { customerId: true, workspaceId: true, slug: true },
    });
    return row ?? null;
  }
  async linkMediaAsset(cardId: string, mediaAssetId: string, role: string): Promise<void> {
    // Remove any existing link with the same role (one avatar at a time)
    await this.db.cardMedia.deleteMany({ where: { cardId, role: role as "AVATAR" | "COVER" | "LOGO" | "IMAGE" | "DOCUMENT" } });
    await this.db.cardMedia.create({
      data: { cardId, mediaAssetId, role: role as "AVATAR" | "COVER" | "LOGO" | "IMAGE" | "DOCUMENT", position: 0 },
    });
  }
}
export class PrismaCardReadRepository extends CardRepositoryBase {
  constructor(db: PrismaClient) {
    super(db);
  }
}

/** Tenant-safe card reads. Public slug rendering continues through PrismaCardReadRepository. */
export class PrismaWorkspaceCardReadRepository extends CardRepositoryBase {
  constructor(db: PrismaClient, workspaceId: string) {
    super(db, workspaceId);
  }
}
export class PrismaCardTransactionRepository
  extends CardRepositoryBase
  implements CardWriteRepository
{
  constructor(db: Prisma.TransactionClient, workspaceId?: string) {
    super(db, workspaceId);
  }
  private async assertOwned(cardId: string): Promise<void> {
    if (!this.workspaceId) return;
    await this.db.card.findFirstOrThrow({ where: this.ownedWhere(cardId), select: { id: true } });
  }
  async create(command: CreateCardCommand): Promise<CardDTO> {
    const owner = await this.db.customer.findFirstOrThrow({
      where: { id: command.customerId, deletedAt: null },
      select: { workspaceId: true },
    });
    if (this.workspaceId && owner.workspaceId !== this.workspaceId) throw new Error("Customer does not belong to the current workspace");
    const row = await this.db.card.create({
      data: {
        workspaceId: owner.workspaceId,
        customerId: command.customerId,
        orderId: command.orderId,
        slug: command.slug,
        name: command.name,
        profile: {
          create: { fullName: command.fullName, ...command.initialProfile },
        },
        sections: {
          create: SECTION_KINDS.map((kind, position) => ({
            kind,
            position,
            isVisible: true,
          })),
        },
      },
      select: cardBaseSelect,
    });
    return mapCard(row);
  }
  async update(id: string, command: UpdateCardCommand): Promise<CardDTO> {
    await this.assertOwned(id);
    if (command.customerId) {
      const [cardOwner, customerOwner] = await Promise.all([
        this.db.card.findUniqueOrThrow({ where: { id }, select: { workspaceId: true } }),
        this.db.customer.findFirstOrThrow({ where: { id: command.customerId, deletedAt: null }, select: { workspaceId: true } }),
      ]);
      if (cardOwner.workspaceId !== customerOwner.workspaceId) throw new Error("Card transfer must remain inside its workspace");
    }
    const { profile, ...card } = command;
    return mapCard(
      await this.db.card.update({
        where: { id },
        data: { ...card, ...(profile ? { profile: { update: profile } } : {}) },
        select: cardBaseSelect,
      }),
    );
  }
  async updatePublication(
    id: string,
    command: Pick<
      UpdateCardCommand,
      "status" | "visibility" | "publishedAt"
    >,
  ): Promise<MutationResult> {
    await this.assertOwned(id);
    return this.db.card.update({
      where: { id },
      data: command,
      select: { id: true },
    });
  }
  async updateAppearance(
    cardId: string,
    appearance: AppearanceSettings,
  ): Promise<MutationResult & { slug: string }> {
    await this.assertOwned(cardId);
    return this.db.card.update({
      where: { id: cardId },
      data: {
        themeConfig: serializeAppearance(appearance) as Prisma.InputJsonValue,
      },
      select: { id: true, slug: true },
    });
  }
  async updateSettings(
    cardId: string,
    command: UpdateCardSettingsCommand,
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    return this.db.card.update({
      where: { id: cardId },
      data: command,
      select: { id: true },
    });
  }
  async replaceSections(
    cardId: string,
    sections: readonly CardSectionCommand[],
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    await this.db.cardSection.updateMany({
      where: { cardId, deletedAt: null },
      data: { position: { increment: 1000 } },
    });
    for (const [index, section] of sections.entries())
      await this.db.cardSection.upsert({
        where: { cardId_kind: { cardId, kind: section.kind } },
        update: {
          position: index,
          isVisible: section.isVisible,
          title: section.title,
          deletedAt: null,
        },
        create: {
          cardId,
          kind: section.kind,
          position: index,
          isVisible: section.isVisible,
          title: section.title,
        },
      });
    return { id: cardId };
  }
  async createButton(command: CreateCardButtonCommand): Promise<MutationResult> {
    await this.assertOwned(command.cardId);
    // Compute next position from the database — MAX(position) + 1 across ALL
    // rows (including soft-deleted ones) so gaps from non-tail deletions
    // never cause a unique-constraint collision.  Deleted rows have already
    // been bumped to position + 1000 by deleteButton().
    const maximum = await this.db.cardButton.aggregate({
      where: { cardId: command.cardId },
      _max: { position: true },
    });
    await this.db.cardButton.create({
      data: { ...command, position: (maximum._max.position ?? -1) + 1 },
      select: { id: true },
    });
    return { id: command.cardId };
  }
  async updateButton(command: UpdateCardButtonCommand): Promise<MutationResult> {
    await this.assertOwned(command.cardId);
    const { cardId, buttonId, ...data } = command;
    await this.db.cardButton.updateMany({
      where: { id: buttonId, cardId, deletedAt: null },
      data,
    });
    return { id: cardId };
  }
  async deleteButton(
    cardId: string,
    buttonId: string,
    deletedAt: Date,
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    await this.db.cardButton.updateMany({
      where: { id: buttonId, cardId, deletedAt: null },
      data: { deletedAt, isVisible: false, position: { increment: 1000 } },
    });
    return { id: cardId };
  }
  async reorderButtons(
    cardId: string,
    buttonIds: readonly string[],
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    await this.db.cardButton.updateMany({
      where: { cardId },
      data: { position: { increment: 1000 } },
    });
    for (const [position, id] of buttonIds.entries())
      await this.db.cardButton.updateMany({
        where: { id, cardId, deletedAt: null },
        data: { position },
      });
    return { id: cardId };
  }
  async createSocialLink(
    command: CreateSocialLinkCommand,
  ): Promise<MutationResult> {
    await this.assertOwned(command.cardId);
    const maximum = await this.db.socialLink.aggregate({
      where: { cardId: command.cardId },
      _max: { position: true },
    });
    await this.db.socialLink.create({
      data: { ...command, position: (maximum._max.position ?? -1) + 1 },
      select: { id: true },
    });
    return { id: command.cardId };
  }
  async updateSocialLink(
    command: UpdateSocialLinkCommand,
  ): Promise<MutationResult> {
    await this.assertOwned(command.cardId);
    const { cardId, socialLinkId, ...data } = command;
    await this.db.socialLink.updateMany({
      where: { id: socialLinkId, cardId, deletedAt: null },
      data,
    });
    return { id: cardId };
  }
  async deleteSocialLink(
    cardId: string,
    socialLinkId: string,
    deletedAt: Date,
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    await this.db.socialLink.updateMany({
      where: { id: socialLinkId, cardId, deletedAt: null },
      data: { deletedAt, isVisible: false, position: { increment: 1000 } },
    });
    return { id: cardId };
  }
  async reorderSocialLinks(
    cardId: string,
    socialLinkIds: readonly string[],
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    await this.db.socialLink.updateMany({
      where: { cardId },
      data: { position: { increment: 1000 } },
    });
    for (const [position, id] of socialLinkIds.entries())
      await this.db.socialLink.updateMany({
        where: { id, cardId, deletedAt: null },
        data: { position },
      });
    return { id: cardId };
  }
  private async syncBlockMedia(blockId: string, mediaIds: readonly string[]) {
    await this.db.cardBlockMedia.deleteMany({ where: { blockId } });
    if (mediaIds.length)
      await this.db.cardBlockMedia.createMany({
        data: mediaIds.map((mediaAssetId, position) => ({
          blockId,
          mediaAssetId,
          position,
        })),
      });
  }
  async replaceBlocks(
    cardId: string,
    blocks: readonly CardBlockCommand[],
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    await this.db.cardBlock.updateMany({
      where: { cardId, deletedAt: null },
      data: { position: { increment: 1000 } },
    });
    for (const [position, block] of blocks.entries()) {
      const created = await this.db.cardBlock.create({
        data: {
          cardId,
          kind: block.kind,
          position,
          isEnabled: block.isEnabled,
          config: block.config as Prisma.InputJsonValue,
        },
        select: { id: true },
      });
      await this.syncBlockMedia(created.id, block.mediaIds);
    }
    return { id: cardId };
  }
  async createBlock(command: CreateCardBlockCommand): Promise<MutationResult> {
    await this.assertOwned(command.cardId);
    const maximum = await this.db.cardBlock.aggregate({
      where: { cardId: command.cardId },
      _max: { position: true },
    });
    const block = await this.db.cardBlock.create({
      data: {
        cardId: command.cardId,
        kind: command.kind,
        position: (maximum._max.position ?? -1) + 1,
        isEnabled: command.isEnabled,
        config: command.config as Prisma.InputJsonValue,
      },
      select: { id: true },
    });
    await this.syncBlockMedia(block.id, command.mediaIds);
    return { id: command.cardId };
  }
  async updateBlock(command: UpdateCardBlockCommand): Promise<MutationResult> {
    await this.assertOwned(command.cardId);
    const { cardId, blockId, mediaIds, config, ...data } = command;
    await this.db.cardBlock.updateMany({
      where: { id: blockId, cardId, deletedAt: null },
      data: {
        ...data,
        ...(config !== undefined
          ? { config: config as Prisma.InputJsonValue }
          : {}),
      },
    });
    if (mediaIds) await this.syncBlockMedia(blockId, mediaIds);
    return { id: cardId };
  }
  async deleteBlock(
    cardId: string,
    blockId: string,
    deletedAt: Date,
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    await this.db.cardBlock.updateMany({
      where: { id: blockId, cardId, deletedAt: null },
      data: { deletedAt, isEnabled: false, position: { increment: 1000 } },
    });
    return { id: cardId };
  }
  async duplicateBlock(
    cardId: string,
    blockId: string,
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    const source = await this.db.cardBlock.findFirstOrThrow({
      where: { id: blockId, cardId, deletedAt: null },
      select: {
        kind: true,
        isEnabled: true,
        config: true,
        media: { orderBy: { position: "asc" }, select: { mediaAssetId: true } },
      },
    });
    return this.createBlock({
      cardId,
      kind: source.kind,
      isEnabled: source.isEnabled,
      config: source.config,
      mediaIds: source.media.map((item) => item.mediaAssetId),
      position: 0,
    });
  }
  async reorderBlocks(
    cardId: string,
    blockIds: readonly string[],
  ): Promise<MutationResult> {
    await this.assertOwned(cardId);
    await this.db.cardBlock.updateMany({
      where: { cardId },
      data: { position: { increment: 2000 } },
    });
    for (const [position, id] of blockIds.entries())
      await this.db.cardBlock.updateMany({
        where: { id, cardId, deletedAt: null },
        data: { position },
      });
    return { id: cardId };
  }

  async incrementAccessVersion(cardId: string): Promise<void> {
    await this.assertOwned(cardId);
    await this.db.card.update({
      where: { id: cardId },
      data: { accessVersion: { increment: 1 } },
      select: { id: true },
    });
  }
}

/** Tenant-safe card writes; every mutation verifies the card workspace first. */
export class PrismaWorkspaceCardTransactionRepository extends PrismaCardTransactionRepository {
  constructor(db: Prisma.TransactionClient, workspaceId: string) {
    super(db, workspaceId);
  }
}
