import { describe, expect, it, vi } from "vitest";
import { PrismaWorkspaceCardReadRepository, PrismaWorkspaceCardTransactionRepository } from "@/repositories/card.repository";

const WORKSPACE_A = "11111111-1111-4111-8111-111111111111";
const WORKSPACE_B = "22222222-2222-4222-8222-222222222222";
const CARD_ID = "33333333-3333-4333-8333-333333333333";

describe("card repository workspace isolation", () => {
  it("scopes private reads while leaving the public slug capability explicit", async () => {
    const card = { findFirst: vi.fn().mockResolvedValue(null), count: vi.fn().mockResolvedValue(0) };
    const repository = new PrismaWorkspaceCardReadRepository({ card } as never, WORKSPACE_A);

    await repository.findById(CARD_ID, null);
    expect(card.findFirst).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: { id: CARD_ID, workspaceId: WORKSPACE_A, deletedAt: null } }));

    await repository.findRenderSourceBySlug({ slug: "public-card", statuses: ["PUBLISHED"], visibilities: ["PUBLIC"], deletedAt: null });
    expect(card.findFirst).toHaveBeenNthCalledWith(2, expect.objectContaining({ where: expect.not.objectContaining({ workspaceId: expect.anything() }) }));
  });

  it("rejects a cross-workspace mutation before issuing the update", async () => {
    const card = { findFirstOrThrow: vi.fn().mockRejectedValue(new Error("not found")), update: vi.fn() };
    const repository = new PrismaWorkspaceCardTransactionRepository({ card } as never, WORKSPACE_A);

    await expect(repository.update(CARD_ID, { name: "Leaked update" })).rejects.toThrow("not found");
    expect(card.update).not.toHaveBeenCalled();
  });

  it("derives card ownership from the owning customer", async () => {
    const marker = new Error("created");
    const db = { customer: { findFirstOrThrow: vi.fn().mockResolvedValue({ workspaceId: WORKSPACE_A }) }, card: { create: vi.fn().mockRejectedValue(marker) } };
    const repository = new PrismaWorkspaceCardTransactionRepository(db as never, WORKSPACE_A);

    await expect(repository.create({ customerId: "44444444-4444-4444-8444-444444444444", slug: "owned", name: "Owned", fullName: "Owner" })).rejects.toBe(marker);
    expect(db.card.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ workspaceId: WORKSPACE_A }) }));
  });

  it("rejects card creation for a customer in another workspace", async () => {
    const db = { customer: { findFirstOrThrow: vi.fn().mockResolvedValue({ workspaceId: WORKSPACE_B }) }, card: { create: vi.fn() } };
    const repository = new PrismaWorkspaceCardTransactionRepository(db as never, WORKSPACE_A);

    await expect(repository.create({ customerId: "44444444-4444-4444-8444-444444444444", slug: "foreign", name: "Foreign", fullName: "Foreign" })).rejects.toThrow("current workspace");
    expect(db.card.create).not.toHaveBeenCalled();
  });
});
