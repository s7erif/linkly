import { describe, expect, it, vi } from "vitest";
import type { EditorCardDTO, PublicCardDTO } from "@/dto";
import { resolveRendererSectionOrder } from "@/components/card-renderer";
import { defaultAppearanceSettings } from "@/validation/appearance";
import { createCardButtonSchema } from "@/validation/card-builder";
import { updateCardProfileSchema } from "@/validation/use-cases";
import { ChangeCardSlug, CreateCardButton, UpdateCardSections } from "@/use-cases/card-builder";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
const cardId = "0915a8e0-60eb-4cfc-b6dc-adcb01dd249a",
  now = new Date("2026-07-20T12:00:00Z"),
  token = "a".repeat(64);
const source: EditorCardDTO = {
  id: cardId,
  customerId: "3d594650-c44b-4f60-8c9a-c0f44f57615d",
  slug: "ada-card",
  name: "Ada",
  status: "PUBLISHED",
  visibility: "PUBLIC",
  publishedAt: now,
  accessVersion: 1,
  profile: {
    fullName: "Ada",
    headline: null,
    company: null,
    bio: "ABOUT_MARKER",
    email: "ada@example.com",
    phone: null,
    website: null,
    address: null,
    countryCode: null,
  },
  themeConfig: defaultAppearanceSettings,
  sections: [
    { id: "1", kind: "ABOUT", title: null, position: 0, isVisible: true },
    { id: "2", kind: "PROFILE", title: null, position: 1, isVisible: true },
    { id: "3", kind: "CONTACT", title: null, position: 2, isVisible: true },
    { id: "4", kind: "BUTTONS", title: null, position: 3, isVisible: true },
    {
      id: "5",
      kind: "SOCIAL_LINKS",
      title: null,
      position: 4,
      isVisible: true,
    },
  ],
  buttons: [],
  socialLinks: [],
  createdAt: now,
  updatedAt: now,
};
function deps() {
  const cards = {
    findEditorById: vi.fn(async () => source),
    findEditorForMutationById: vi.fn(async () => source),
    replaceSections: vi.fn(async () => source),
    createButton: vi.fn(async () => ({ id: cardId })),
    slugExists: vi.fn(async () => false),
    updateSettings: vi.fn(async () => ({ ...source, slug: "new-slug" })),
  };
  const repositories = {
    cards,
    editorSessions: {
      findByTokenHash: vi.fn(async () => ({
        id: "session",
        cardId,
        accessCodeId: "access",
        status: "ACTIVE",
        expiresAt: new Date("2026-07-20T13:00:00Z"),
        lastSeenAt: null,
        createdAt: now,
        revokedAt: null,
      })),
    },
  } as unknown as TransactionRepositories;
  const unitOfWork: UnitOfWork = { execute: (work) => work(repositories) };
  return { cards, unitOfWork };
}
describe("Sprint 13 card builder", () => {
  it("orders visible sections from persisted data", () => {
    const card: PublicCardDTO = {
      ...source,
      blocks: undefined,
      appearance: defaultAppearanceSettings,
      buttons: [],
      socialLinks: [],
    };
    expect(resolveRendererSectionOrder(card)).toEqual([
      "bio",
      "header",
      "contact",
      "buttons",
      "socialLinks",
      "footer",
    ]);
  });
  it("updates section order only through the transaction repository", async () => {
    const { cards, unitOfWork } = deps();
    await new UpdateCardSections(
      unitOfWork,
      { generate: () => "", hash: async () => new Uint8Array([1]) },
      () => now,
    ).execute({
      cardId,
      sessionToken: token,
      sections: [
        { kind: "PROFILE", isVisible: true },
        { kind: "CONTACT", isVisible: true },
        { kind: "ABOUT", isVisible: false },
        { kind: "BUTTONS", isVisible: true },
        { kind: "SOCIAL_LINKS", isVisible: true },
      ],
    });
    expect(cards.replaceSections).toHaveBeenCalledWith(
      cardId,
      expect.arrayContaining([
        expect.objectContaining({
          kind: "ABOUT",
          isVisible: false,
          position: 2,
        }),
      ]),
    );
    expect(cards.findEditorForMutationById).toHaveBeenCalledWith(cardId, null);
  });
  it("skips the post-mutation editor reload for minimal save responses", async () => {
    const { cards, unitOfWork } = deps();
    const result = await new CreateCardButton(
      unitOfWork,
      { generate: () => "", hash: async () => new Uint8Array([1]) },
      () => now,
    ).execute(
      {
        id: "872a294a-5de6-47ac-95e2-4af9b32a79bb",
        cardId,
        sessionToken: token,
        label: "Website",
        url: "https://example.com",
        type: "WEBSITE",
        displayMode: "BUTTON",
        color: null,
        isVisible: true,
        openInNewTab: true,
        analyticsEnabled: true,
      },
      undefined,
      false,
    );

    expect(result).toEqual({ id: cardId, slug: source.slug });
    expect(cards.findEditorForMutationById).toHaveBeenCalledTimes(1);
    expect(cards.findEditorById).not.toHaveBeenCalled();
  });

  it("validates slug uniqueness through the use case", async () => {
    const { cards, unitOfWork } = deps();
    await new ChangeCardSlug(
      unitOfWork,
      { generate: () => "", hash: async () => new Uint8Array([1]) },
      () => now,
    ).execute({ cardId, sessionToken: token, slug: "new-slug" });
    expect(cards.slugExists).toHaveBeenCalledWith("new-slug", cardId);
    expect(cards.updateSettings).toHaveBeenCalledWith(cardId, {
      slug: "new-slug",
    });
  });
  it("rejects unsafe destinations and malformed phone numbers", () => {
    expect(
      createCardButtonSchema.safeParse({
        cardId,
        sessionToken: token,
        label: "Bad",
        url: "javascript:alert(1)",
        isVisible: true,
      }).success,
    ).toBe(false);
    expect(
      updateCardProfileSchema.shape.profile.safeParse({
        ...source.profile,
        phone: "not-a-phone",
      }).success,
    ).toBe(false);
  });
});
