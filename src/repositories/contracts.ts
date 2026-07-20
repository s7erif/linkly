import type { AccessCodeDTO, CardDTO, CustomerDTO, EditorCardDTO, PublicCardDTO } from "@/dto";
import type { AccessCodeStatus, CardStatus, CardVisibility, CustomerStatus } from "@/types";
import type { AppearanceSettings } from "@/types/appearance";

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
}
export interface CustomerWriteRepository {
  create(command: CreateCustomerCommand): Promise<CustomerDTO>;
  update(id: string, command: UpdateCustomerCommand): Promise<CustomerDTO>;
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
}
export interface UpdateCardCommand {
  name?: string;
  slug?: string;
  status?: CardStatus;
  visibility?: CardVisibility;
  deletedAt?: Date | null;
  profile?: {
    fullName?: string;
    headline?: string | null;
    company?: string | null;
    bio?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
  };
}
export interface CardReadRepository {
  findById(id: string, deletedAt: null | Date): Promise<CardDTO | null>;
  findEditorById(id: string, deletedAt: null | Date): Promise<EditorCardDTO | null>;
  findRenderSourceBySlug(criteria: CardLookupCriteria): Promise<EditorCardDTO | null>;
}
export interface CardWriteRepository {
  create(command: CreateCardCommand): Promise<CardDTO>;
  update(id: string, command: UpdateCardCommand): Promise<CardDTO>;
  incrementAccessVersion(cardId: string): Promise<void>;
  updateAppearance(cardId: string, appearance: AppearanceSettings): Promise<EditorCardDTO>;
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
  findLatestByCard(cardId: string, statuses: readonly AccessCodeStatus[]): Promise<AccessCodeDTO | null>;
  findMaximumVersion(cardId: string): Promise<number | null>;
}
export interface AccessCodeEventCommand {
  accessCodeId: string; occurredAt: Date; success: boolean; ipHash?: Uint8Array<ArrayBuffer>; userAgentHash?: Uint8Array<ArrayBuffer>; failureReason?: string | null;
}
export interface AccessCodeWriteRepository {
  create(command: CreateAccessCodeCommand): Promise<AccessCodeDTO>;
  updateMany(command: UpdateAccessCodesCommand): Promise<number>;
  markUsed(accessCodeId: string, usedAt: Date): Promise<void>;
  recordEvent(command: AccessCodeEventCommand): Promise<import("@/dto").AccessCodeEventDTO>;
}
export interface CreateEditorSessionCommand { cardId: string; accessCodeId: string; tokenHash: Uint8Array<ArrayBuffer>; expiresAt: Date; }
export interface EditorSessionReadRepository {
  findByTokenHash(tokenHash: Uint8Array<ArrayBuffer>): Promise<import("@/dto").EditorSessionDTO | null>;
}
export interface EditorSessionWriteRepository {
  create(command: CreateEditorSessionCommand): Promise<import("@/dto").EditorSessionDTO>;
  revokeByCard(cardId: string, activeStatus: "ACTIVE", revokedAt: Date): Promise<number>;
}
export interface UnitOfWork {
  execute<T>(work: (repositories: TransactionRepositories) => Promise<T>): Promise<T>;
}

export interface LegacyCardWriteCommand {
  name: string; title: string; company: string; address?: string | null; phone?: string | null;
  email?: string | null; website?: string | null; bio?: string | null; avatar?: string | null;
  backgroundImage?: string | null; socialLinks: string; templateId: string; isActive: boolean; updateTime: Date;
}
export interface LegacyCardPatchCommand extends Partial<LegacyCardWriteCommand> {}
export interface LegacyLinkCommand { platform: string; url: string; order: number; }
export interface LegacyReadRepository {
  listCardsByUser(userId: string): Promise<import("@/dto").LegacyBusinessCardDTO[]>;
  findCardByIdAndUser(id: string, userId: string): Promise<import("@/dto").LegacyBusinessCardDTO | null>;
  findCardByHash(hash: string): Promise<import("@/dto").LegacyBusinessCardDTO | null>;
  cardHashExists(hash: string): Promise<boolean>;
  cardSlugExists(slug: string): Promise<boolean>;
  listLinks(cardId: string): Promise<import("@/dto").LegacySocialLinkDTO[]>;
  findUserByEmail(email: string): Promise<import("@/dto").LegacyUserDTO | null>;
}
export interface LegacyWriteRepository {
  createCard(command: LegacyCardWriteCommand & { userId: string; urlHash: string; slug: string }): Promise<import("@/dto").LegacyBusinessCardDTO>;
  updateCard(id: string, command: LegacyCardPatchCommand): Promise<import("@/dto").LegacyBusinessCardDTO>;
  deleteCard(id: string): Promise<void>;
  replaceLinks(cardId: string, links: readonly LegacyLinkCommand[]): Promise<import("@/dto").LegacySocialLinkDTO[]>;
  deleteLinks(cardId: string): Promise<void>;
  createUser(command: { name: string; email: string }): Promise<import("@/dto").LegacyUserDTO>;
}
export interface TransactionRepositories {
  customers: CustomerReadRepository & CustomerWriteRepository;
  cards: CardReadRepository & CardWriteRepository;
  accessCodes: AccessCodeReadRepository & AccessCodeWriteRepository;
  editorSessions: EditorSessionReadRepository & EditorSessionWriteRepository;
  legacy: LegacyReadRepository & LegacyWriteRepository;
}
