import { describe, expect, it, vi } from "vitest";
import type { WorkspaceScope } from "@/domain/workspace-access";
import { PrismaCustomerReadRepository, PrismaCustomerTransactionRepository } from "@/repositories/customer.repository";
import { PrismaOrderReadRepository, PrismaOrderTransactionRepository } from "@/repositories/order.repository";

const scope: WorkspaceScope = { accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", membershipId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", workspaceId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", role: "OWNER" };

describe("workspace customer and order repository isolation", () => {
  it("includes workspace ownership in customer reads", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const repository = new PrismaCustomerReadRepository({ customer: { findFirst } } as never);
    await repository.findByIdInWorkspace(scope, "dddddddd-dddd-4ddd-8ddd-dddddddddddd", null);
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ workspaceId: scope.workspaceId }) }));
  });

  it("injects workspace ownership into customer creates", async () => {
    const create = vi.fn().mockRejectedValue(new Error("stop after query capture"));
    const repository = new PrismaCustomerTransactionRepository({ customer: { create } } as never);
    await expect(repository.createInWorkspace(scope, { displayName: "Tenant customer", locale: "en", timezone: "UTC" })).rejects.toThrow();
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ workspaceId: scope.workspaceId }) }));
  });

  it("includes workspace ownership in order lists", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const repository = new PrismaOrderReadRepository({ order: { findMany } } as never);
    await repository.listInWorkspace(scope, { take: 20 });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ workspaceId: scope.workspaceId }) }));
  });

  it("cannot transition an order outside the current workspace", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const repository = new PrismaOrderTransactionRepository({ order: { updateMany } } as never);
    const result = await repository.transitionInWorkspace(scope, { id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", fromStatus: "PENDING", update: { status: "APPROVED" } });
    expect(result).toBeNull();
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ workspaceId: scope.workspaceId }) }));
  });
});
