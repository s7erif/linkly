import { describe, expect, it, vi } from "vitest";
import type { NfcCardRepository } from "@/repositories/contracts";
import { NfcCardService } from "@/services/nfc-card.service";
import { buildActivationPath, buildProfileUrl, buildWorkspaceUrl, getBaseUrl } from "@/lib/public-links";
import { activationTokenSchema } from "@/validation/activation";

vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.test///");

function repository() {
  return {
    list: vi.fn(),
    listForExport: vi.fn(),
    summary: vi.fn(),
    inventory: vi.fn(),
    createCards: vi.fn(async (tokens: readonly string[]) => tokens.length),
    updateStatus: vi.fn(),
    softDelete: vi.fn(),
    listForWorkspace: vi.fn(),
    summaryForWorkspace: vi.fn(),
    findByIdForWorkspace: vi.fn(),
    updateStatusForWorkspace: vi.fn(),
    softDeleteForWorkspace: vi.fn(),
  } satisfies NfcCardRepository;
}

describe("short NFC activation tokens", () => {
  it("generates unique eight-character uppercase tokens and permanent activation URLs", async () => {
    const store = repository();
    const service = new NfcCardService(store);

    await expect(service.create({ quantity: 500 })).resolves.toBe(500);

    const tokens = store.createCards.mock.calls[0]?.[0] ?? [];
    expect(tokens).toHaveLength(500);
    expect(new Set(tokens).size).toBe(500);
    expect(tokens.every((value) => /^[A-Z0-9]{8}$/.test(value))).toBe(true);
    expect(service.activationUrl(tokens[0]!)).toBe(`https://app.test/a/${tokens[0]}`);
    expect(getBaseUrl()).toBe("https://app.test");
    expect(buildProfileUrl("sherif")).toBe("https://app.test/@sherif");
    expect(buildWorkspaceUrl("sherif")).toBe("https://app.test/workspace?slug=sherif");
  });

  it("normalizes supported tokens and rejects long public identifiers", () => {
    expect(activationTokenSchema.parse("nfc8k2q9")).toBe("NFC8K2Q9");
    expect(buildActivationPath("nfc8k2q9")).toBe("/a/NFC8K2Q9");
    expect(() => activationTokenSchema.parse("550E8400-E29B-41D4-A716-446655440000")).toThrow();
  });

  it("passes an explicit workspace boundary to tenant NFC operations", async () => {
    const store = repository();
    const service = new NfcCardService(store);
    const workspaceId = "11111111-1111-4111-8111-111111111111";
    const cardId = "22222222-2222-4222-8222-222222222222";
    store.updateStatusForWorkspace.mockResolvedValue({ id: cardId } as never);

    await service.listForWorkspace(workspaceId, { page: 1, pageSize: 20, sortDirection: "desc" });
    await service.setStatusForWorkspace(workspaceId, cardId, "DISABLED");

    expect(store.listForWorkspace).toHaveBeenCalledWith(workspaceId, { page: 1, pageSize: 20, sortDirection: "desc" });
    expect(store.updateStatusForWorkspace).toHaveBeenCalledWith(workspaceId, cardId, "DISABLED");
  });
});
