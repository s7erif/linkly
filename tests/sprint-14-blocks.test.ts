import { describe, expect, it, vi } from "vitest";
import type { EditorCardDTO } from "@/dto";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
import { CreateCardBlock } from "@/use-cases/card-blocks";
import { orderedVisibleBlocks } from "@/components/themes/DefaultTheme";
import {
  createCardBlockSchema,
  safeCardBlockConfig,
} from "@/validation/card-block";
import { defaultAppearanceSettings } from "@/validation/appearance";
const id = "0915a8e0-60eb-4cfc-b6dc-adcb01dd249a",
  token = "a".repeat(64),
  now = new Date("2026-07-20T12:00:00Z");
const source: EditorCardDTO = {
  id,
  customerId: "3d594650-c44b-4f60-8c9a-c0f44f57615d",
  themeId: null,
  slug: "block-card",
  name: "Block Card",
  status: "PUBLISHED",
  visibility: "PUBLIC",
  publishedAt: now,
  accessVersion: 1,
  profile: {
    fullName: "Block Card",
    headline: null,
    company: null,
    bio: "Legacy about",
    email: null,
    phone: null,
    website: null,
    address: null,
    countryCode: null,
  },
  themeConfig: defaultAppearanceSettings,
  sections: [
    { id: "s1", kind: "ABOUT", title: null, position: 0, isVisible: true },
    { id: "s2", kind: "PROFILE", title: null, position: 1, isVisible: true },
    { id: "s3", kind: "CONTACT", title: null, position: 2, isVisible: false },
    { id: "s4", kind: "BUTTONS", title: null, position: 3, isVisible: true },
    {
      id: "s5",
      kind: "SOCIAL_LINKS",
      title: null,
      position: 4,
      isVisible: true,
    },
  ],
  blocks: [],
  buttons: [],
  socialLinks: [],
  createdAt: now,
  updatedAt: now,
};
describe("Sprint 14 blocks", () => {
  it("maps legacy sections into compatible ordered blocks", () => {
    const blocks = orderedVisibleBlocks({
      ...source,
      blocks: undefined,
      appearance: defaultAppearanceSettings,
      buttons: [],
      socialLinks: [],
    });
    expect(blocks.map((block) => block.kind)).toEqual([
      "ABOUT",
      "HERO",
      "CTA_BUTTONS",
      "SOCIAL_LINKS",
    ]);
  });
  it("validates configurations independently by block kind", () => {
    expect(
      safeCardBlockConfig("FAQ", {
        heading: "FAQ",
        items: [{ id: crypto.randomUUID(), question: "Q", answer: "A" }],
      }),
    ).not.toBeNull();
    expect(safeCardBlockConfig("LOCATION_MAP", { address: "" })).toBeNull();
    expect(
      createCardBlockSchema.safeParse({
        cardId: id,
        sessionToken: token,
        kind: "VIDEO",
        config: { url: "not-url" },
        isEnabled: true,
      }).success,
    ).toBe(false);
  });
  it("materializes compatibility blocks before creating the first custom block", async () => {
    const materialized = {
      ...source,
      blocks: [
        {
          id: crypto.randomUUID(),
          kind: "HERO",
          position: 0,
          isEnabled: true,
          config: {},
          mediaIds: [],
        },
      ],
    };
    const cards = {
      findEditorById: vi.fn(async () => source),
      replaceBlocks: vi.fn(async () => materialized),
      createBlock: vi.fn(async () => ({
        ...materialized,
        blocks: [
          ...(materialized.blocks ?? []),
          {
            id: crypto.randomUUID(),
            kind: "RICH_TEXT",
            position: 1,
            isEnabled: true,
            config: { content: "Hello" },
            mediaIds: [],
          },
        ],
      })),
      mediaIdsBelongToCardCustomer: vi.fn(async () => true),
    };
    const repositories = {
        cards,
        editorSessions: {
          findByTokenHash: vi.fn(async () => ({
            id: "session",
            cardId: id,
            accessCodeId: "access",
            status: "ACTIVE",
            expiresAt: new Date("2026-07-20T13:00:00Z"),
            lastSeenAt: null,
            createdAt: now,
            revokedAt: null,
          })),
        },
      } as unknown as TransactionRepositories,
      unitOfWork: UnitOfWork = { execute: (work) => work(repositories) };
    await new CreateCardBlock(
      unitOfWork,
      { generate: () => "", hash: async () => new Uint8Array([1]) },
      () => now,
    ).execute({
      cardId: id,
      sessionToken: token,
      kind: "RICH_TEXT",
      config: { content: "Hello" },
      isEnabled: true,
    });
    expect(cards.replaceBlocks).toHaveBeenCalled();
    expect(cards.createBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "RICH_TEXT",
        config: { content: "Hello" },
      }),
    );
  });
});
