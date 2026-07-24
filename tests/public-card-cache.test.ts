import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({
  invalidatePublicCard: vi.fn(),
  invalidateAllPublicCards: vi.fn(),
}));

vi.mock("@/features/public-card/public-card-cache.server", () => cacheMocks);

import { handlePublicCardMutationRoute } from "@/features/public-card/public-card-mutation-route.server";

describe("public card cache invalidation", () => {
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
