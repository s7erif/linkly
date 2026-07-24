import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { ActivationAccountRecord } from "@/types/activation";
import type { ActivationRepository } from "./contracts";

const accountSelect = {
  id: true,
  customerId: true,
  email: true,
  passwordHash: true,
  passwordSalt: true,
  customer: { select: { displayName: true } },
  memberships: {
    where: { status: "ACTIVE" as const, role: "OWNER" as const, deletedAt: null, workspace: { archivedAt: null } },
    orderBy: { createdAt: "asc" as const },
    take: 1,
    select: {
      workspace: {
        select: {
          id: true,
          primaryCardId: true,
          cards: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" as const },
            select: { id: true, name: true, slug: true },
          },
          nfcCards: {
            where: { status: "RESERVED" as const },
            orderBy: { createdAt: "asc" as const },
            select: { activationToken: true },
          },
        },
      },
    },
  },
};

function mapAccount(row: {
  id: string;
  customerId: string;
  email: string;
  passwordHash: Uint8Array<ArrayBuffer>;
  passwordSalt: Uint8Array<ArrayBuffer>;
  customer: { displayName: string };
  memberships: readonly {
    workspace: {
      id: string;
      primaryCardId: string | null;
      cards: readonly { id: string; name: string; slug: string }[];
      nfcCards: readonly { activationToken: string }[];
    };
  }[];
}): ActivationAccountRecord {
  const workspace = row.memberships[0]?.workspace;
  return {
    id: row.id,
    customerId: row.customerId,
    displayName: row.customer.displayName,
    email: row.email,
    passwordHash: row.passwordHash,
    passwordSalt: row.passwordSalt,
    workspace: workspace
      ? {
          id: workspace.id,
          primaryCardId: workspace.primaryCardId,
          cards: workspace.cards,
          pendingActivationTokens: workspace.nfcCards.map((card) => card.activationToken),
        }
      : null,
  };
}

const SECTION_KINDS = ["PROFILE", "ABOUT", "CONTACT", "BUTTONS", "SOCIAL_LINKS"] as const;

async function createCardAggregate(db: Prisma.TransactionClient, input: { workspaceId: string; customerId: string; slug: string; displayName: string; email: string; accessCodeHash: Uint8Array<ArrayBuffer> }) {
  return db.card.create({
    data: {
      workspaceId: input.workspaceId,
      customerId: input.customerId,
      slug: input.slug,
      name: input.displayName,
      profile: { create: { fullName: input.displayName, email: input.email } },
      sections: { create: SECTION_KINDS.map((kind, position) => ({ kind, position })) },
      accessCodes: { create: { codeHash: input.accessCodeHash, version: 1 } },
    },
    select: { id: true, slug: true, accessCodes: { where: { status: "ACTIVE" }, take: 1, select: { id: true } } },
  });
}

