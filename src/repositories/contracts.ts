import type {
  AccessCodeDTO,
  CardDTO,
  CardSectionKind,
  CustomerDTO,
  EditorCardDTO,
  OrderDTO,
  PublicCardDTO,
} from "@/dto";
import type {
  AccessCodeStatus,
  CardStatus,
  CardVisibility,
  CustomerStatus,
  FulfillmentStatus,
  OrderPackage,
  OrderStatus,
  PaymentStatus,
} from "@/types";
import type { AppearanceSettings } from "@/types/appearance";
import type { WorkspaceScope } from "@/domain/workspace-access";

export interface CreateCustomerCommand {
  displayName: string;
  email?: string | null;
  phone?: string | null;
  locale: string;
  timezone: string;
}
export interface UpdateCustomerCommand {
  displayName?: string;
  email?: string | null;
  phone?: string | null;
  locale?: string;
  timezone?: string;
  status?: CustomerStatus;
  deletedAt?: Date | null;
}
export interface CustomerReadRepository {
  findById(id: string, deletedAt: null | Date): Promise<CustomerDTO | null>;
  findByEmail?(email: string, deletedAt: null | Date, excludeId?: string): Promise<CustomerDTO | null>;
}
export interface CustomerWriteRepository {
  create(command: CreateCustomerCommand): Promise<CustomerDTO>;
  update(id: string, command: UpdateCustomerCommand): Promise<CustomerDTO>;
  provisionAccount(input: { customerId: string; email: string; passwordHash: Uint8Array<ArrayBuffer>; passwordSalt: Uint8Array<ArrayBuffer> }): Promise<{ accountId: string; workspaceId: string }>;
}
export interface WorkspaceCustomerRepository {
  findByIdInWorkspace(scope: WorkspaceScope, id: string, deletedAt: null | Date): Promise<CustomerDTO | null>;
  findByEmailInWorkspace(scope: WorkspaceScope, email: string, deletedAt: null | Date, excludeId?: string): Promise<CustomerDTO | null>;
  createInWorkspace(scope: WorkspaceScope, command: CreateCustomerCommand): Promise<CustomerDTO>;
  updateInWorkspace(scope: WorkspaceScope, id: string, command: UpdateCustomerCommand): Promise<CustomerDTO | null>;
}

