import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCardBlock: { execute: vi.fn() },
  getWorkspaceAdminAuthorization: vi.fn(),
  invalidatePublicCard: vi.fn(),
  invalidateAllPublicCards: vi.fn(),
}));
vi.mock("@/lib/composition-root", () => ({
  createCardBlock: mocks.createCardBlock,
  reorderCardBlocks: { execute: vi.fn() },
}));
vi.mock("@/lib/workspace-admin-authorization.server", () => ({
  getWorkspaceAdminAuthorization: mocks.getWorkspaceAdminAuthorization,
}));
vi.mock("@/features/public-card/public-card-cache.server", () => ({
  invalidatePublicCard: mocks.invalidatePublicCard,
  invalidateAllPublicCards: mocks.invalidateAllPublicCards,
}));

import { POST as createBlockRoute } from "@/app/cards/[id]/blocks/route";

const cardId = "0915a8e0-60eb-4cfc-b6dc-adcb01dd249a";
const token = "a".repeat(64);
const input = {
  sessionToken: token,
  kind: "RICH_TEXT",
  config: { content: "Hello" },
  isEnabled: true,
};
function request() {
  return new Request(`https://oi.test/cards/${cardId}/blocks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

describe("shared Workspace block route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createCardBlock.execute.mockResolvedValue({ id: cardId, slug: "ada" });
  });

  it("awaits Next.js Promise params and passes card.id to the customer block use case", async () => {
    mocks.getWorkspaceAdminAuthorization.mockResolvedValue(undefined);
    const response = await createBlockRoute(request(), {
      params: Promise.resolve({ id: cardId }),
    });
    expect(response.status).toBe(200);
    expect(mocks.invalidatePublicCard).toHaveBeenCalledWith("ada");
    expect(mocks.createCardBlock.execute).toHaveBeenCalledWith(
      { cardId, ...input },
      undefined,
    );
  });

  it("passes the identical card context and command for Admin mode", async () => {
    const authorization = { adminEmail: "admin@oi.test" };
    mocks.getWorkspaceAdminAuthorization.mockResolvedValue(authorization);
    const response = await createBlockRoute(request(), {
      params: Promise.resolve({ id: cardId }),
    });
    expect(response.status).toBe(200);
    expect(mocks.invalidatePublicCard).toHaveBeenCalledWith("ada");
    expect(mocks.createCardBlock.execute).toHaveBeenCalledWith(
      { cardId, ...input },
      authorization,
    );
  });
});
