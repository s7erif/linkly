import { describe, expect, it, vi } from "vitest";
import type { EditorCardDTO } from "@/dto";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
import { ReadPublicCard } from "@/use-cases/read-public-card";
import { UpdateCardPublication } from "@/use-cases/update-card-publication";
import { defaultAppearanceSettings } from "@/validation/appearance";

const cardId = "0915a8e0-60eb-4cfc-b6dc-adcb01dd249a";
const now = new Date("2026-07-20T20:00:00.000Z");
const token = "a".repeat(64);
const base: EditorCardDTO = {
  id: cardId,
  customerId: "3d594650-c44b-4f60-8c9a-c0f44f57615d",
  themeId: null,
  slug: "publication-card",
  name: "Publication Card",
  status: "DRAFT",
  visibility: "PRIVATE",
  publishedAt: null,
  accessVersion: 1,
  profile: null,
  themeConfig: defaultAppearanceSettings,
  sections: [],
  blocks: [],
  buttons: [],
  socialLinks: [],
  createdAt: now,
  updatedAt: now,
};

function setup(initial: EditorCardDTO = base) {
  let card = initial;
  const cards = {
    findEditorById: vi.fn(async () => card),
    update: vi.fn(async (_id: string, update: Partial<EditorCardDTO>) => {
      card = { ...card, ...update, updatedAt: now };
      return card;
    }),
  };
  const repositories = {
    cards,
    editorSessions: {
      findByTokenHash: vi.fn(async () => ({
        id: crypto.randomUUID(),
        cardId,
        accessCodeId: crypto.randomUUID(),
        status: "ACTIVE",
        expiresAt: new Date("2026-07-20T21:00:00.000Z"),
        lastSeenAt: null,
        createdAt: now,
        revokedAt: null,
      })),
    },
  } as unknown as TransactionRepositories;
  const unitOfWork: UnitOfWork = { execute: (work) => work(repositories) };
  const useCase = new UpdateCardPublication(
    unitOfWork,
    { generate: () => "", hash: async () => new Uint8Array([1]) },
    () => now,
  );
  return { cards, get card() { return card; }, useCase };
}

describe("card publication workflow", () => {
  it("keeps a saved Draft private until the dedicated Publish action", async () => {
    const context = setup();
    expect(context.card).toMatchObject({ status: "DRAFT", visibility: "PRIVATE", publishedAt: null });
    await context.useCase.execute({ cardId, sessionToken: token, action: "PUBLISH" });
    expect(context.cards.update).toHaveBeenCalledWith(cardId, {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      publishedAt: now,
    });
    expect(context.card).toMatchObject({ status: "PUBLISHED", visibility: "PUBLIC", publishedAt: now });
  });

  it("unpublishes to Draft/Private and restores Archived cards to Draft/Private", async () => {
    const published = setup({ ...base, status: "PUBLISHED", visibility: "PUBLIC", publishedAt: now });
    await published.useCase.execute({ cardId, sessionToken: token, action: "UNPUBLISH" });
    expect(published.card).toMatchObject({ status: "DRAFT", visibility: "PRIVATE", publishedAt: null });
    const archived = setup({ ...base, status: "ARCHIVED", visibility: "PRIVATE" });
    await archived.useCase.execute({ cardId, sessionToken: token, action: "RESTORE" });
    expect(archived.card).toMatchObject({ status: "DRAFT", visibility: "PRIVATE", publishedAt: null });
  });

  it("uses the same publication use case for an Admin session without an EditorSession", async () => {
    let card = base;
    const editorSessions = { findByTokenHash: vi.fn() };
    const platform = {
      findAdminByEmail: vi.fn(async () => ({ id: crypto.randomUUID(), email: "admin.test", roles: ["SUPPORT"] })),
      audit: vi.fn(async () => undefined),
    };
    const cards = {
      findEditorById: vi.fn(async () => card),
      update: vi.fn(async (_id: string, update: Partial<EditorCardDTO>) => { card = { ...card, ...update }; return card; }),
    };
    const repositories = { cards, editorSessions, platform } as unknown as TransactionRepositories;
    const unitOfWork: UnitOfWork = { execute: (work) => work(repositories) };
    await new UpdateCardPublication(unitOfWork, { generate: () => "", hash: vi.fn() }, () => now).execute(
      { cardId, sessionToken: "0".repeat(64), action: "PUBLISH" },
      { adminEmail: "admin.test" },
    );
    expect(editorSessions.findByTokenHash).not.toHaveBeenCalled();
    expect(cards.update).toHaveBeenCalledWith(cardId, expect.objectContaining({ status: "PUBLISHED", visibility: "PUBLIC" }));
    expect(platform.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "ADMIN_WORKSPACE_EDIT" }));
  });

  it("allows the public reader to request only Published and Public cards", async () => {
    const cards = { findRenderSourceBySlug: vi.fn().mockResolvedValue({ ...base, status: "PUBLISHED", visibility: "PUBLIC" }) };
    await new ReadPublicCard(cards as never).execute({ slug: base.slug });
    expect(cards.findRenderSourceBySlug).toHaveBeenCalledWith({
      slug: base.slug,
      statuses: ["PUBLISHED"],
      visibilities: ["PUBLIC"],
      deletedAt: null,
    });
  });
});
