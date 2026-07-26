import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({
  invalidatePublicCard: vi.fn(),
  invalidateAllPublicCards: vi.fn(),
}));

vi.mock("@/features/public-card/public-card-cache.server", () => cacheMocks);

import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";
import { PrismaCardTransactionRepository } from "@/repositories/card.repository";
import { defaultAppearanceSettings } from "@/validation/appearance";

describe("public card cache invalidation", () => {
  it("carries the slug out of the same appearance write that changes public data", async () => {
    const update = vi.fn().mockResolvedValue({ id: "card-id", slug: "john-doe" });
    const repository = new PrismaCardTransactionRepository({
      card: { update },
    } as never);

    await expect(
      repository.updateAppearance("card-id", defaultAppearanceSettings),
    ).resolves.toEqual({ id: "card-id", slug: "john-doe" });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ select: { id: true, slug: true } }),
    );
  });

  it("includes the slug in the avatar ownership lookup", async () => {
    const findFirst = vi.fn().mockResolvedValue({
      customerId: "customer-id",
      workspaceId: "workspace-id",
      slug: "john-doe",
    });
    const repository = new PrismaCardTransactionRepository({
      card: { findFirst },
    } as never);

    await expect(repository.findOwnership("card-id")).resolves.toEqual({
      customerId: "customer-id",
      workspaceId: "workspace-id",
      slug: "john-doe",
    });
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: { customerId: true, workspaceId: true, slug: true },
      }),
    );
  });

  beforeEach(() => {
    cacheMocks.invalidatePublicCard.mockReset();
    cacheMocks.invalidateAllPublicCards.mockReset();
  });

  it("expires the changed card before returning a successful mutation", async () => {
    const response = await handlePublicCardMutationRoute(
      new Request("https://oi.test/cards/card-id/profile", { method: "PUT" }),
      async () => ({ data: { slug: "john-doe" } }),
    );

    expect(response.status).toBe(200);
    expect(cacheMocks.invalidatePublicCard).toHaveBeenCalledWith("john-doe");
  });

  it.each(["appearance", "avatar"])(
    "requires and expires the card slug after a successful %s write",
    async (resource) => {
      await handlePublicCardMutationRoute(
        new Request(`https://oi.test/cards/card-id/${resource}`, {
          method: resource === "avatar" ? "POST" : "PUT",
        }),
        async () => ({ data: { id: "card-id", slug: "john-doe" } }),
      );

      expect(cacheMocks.invalidatePublicCard).toHaveBeenCalledWith("john-doe");
    },
  );

  it("expires all entries after a slug change so the former slug cannot survive", async () => {
    await handlePublicCardMutationRoute(
      new Request("https://oi.test/cards/card-id/slug", { method: "PUT" }),
      async () => ({ data: { slug: "new-slug" } }),
    );

    expect(cacheMocks.invalidateAllPublicCards).toHaveBeenCalledOnce();
  });

  it("does not invalidate when a mutation fails", async () => {
    await handlePublicCardMutationRoute(
      new Request("https://oi.test/cards/card-id/publication", {
        method: "PUT",
      }),
      async () => {
        throw new Error("write failed");
      },
    );

    expect(cacheMocks.invalidatePublicCard).not.toHaveBeenCalled();
    expect(cacheMocks.invalidateAllPublicCards).not.toHaveBeenCalled();
  });
});