export class PrismaActivationRepository implements ActivationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findCardByActivationToken(token: string) {
    const card = await this.db.nfcCard.findUnique({
      where: { activationToken: token.toUpperCase() },
      select: { id: true, status: true, card: { select: { slug: true } }, workspace: { select: { primaryCard: { select: { slug: true } } } } },
    });
    return card ? { id: card.id, status: card.status, workspaceSlug: card.card?.slug ?? card.workspace?.primaryCard?.slug ?? null } : null;
  }

  async findAccountByEmail(email: string): Promise<ActivationAccountRecord | null> {
    const row = await this.db.customerAccount.findUnique({ where: { email: email.toLowerCase() }, select: accountSelect });
    return row ? mapAccount(row) : null;
  }

  async findAccountBySessionHash(hash: Uint8Array<ArrayBuffer>, now: Date) {
    const row = await this.db.customerSession.findUnique({ where: { tokenHash: hash }, select: { expiresAt: true, revokedAt: true, account: { select: accountSelect } } });
    if (!row || row.revokedAt || row.expiresAt <= now) return null;
    return mapAccount(row.account);
  }

  async activateByToken(input: Parameters<ActivationRepository["activateByToken"]>[0]) {
    return this.db.$transaction(async (tx) => {
      const nfc = await tx.nfcCard.findFirst({ where: { activationToken: input.activationToken.toUpperCase(), status: { in: ["AVAILABLE", "RESERVED"] }, customerId: null, workspaceId: null, cardId: null }, select: { id: true } });
      if (!nfc) throw new Error("This NFC card is no longer available for activation");
      const claimed = await tx.nfcCard.updateMany({ where: { id: nfc.id, status: { in: ["AVAILABLE", "RESERVED"] }, customerId: null, workspaceId: null, cardId: null }, data: { status: "RESERVED" } });
      if (claimed.count !== 1) throw new Error("This NFC card is already being activated");

      let accountId = input.account?.id;
      let customerId = input.account?.customerId;
      let workspaceId = input.account?.workspace?.id;
      let customerCreated = false;
      let workspaceCreated = false;

      if (input.registration) {
        const workspace = await tx.workspace.create({ data: {}, select: { id: true } });
        workspaceId = workspace.id;
        workspaceCreated = true;
        const customer = await tx.customer.create({ data: { workspaceId, displayName: input.registration.displayName, email: input.registration.email, phone: input.registration.phone }, select: { id: true } });
        const account = await tx.customerAccount.create({ data: { customerId: customer.id, email: input.registration.email, passwordHash: input.registration.passwordHash, passwordSalt: input.registration.passwordSalt }, select: { id: true } });
        customerId = customer.id;
        accountId = account.id;
        customerCreated = true;
      }
      if (!accountId || !customerId || !workspaceId) throw new Error("Workspace membership is required");

      const firstCard = !input.account?.workspace?.primaryCardId;
      const displayName = input.registration?.displayName ?? input.account?.displayName?.trim() ?? "OI Customer";
      const card = await createCardAggregate(tx, { workspaceId, customerId, slug: input.slug, displayName, email: input.registration?.email ?? input.account?.email ?? "", accessCodeHash: input.accessCodeHash });

      if (firstCard) await tx.workspace.update({ where: { id: workspaceId }, data: { customerId, primaryCardId: card.id } });
      await tx.workspaceMembership.upsert({ where: { workspaceId_accountId: { workspaceId, accountId } }, update: { status: "ACTIVE", deletedAt: null, role: "OWNER" }, create: { workspaceId, accountId, role: "OWNER", status: "ACTIVE" } });
      const accessCode = card.accessCodes[0];
      if (!accessCode) throw new Error("Unable to issue card access");
      await tx.editorSession.create({ data: { cardId: card.id, accessCodeId: accessCode.id, tokenHash: input.editorSessionHash, expiresAt: input.editorSessionExpiresAt } });
      await tx.customerSession.create({ data: { accountId, tokenHash: input.customerSessionHash, expiresAt: input.customerSessionExpiresAt } });
      await tx.nfcCard.update({ where: { id: nfc.id }, data: { status: "ACTIVATED", customerId, workspaceId, cardId: card.id, activatedAt: input.now } });
      return { activationId: nfc.id, customerId, cardId: card.id, slug: card.slug, customerCreated, workspaceCreated, firstCard };
    });
  }

  async createDigitalCardForAccount(input: Parameters<ActivationRepository["createDigitalCardForAccount"]>[0]) {
    return this.db.$transaction(async (tx) => {
      const owner = await tx.workspaceMembership.findFirst({
        where: { accountId: input.accountId, workspaceId: input.workspaceId, role: "OWNER", status: "ACTIVE", deletedAt: null, account: { customerId: input.customerId }, workspace: { archivedAt: null } },
        select: { workspace: { select: { primaryCardId: true } } },
      });
      if (!owner) throw new Error("Workspace membership is required");

      let card = await tx.card.findFirst({
        where: { workspaceId: input.workspaceId, customerId: input.customerId, deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: { id: true, slug: true, accessCodes: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1, select: { id: true } } },
      });
      if (!card) card = await createCardAggregate(tx, input);
      if (!owner.workspace.primaryCardId) await tx.workspace.update({ where: { id: input.workspaceId }, data: { primaryCardId: card.id } });
      const accessCode = card.accessCodes[0];
      if (!accessCode) throw new Error("Unable to issue card access");
      await tx.editorSession.create({ data: { cardId: card.id, accessCodeId: accessCode.id, tokenHash: input.editorSessionHash, expiresAt: input.editorSessionExpiresAt } });
      return { cardId: card.id, slug: card.slug };
    });
  }

  async createEditorSessionForAccount(input: Parameters<ActivationRepository["createEditorSessionForAccount"]>[0]) {
    return this.db.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: { id: input.cardId, workspaceId: input.workspaceId, customerId: input.customerId, deletedAt: null, tenantWorkspace: { archivedAt: null, memberships: { some: { accountId: input.accountId, role: "OWNER", status: "ACTIVE", deletedAt: null } } } },
        select: { id: true, slug: true, accessCodes: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1, select: { id: true } } },
      });
      const accessCode = card?.accessCodes[0];
      if (!card || !accessCode) throw new Error("Card access is unavailable");
      await tx.editorSession.create({ data: { cardId: card.id, accessCodeId: accessCode.id, tokenHash: input.editorSessionHash, expiresAt: input.editorSessionExpiresAt } });
      return { cardId: card.id, slug: card.slug };
    });
  }

  async registerCustomerAccount(input: Parameters<ActivationRepository["registerCustomerAccount"]>[0]) {
    return this.db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({ data: {}, select: { id: true } });
      const customer = await tx.customer.create({ data: { workspaceId: workspace.id, displayName: input.displayName, email: input.email }, select: { id: true } });
      const account = await tx.customerAccount.create({ data: { customerId: customer.id, email: input.email, passwordHash: input.passwordHash, passwordSalt: input.passwordSalt }, select: { id: true } });
      await tx.workspace.update({ where: { id: workspace.id }, data: { customerId: customer.id } });
      await tx.workspaceMembership.create({ data: { workspaceId: workspace.id, accountId: account.id, role: "OWNER", status: "ACTIVE" } });
      await tx.customerSession.create({ data: { accountId: account.id, tokenHash: input.sessionHash, expiresAt: input.sessionExpiresAt } });
      return { accountId: account.id, customerId: customer.id, workspaceId: workspace.id };
    });
  }

  async createPasswordReset(email: string, tokenHash: Uint8Array<ArrayBuffer>, expiresAt: Date) {
    const account = await this.db.customerAccount.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } });
    if (!account) return false;
    await this.db.$transaction([
      this.db.customerPasswordReset.updateMany({ where: { accountId: account.id, usedAt: null }, data: { usedAt: new Date() } }),
      this.db.customerPasswordReset.create({ data: { accountId: account.id, tokenHash, expiresAt } }),
    ]);
    return true;
  }

  async resetPassword(input: { tokenHash: Uint8Array<ArrayBuffer>; passwordHash: Uint8Array<ArrayBuffer>; passwordSalt: Uint8Array<ArrayBuffer>; now: Date }) {
    return this.db.$transaction(async (tx) => {
      const challenge = await tx.customerPasswordReset.findFirst({ where: { tokenHash: input.tokenHash, usedAt: null, expiresAt: { gt: input.now } }, select: { id: true, accountId: true } });
      if (!challenge) return false;
      const consumed = await tx.customerPasswordReset.updateMany({ where: { id: challenge.id, usedAt: null, expiresAt: { gt: input.now } }, data: { usedAt: input.now } });
      if (consumed.count !== 1) return false;
      await tx.customerPasswordReset.updateMany({ where: { accountId: challenge.accountId, usedAt: null }, data: { usedAt: input.now } });
      await tx.customerAccount.update({ where: { id: challenge.accountId }, data: { passwordHash: input.passwordHash, passwordSalt: input.passwordSalt } });
      await tx.customerSession.updateMany({ where: { accountId: challenge.accountId, revokedAt: null }, data: { revokedAt: input.now } });
      return true;
    });
  }

  async createSession(accountId: string, tokenHash: Uint8Array<ArrayBuffer>, expiresAt: Date) {
    await this.db.customerSession.create({ data: { accountId, tokenHash, expiresAt } });
  }

  async revokeSession(hash: Uint8Array<ArrayBuffer>, now: Date) {
    await this.db.customerSession.updateMany({ where: { tokenHash: hash, revokedAt: null }, data: { revokedAt: now } });
  }
}