export interface CardLookupCriteria {
  slug: string;
  statuses: readonly CardStatus[];
  visibilities: readonly CardVisibility[];
  deletedAt: null | Date;
}
export interface CreateCardCommand {
  customerId: string;
  slug: string;
  name: string;
  fullName: string;
  orderId?: string;
  initialProfile?: {
    company?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}
export interface UpdateCardCommand {
  customerId?: string;
  name?: string;
  slug?: string;
  status?: CardStatus;
  visibility?: CardVisibility;
  publishedAt?: Date | null;
  deletedAt?: Date | null;
  profile?: {
    fullName?: string;
    headline?: string | null;
    company?: string | null;
    bio?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    countryCode?: string | null;
  };
}
export interface UpdateCardSettingsCommand {
  slug?: string;
  visibility?: CardVisibility;
  seoTitle?: string | null;
  seoDescription?: string | null;
}
export interface CardSectionCommand {
  kind: CardSectionKind;
  position: number;
  isVisible: boolean;
  title?: string | null;
}
export interface CreateCardButtonCommand {
  id: string;
  cardId: string;
  label: string;
  url: string;
  position?: number;
  isVisible: boolean;
  type: string;
  displayMode: string;
  color: string | null;
  openInNewTab: boolean;
  analyticsEnabled: boolean;
}
export interface UpdateCardButtonCommand {
  cardId: string;
  buttonId: string;
  label?: string;
  url?: string;
  isVisible?: boolean;
  type?: string;
  displayMode?: string;
  color?: string | null;
  openInNewTab?: boolean;
  analyticsEnabled?: boolean;
}
export interface CreateSocialLinkCommand {
  id: string;
  cardId: string;
  platform: string;
  label?: string | null;
  url: string;
  position?: number;
  isVisible: boolean;
}
export interface UpdateSocialLinkCommand {
  cardId: string;
  socialLinkId: string;
  platform?: string;
  label?: string | null;
  url?: string;
  isVisible?: boolean;
}
export interface CardBlockCommand {
  kind: string;
  position: number;
  isEnabled: boolean;
  config: unknown;
  mediaIds: readonly string[];
}
export interface CreateCardBlockCommand extends CardBlockCommand {
  cardId: string;
}
export interface UpdateCardBlockCommand {
  cardId: string;
  blockId: string;
  config?: unknown;
  isEnabled?: boolean;
  mediaIds?: readonly string[];
}
export interface CardReadRepository {
  findById(id: string, deletedAt: null | Date): Promise<CardDTO | null>;
  /** Complete editor state for workspace hydration and live preview. */
  findWorkspaceById?(
    id: string,
    deletedAt: null | Date,
  ): Promise<EditorCardDTO | null>;
  /** Minimal state used to authorize scalar autosave operations. */
  findAutosaveById?(
    id: string,
    deletedAt: null | Date,
  ): Promise<AutosaveCardProjection | null>;
  /** Minimal state used to validate publication transitions. */
  findPublishById?(
    id: string,
    deletedAt: null | Date,
  ): Promise<PublishCardProjection | null>;
  /** Reduced child graph used to validate builder mutations. */
  findBuilderById?(
    id: string,
    deletedAt: null | Date,
  ): Promise<BuilderCardProjection | null>;
  /** Complete editable source required by card duplication. */
  findDuplicateById?(
    id: string,
    deletedAt: null | Date,
  ): Promise<EditorCardDTO | null>;
  /** Public render source with ownership fields and hidden actions omitted. */
  findPublicBySlug?(
    criteria: CardLookupCriteria,
  ): Promise<PublicCardProjection | null>;
  /** @deprecated Use the operation-specific read matching the workflow. */
  findEditorById(
    id: string,
    deletedAt: null | Date,
  ): Promise<EditorCardDTO | null>;
  /** @deprecated Use findBuilderById, findAutosaveById or findDuplicateById. */
  findEditorForMutationById?(
    id: string,
    deletedAt: null | Date,
  ): Promise<EditorCardDTO | null>;
  /** @deprecated Use findPublicBySlug. */
  findRenderSourceBySlug(
    criteria: CardLookupCriteria,
  ): Promise<EditorCardDTO | null>;
  slugExists(slug: string, excludeCardId?: string): Promise<boolean>;
  mediaIdsBelongToCardCustomer?(
    cardId: string,
    mediaIds: readonly string[],
  ): Promise<boolean>;
  /** Resolves the real workspace + customer that own a card (for media scoping). */
  findOwnership?(
    cardId: string,
  ): Promise<{ customerId: string; workspaceId: string; slug: string } | null>;
}
export interface AutosaveCardProjection {
  id: string;
  slug: string;
  status: CardStatus;
}
export interface PublishCardProjection {
  status: CardStatus;
}
export interface BuilderCardProjection extends AutosaveCardProjection {
  sections: NonNullable<EditorCardDTO["sections"]>;
  blocks: NonNullable<EditorCardDTO["blocks"]>;
  buttonIds: readonly string[];
  socialLinkIds: readonly string[];
}
export type PublicCardProjection = Omit<
  EditorCardDTO,
  "customerId" | "accessVersion"
>;
/** Lightweight post-mutation result. Callers that need the full card DTO should call findEditorById separately. */
export type MutationResult = { id: string };
/** Cache identity returned by writes that directly affect the public card. */
export type PublicCardMutationResult = MutationResult & { slug: string };

export interface CardWriteRepository {
  create(command: CreateCardCommand): Promise<CardDTO>;
  update(id: string, command: UpdateCardCommand): Promise<CardDTO>;
  /** Persists only publication lifecycle fields and returns no card aggregate. */
  updatePublication?(
    id: string,
    command: Pick<UpdateCardCommand, "status" | "visibility" | "publishedAt">,
  ): Promise<MutationResult>;
  incrementAccessVersion(cardId: string): Promise<void>;
  updateAppearance(cardId: string, appearance: AppearanceSettings): Promise<PublicCardMutationResult>;
  updateSettings?(cardId: string, command: UpdateCardSettingsCommand): Promise<MutationResult>;
  replaceSections?(cardId: string, sections: readonly CardSectionCommand[]): Promise<MutationResult>;
  createButton?(command: CreateCardButtonCommand): Promise<MutationResult>;
  updateButton?(command: UpdateCardButtonCommand): Promise<MutationResult>;
  deleteButton?(cardId: string, buttonId: string, deletedAt: Date): Promise<MutationResult>;
  reorderButtons?(cardId: string, buttonIds: readonly string[]): Promise<MutationResult>;
  createSocialLink?(command: CreateSocialLinkCommand): Promise<MutationResult>;
  updateSocialLink?(command: UpdateSocialLinkCommand): Promise<MutationResult>;
  deleteSocialLink?(cardId: string, socialLinkId: string, deletedAt: Date): Promise<MutationResult>;
  reorderSocialLinks?(cardId: string, socialLinkIds: readonly string[]): Promise<MutationResult>;
  replaceBlocks?(cardId: string, blocks: readonly CardBlockCommand[]): Promise<MutationResult>;
  createBlock?(command: CreateCardBlockCommand): Promise<MutationResult>;
  updateBlock?(command: UpdateCardBlockCommand): Promise<MutationResult>;
  deleteBlock?(cardId: string, blockId: string, deletedAt: Date): Promise<MutationResult>;
  duplicateBlock?(cardId: string, blockId: string): Promise<MutationResult>;
  reorderBlocks?(cardId: string, blockIds: readonly string[]): Promise<MutationResult>;
  /** Link a media asset to a card with the given role (e.g. AVATAR). */
  linkMediaAsset?(cardId: string, mediaAssetId: string, role: string): Promise<void>;
}

export interface NfcCardRepository {
  list(query: import("@/types/nfc-card").NfcCardInventoryQuery): Promise<import("@/types/admin-read").PageResult<import("@/types/nfc-card").NfcCardInventoryItem>>;
  listForExport(query: Pick<import("@/types/nfc-card").NfcCardInventoryQuery, "search" | "status" | "sortDirection">): Promise<readonly import("@/types/nfc-card").NfcCardInventoryItem[]>;
  summary(): Promise<import("@/types/nfc-card").NfcCardInventorySummary>;
  inventory(query: import("@/types/nfc-card").NfcCardInventoryQuery): Promise<{ page: import("@/types/admin-read").PageResult<import("@/types/nfc-card").NfcCardInventoryItem>; summary: import("@/types/nfc-card").NfcCardInventorySummary }>;
  createCards(tokens: readonly string[]): Promise<number>;
  updateStatus(id: string, status: import("@/types/nfc-card").NfcCardStatus): Promise<import("@/types/nfc-card").NfcCardInventoryItem | null>;
  softDelete(id: string): Promise<boolean>;
  /** Tenant operations. These must never return or mutate another workspace card. */
  listForWorkspace(workspaceId: string, query: import("@/types/nfc-card").NfcCardInventoryQuery): Promise<import("@/types/admin-read").PageResult<import("@/types/nfc-card").NfcCardInventoryItem>>;
  summaryForWorkspace(workspaceId: string): Promise<import("@/types/nfc-card").NfcCardInventorySummary>;
  findByIdForWorkspace(workspaceId: string, id: string): Promise<import("@/types/nfc-card").NfcCardInventoryItem | null>;
  updateStatusForWorkspace(workspaceId: string, id: string, status: import("@/types/nfc-card").NfcCardStatus): Promise<import("@/types/nfc-card").NfcCardInventoryItem | null>;
  softDeleteForWorkspace(workspaceId: string, id: string): Promise<boolean>;
}

export interface ActivationRepository {
  findCardByActivationToken(token: string): Promise<{ id: string; status: import("@/types/nfc-card").NfcCardStatus; workspaceSlug: string | null } | null>;
  findAccountByEmail(email: string): Promise<import("@/types/activation").ActivationAccountRecord | null>;
  findAccountBySessionHash(hash: Uint8Array<ArrayBuffer>, now: Date): Promise<import("@/types/activation").ActivationAccountRecord | null>;
  activateByToken(input: {
    activationToken: string;
    account?: import("@/types/activation").ActivationAccountRecord;
    registration?: { displayName: string; email: string; phone: string | null; passwordHash: Uint8Array<ArrayBuffer>; passwordSalt: Uint8Array<ArrayBuffer> };
    slug: string;
    accessCodeHash: Uint8Array<ArrayBuffer>;
    editorSessionHash: Uint8Array<ArrayBuffer>;
    editorSessionExpiresAt: Date;
    customerSessionHash: Uint8Array<ArrayBuffer>;
    customerSessionExpiresAt: Date;
    now: Date;
  }): Promise<import("@/types/activation").ActivationResult>;
  createPasswordReset(email: string, tokenHash: Uint8Array<ArrayBuffer>, expiresAt: Date): Promise<boolean>;
  resetPassword(input: { tokenHash: Uint8Array<ArrayBuffer>; passwordHash: Uint8Array<ArrayBuffer>; passwordSalt: Uint8Array<ArrayBuffer>; now: Date }): Promise<boolean>;
  revokeSession(hash: Uint8Array<ArrayBuffer>, now: Date): Promise<void>;
  createSession(accountId: string, tokenHash: Uint8Array<ArrayBuffer>, expiresAt: Date): Promise<void>;
  registerCustomerAccount(input: { displayName: string; email: string; passwordHash: Uint8Array<ArrayBuffer>; passwordSalt: Uint8Array<ArrayBuffer>; sessionHash: Uint8Array<ArrayBuffer>; sessionExpiresAt: Date }): Promise<{ accountId: string; customerId: string; workspaceId: string }>;
  createDigitalCardForAccount(input: { accountId: string; customerId: string; workspaceId: string; displayName: string; email: string; slug: string; accessCodeHash: Uint8Array<ArrayBuffer>; editorSessionHash: Uint8Array<ArrayBuffer>; editorSessionExpiresAt: Date }): Promise<import("@/types/activation").CustomerCardSessionRecord>;
  createEditorSessionForAccount(input: { accountId: string; customerId: string; workspaceId: string; cardId: string; editorSessionHash: Uint8Array<ArrayBuffer>; editorSessionExpiresAt: Date }): Promise<import("@/types/activation").CustomerCardSessionRecord>;
}

export interface CreateAccessCodeCommand {
  cardId: string;
  codeHash: Uint8Array<ArrayBuffer>;
  version: number;
  expiresAt?: Date | null;
  rotatedFromId?: string;
}
export interface UpdateAccessCodesCommand {
  cardId: string;
  fromStatuses: readonly AccessCodeStatus[];
  status: AccessCodeStatus;
  revokedAt: Date;
}
export interface AccessCodeReadRepository {
  findByHash(hash: Uint8Array<ArrayBuffer>): Promise<AccessCodeDTO | null>;
  findLatestByCard(
    cardId: string,
    statuses: readonly AccessCodeStatus[],
  ): Promise<AccessCodeDTO | null>;
  findMaximumVersion(cardId: string): Promise<number | null>;
}
export interface AccessCodeEventCommand {
  accessCodeId: string;
  occurredAt: Date;
  success: boolean;
  ipHash?: Uint8Array<ArrayBuffer>;
  userAgentHash?: Uint8Array<ArrayBuffer>;
  failureReason?: string | null;
}
export interface AccessCodeWriteRepository {
  create(command: CreateAccessCodeCommand): Promise<AccessCodeDTO>;
  updateMany(command: UpdateAccessCodesCommand): Promise<number>;
  markUsed(accessCodeId: string, usedAt: Date): Promise<void>;
  recordEvent(
    command: AccessCodeEventCommand,
  ): Promise<import("@/dto").AccessCodeEventDTO>;
}
export interface CreateEditorSessionCommand {
  cardId: string;
  accessCodeId: string;
  tokenHash: Uint8Array<ArrayBuffer>;
  expiresAt: Date;
}
export interface EditorSessionReadRepository {
  findByTokenHash(
    tokenHash: Uint8Array<ArrayBuffer>,
  ): Promise<import("@/dto").EditorSessionDTO | null>;
}
export interface EditorSessionWriteRepository {
  create(
    command: CreateEditorSessionCommand,
  ): Promise<import("@/dto").EditorSessionDTO>;
  revokeByCard(
    cardId: string,
    activeStatus: "ACTIVE",
    revokedAt: Date,
  ): Promise<number>;
}

export interface CreateOrderCommand {
  orderNumber: string;
  customerName: string;
  company?: string | null;
  email: string;
  phone: string;
  package: OrderPackage;
  quantity: number;
  notes?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  planId?: string;
  billingInterval?: import("@/dto/subscription.dto").BillingIntervalDTO;
  planNameSnapshot?: string | null;
  planDescriptionSnapshot?: string | null;
  billingIntervalSnapshot?: import("@/dto/subscription.dto").BillingIntervalDTO | null;
  currency?: string | null;
  planPriceSnapshot?: number | null;
  subtotal?: number | null;
  discount?: number | null;
  tax?: number | null;
  total?: number | null;
  accountPasswordHash?: Uint8Array<ArrayBuffer>;
  accountPasswordSalt?: Uint8Array<ArrayBuffer>;
}
export interface UpdateOrderCommand {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  customerId?: string | null;
  planId?: string | null;
  billingInterval?: import("@/dto/subscription.dto").BillingIntervalDTO | null;
}
export interface TransitionOrderCommand {
  id: string;
  fromStatus: OrderStatus;
  fromFulfillmentStatus?: FulfillmentStatus;
  update: UpdateOrderCommand;
}
export interface OrderListCriteria {
  status?: OrderStatus;
  take: number;
}
export interface OrderReadRepository {
  findById(id: string): Promise<OrderDTO | null>;
  list(criteria: OrderListCriteria): Promise<readonly OrderDTO[]>;
  findAccountCredentials(orderId: string): Promise<{ accountPasswordHash: Uint8Array<ArrayBuffer>; accountPasswordSalt: Uint8Array<ArrayBuffer> } | null>;
  findPendingRegistrationByEmail(email: string): Promise<{ orderNumber: string } | null>;
}
export interface OrderWriteRepository {
  create(command: CreateOrderCommand): Promise<OrderDTO>;
  update(id: string, command: UpdateOrderCommand): Promise<OrderDTO>;
  transition(command: TransitionOrderCommand): Promise<OrderDTO | null>;
}
export interface WorkspaceOrderRepository {
  findByIdInWorkspace(scope: WorkspaceScope, id: string): Promise<OrderDTO | null>;
  listInWorkspace(scope: WorkspaceScope, criteria: OrderListCriteria): Promise<readonly OrderDTO[]>;
  createInWorkspace(scope: WorkspaceScope, command: CreateOrderCommand): Promise<OrderDTO>;
  updateInWorkspace(scope: WorkspaceScope, id: string, command: UpdateOrderCommand): Promise<OrderDTO | null>;
  transitionInWorkspace(scope: WorkspaceScope, command: TransitionOrderCommand): Promise<OrderDTO | null>;
}

export interface UnitOfWork {
  execute<T>(
    work: (repositories: TransactionRepositories) => Promise<T>,
  ): Promise<T>;
  /** Non-transactional read — no timeout, uses the connection pool. */
  read?<T>(
    work: (repositories: TransactionRepositories) => Promise<T>,
  ): Promise<T>;
}

export interface LegacyCardWriteCommand {
  name: string;
  title: string;
  company: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  bio?: string | null;
  avatar?: string | null;
  backgroundImage?: string | null;
  socialLinks: string;
  templateId: string;
  isActive: boolean;
  updateTime: Date;
}
export interface LegacyCardPatchCommand extends Partial<LegacyCardWriteCommand> {}
export interface LegacyLinkCommand {
  platform: string;
  url: string;
  order: number;
}
export interface LegacyReadRepository {
  listCardsByUser(
    userId: string,
  ): Promise<import("@/dto").LegacyBusinessCardDTO[]>;
  findCardByIdAndUser(
    id: string,
    userId: string,
  ): Promise<import("@/dto").LegacyBusinessCardDTO | null>;
  findCardByHash(
    hash: string,
  ): Promise<import("@/dto").LegacyBusinessCardDTO | null>;
  cardHashExists(hash: string): Promise<boolean>;
  cardSlugExists(slug: string): Promise<boolean>;
  listLinks(cardId: string): Promise<import("@/dto").LegacySocialLinkDTO[]>;
  findUserByEmail(email: string): Promise<import("@/dto").LegacyUserDTO | null>;
}
export interface LegacyWriteRepository {
  createCard(
    command: LegacyCardWriteCommand & {
      userId: string;
      urlHash: string;
      slug: string;
    },
  ): Promise<import("@/dto").LegacyBusinessCardDTO>;
  updateCard(
    id: string,
    command: LegacyCardPatchCommand,
  ): Promise<import("@/dto").LegacyBusinessCardDTO>;
  deleteCard(id: string): Promise<void>;
  replaceLinks(
    cardId: string,
    links: readonly LegacyLinkCommand[],
  ): Promise<import("@/dto").LegacySocialLinkDTO[]>;
  deleteLinks(cardId: string): Promise<void>;
  createUser(command: {
    name: string;
    email: string;
  }): Promise<import("@/dto").LegacyUserDTO>;
}

export interface CreateMigratedCardCommand {
  legacyId: string;
  legacyHash: string;
  customer: CreateCustomerCommand & { createdAt: Date; updatedAt: Date };
  card: {
    slug: string;
    name: string;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  profile: {
    fullName: string;
    headline: string | null;
    company: string | null;
    bio: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    countryCode: string | null;
  };
  appearance: AppearanceSettings;
  socialLinks: ReadonlyArray<{
    platform: string;
    label: string | null;
    url: string;
    position: number;
  }>;
  buttons: ReadonlyArray<{ label: string; url: string; position: number }>;
}
export interface LegacyMigrationReadRepository {
  listActive(): Promise<
    import("@/dto/legacy-migration.dto").LegacyMigrationSourceDTO[]
  >;
}
export interface LegacyMigrationWriteRepository {
  findMigratedCardId(legacyId: string): Promise<string | null>;
  createAggregate(
    command: CreateMigratedCardCommand,
  ): Promise<{ cardId: string; slug: string }>;
}

export interface TransactionRepositories {
  platform?: import("./platform-management.repository").PlatformManagementRepository;
  customers: CustomerReadRepository & CustomerWriteRepository;
  cards: CardReadRepository & CardWriteRepository;
  accessCodes: AccessCodeReadRepository & AccessCodeWriteRepository;
  editorSessions: EditorSessionReadRepository & EditorSessionWriteRepository;
  orders: OrderReadRepository & OrderWriteRepository;
  legacy: LegacyReadRepository & LegacyWriteRepository;
  migrations: LegacyMigrationWriteRepository;
}
