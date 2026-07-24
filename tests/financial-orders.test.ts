import { describe, expect, it, vi } from "vitest";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
import { CreateOrder } from "@/use-cases/create-order";

describe("financial order snapshots", () => {
  it("copies selected plan pricing into the order", async () => {
    const orders = { create: vi.fn(async (value: Record<string, unknown>) => ({ id: "order-1", status: "PENDING", ...value })) };
    const repositories = {
      orders,
      platform: { findPlan: vi.fn(async () => ({ id: "plan-1", name: "Pro", description: "Snapshot", currency: "USD", monthlyMinor: 1200, quarterlyMinor: 3000, yearlyMinor: 10000, key: "pro", active: true, sortOrder: 0, features: [], createdAt: new Date(), updatedAt: new Date() })) },
    } as unknown as TransactionRepositories;
    const unitOfWork = { execute: (work: (r: TransactionRepositories) => Promise<unknown>) => work(repositories) } as UnitOfWork;
    const created = await new CreateOrder(unitOfWork, { generate: () => "OI-ORDER" }, { now: () => new Date("2026-07-21T00:00:00Z") }).execute({ customerName: "Ada Lovelace", email: "ada@example.com", phone: "+201000000000", package: "DIGITAL", quantity: 2, planId: "3d594650-c44f-4f60-8c9a-c0f44f57615d", billingInterval: "MONTHLY" });
    expect(created).toMatchObject({ planNameSnapshot: "Pro", currency: "USD", planPriceSnapshot: 1200, subtotal: 2400, total: 2400 });
    expect(orders.create).toHaveBeenCalledWith(expect.objectContaining({ total: 2400 }));
  });
});
