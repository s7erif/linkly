import { describe, expect, it, vi } from "vitest";
import type { ActivationRepository } from "@/repositories/contracts";
import { ActivationService } from "@/services/activation.service";
import type { ActivationAccountRecord, ActivationResult } from "@/types/activation";

const TOKEN = "8FK2QM9X";
const SECRET = "activation-test-secret-with-sufficient-entropy";
const activationResult = (overrides: Partial<ActivationResult> = {}): ActivationResult => ({
  activationId: "activation-1", customerId: "customer-1", cardId: "card-1",
  slug: "sherif-osman", customerCreated: true, workspaceCreated: true, firstCard: true,
  ...overrides,
});

type ActivationOverrides = Partial<Pick<ActivationRepository, "findCardByActivationToken" | "findAccountByEmail" | "findAccountBySessionHash" | "activateByToken" | "createDigitalCardForAccount" | "createEditorSessionForAccount">>;

function repository(overrides: ActivationOverrides = {}): ActivationRepository {
  return {
    findCardByActivationToken: vi.fn<ActivationRepository["findCardByActivationToken"]>(async () => ({ id: "nfc-1", status: "AVAILABLE", workspaceSlug: null })),
    findAccountByEmail: vi.fn(async () => null),
    findAccountBySessionHash: vi.fn(async () => null),
    activateByToken: vi.fn(async () => activationResult()),
    createPasswordReset: vi.fn(async () => false),
    resetPassword: vi.fn(async () => false),
    revokeSession: vi.fn(async () => undefined),
    createSession: vi.fn(async () => undefined),
    registerCustomerAccount: vi.fn(async () => ({ accountId: "account-1", customerId: "customer-1", workspaceId: "workspace-1" })),
    createDigitalCardForAccount: vi.fn(async () => ({ cardId: "card-1", slug: "sherif-osman" })),
    createEditorSessionForAccount: vi.fn(async () => ({ cardId: "card-1", slug: "sherif-osman" })),
    ...overrides,
  };
}

describe("customer NFC activation onboarding", () => {
  it("creates a normalized, hashed password reset challenge", async () => {
    const repo = repository();
    vi.mocked(repo.createPasswordReset).mockResolvedValue(true);
    const service = new ActivationService(repo, SECRET);
    const result = await service.requestPasswordReset({ email: " USER@EXAMPLE.COM " });
    expect(repo.createPasswordReset).toHaveBeenCalledWith("user@example.com", expect.any(Uint8Array), expect.any(Date));
    expect(result).toMatchObject({ created: true, email: "user@example.com", token: expect.any(String) });
  });

  it("validates and delegates password reset with a hashed token and new scrypt password", async () => {
    const repo = repository();
    vi.mocked(repo.resetPassword).mockResolvedValue(true);
    const service = new ActivationService(repo, SECRET);
    await expect(service.resetCustomerPassword({ token: "a".repeat(40), password: "NewSecure123", confirmPassword: "NewSecure123" })).resolves.toBe(true);
    expect(repo.resetPassword).toHaveBeenCalledWith(expect.objectContaining({ tokenHash: expect.any(Uint8Array), passwordHash: expect.any(Uint8Array), passwordSalt: expect.any(Uint8Array), now: expect.any(Date) }));
  });

  it("rejects mismatched password reset confirmation before repository access", async () => {
    const repo = repository();
    const service = new ActivationService(repo, SECRET);
    await expect(service.resetCustomerPassword({ token: "a".repeat(40), password: "NewSecure123", confirmPassword: "Different123" })).rejects.toThrow();
    expect(repo.resetPassword).not.toHaveBeenCalled();
  });

  it("registers a standalone customer through the transactional account repository", async () => {
    const repo = repository();
    const service = new ActivationService(repo, SECRET);
    const result = await service.registerCustomer({ firstName: " Sherif ", lastName: " Osman ", email: " SHERIF@EXAMPLE.COM ", password: "Secure123", confirmPassword: "Secure123" });
    expect(repo.registerCustomerAccount).toHaveBeenCalledWith(expect.objectContaining({ displayName: "Sherif Osman", email: "sherif@example.com", passwordHash: expect.any(Uint8Array), passwordSalt: expect.any(Uint8Array), sessionHash: expect.any(Uint8Array), sessionExpiresAt: expect.any(Date) }));
    expect(result).toMatchObject({ workspaceId: "workspace-1", token: expect.any(String), expiresAt: expect.any(Date) });
  });

  it("rejects duplicate standalone registration before the transaction", async () => {
    const repo = repository({ findAccountByEmail: vi.fn(async () => ({ id: "account-1" }) as ActivationAccountRecord) });
    const service = new ActivationService(repo, SECRET);
    await expect(service.registerCustomer({ firstName: "Sherif", lastName: "Osman", email: "sherif@example.com", password: "Secure123", confirmPassword: "Secure123" })).rejects.toThrow("account already exists");
    expect(repo.registerCustomerAccount).not.toHaveBeenCalled();
  });
  it("rejects mismatched standalone registration passwords before repository access", async () => {
    const repo = repository();
    const service = new ActivationService(repo, SECRET);
    await expect(service.registerCustomer({ firstName: "Sherif", lastName: "Osman", email: "sherif@example.com", password: "Secure123", confirmPassword: "Different123" })).rejects.toThrow();
    expect(repo.findAccountByEmail).not.toHaveBeenCalled();
    expect(repo.registerCustomerAccount).not.toHaveBeenCalled();
  });

  it("passes one normalized registration payload to the transactional repository", async () => {
    const repo = repository();
    const service = new ActivationService(repo, SECRET);
    const activated = await service.registerAndActivate({
      activationToken: ` ${TOKEN.toLowerCase()} `, username: " Sherif-Osman ",
      firstName: " Sherif ", lastName: " Osman ", email: " SHERIF@EXAMPLE.COM ",
      phone: "", password: "Secure123", confirmPassword: "Secure123",
    });

    expect(repo.findCardByActivationToken).toHaveBeenCalledWith(TOKEN);
    expect(repo.findAccountByEmail).toHaveBeenCalledWith("sherif@example.com");
    expect(repo.activateByToken).toHaveBeenCalledOnce();
    expect(repo.activateByToken).toHaveBeenCalledWith(expect.objectContaining({
      activationToken: TOKEN, slug: "sherif-osman",
      registration: expect.objectContaining({
        displayName: "Sherif Osman", email: "sherif@example.com", phone: null,
        passwordHash: expect.any(Uint8Array), passwordSalt: expect.any(Uint8Array),
      }),
    }));
    expect(activated).toMatchObject({ customerCreated: true, workspaceCreated: true, firstCard: true });
  });

  it("reuses the authenticated account and workspace for an additional card", async () => {
    const account: ActivationAccountRecord = {
      id: "account-1", customerId: "customer-1", email: "sherif@example.com",
      passwordHash: new Uint8Array([1]), passwordSalt: new Uint8Array([2]),
      workspace: { id: "workspace-1", primaryCardId: "primary-card" },
    };
    const repo = repository({
      findAccountBySessionHash: vi.fn(async () => account),
      activateByToken: vi.fn(async () => activationResult({
        customerCreated: false, workspaceCreated: false, firstCard: false,
        cardId: "card-2", slug: "second-card",
      })),
    });
    const service = new ActivationService(repo, SECRET);
    const activated = await service.activateAuthenticated(TOKEN, " Second-Card ", "customer-session");

    expect(repo.activateByToken).toHaveBeenCalledWith(expect.objectContaining({
      activationToken: TOKEN, slug: "second-card", account,
    }));
    expect(repo.activateByToken).toHaveBeenCalledWith(expect.not.objectContaining({ registration: expect.anything() }));
    expect(activated).toMatchObject({
      customerCreated: false, workspaceCreated: false, firstCard: false, cardId: "card-2",
    });
  });

  it("rejects an unavailable or already activated card before mutation", async () => {
    const repo = repository({
      findCardByActivationToken: vi.fn<ActivationRepository["findCardByActivationToken"]>(async () => ({ id: "nfc-1", status: "ACTIVATED", workspaceSlug: "existing-profile" })),
    });
    const service = new ActivationService(repo, SECRET);
    await expect(service.registerAndActivate({
      activationToken: TOKEN, username: "new-profile", firstName: "Sherif",
      lastName: "Osman", email: "new@example.com", password: "Secure123",
      confirmPassword: "Secure123",
    })).rejects.toThrow("NFC card is unavailable");
    expect(repo.activateByToken).not.toHaveBeenCalled();
  });

  it("requires a valid customer session before authenticated activation", async () => {
    const repo = repository();
    const service = new ActivationService(repo, SECRET);
    await expect(service.activateAuthenticated(TOKEN, "sherif-osman", "expired-session"))
      .rejects.toThrow("NFC card or customer session is invalid");
    expect(repo.activateByToken).not.toHaveBeenCalled();
  });

  it("stops duplicate-email registration before creating activation resources", async () => {
    const repo = repository({ findAccountByEmail: vi.fn(async () => ({ id: "account-1" }) as ActivationAccountRecord) });
    const service = new ActivationService(repo, SECRET);
    await expect(service.registerAndActivate({
      activationToken: TOKEN, username: "sherif-osman", firstName: "Sherif",
      lastName: "Osman", email: "sherif@example.com", password: "Secure123",
      confirmPassword: "Secure123",
    })).rejects.toThrow("An account already exists for this email");
    expect(repo.activateByToken).not.toHaveBeenCalled();
  });

  it("creates the first digital card and issues its editor session from the authenticated Workspace", async () => {
    const account: ActivationAccountRecord = {
      id: "account-1", customerId: "customer-1", displayName: "Sherif Osman", email: "sherif@example.com",
      passwordHash: new Uint8Array([1]), passwordSalt: new Uint8Array([2]),
      workspace: { id: "workspace-1", primaryCardId: null, cards: [] },
    };
    const repo = repository({ findAccountBySessionHash: vi.fn(async () => account) });
    const service = new ActivationService(repo, SECRET);

    const result = await service.createDigitalCardForSession("customer-session");

    expect(repo.createDigitalCardForAccount).toHaveBeenCalledWith(expect.objectContaining({
      accountId: "account-1", customerId: "customer-1", workspaceId: "workspace-1",
      displayName: "Sherif Osman", email: "sherif@example.com",
      slug: "sherif-osman",
      accessCodeHash: expect.any(Uint8Array), editorSessionHash: expect.any(Uint8Array),
      editorSessionExpiresAt: expect.any(Date),
    }));
    expect(result).toMatchObject({ cardId: "card-1", slug: "sherif-osman", editorToken: expect.any(String), editorExpiresAt: expect.any(Date) });
  });

  it("issues a fresh editor session only for a card owned by the authenticated Workspace", async () => {
    const cardId = "00000000-0000-4000-8000-000000000001";
    const account: ActivationAccountRecord = {
      id: "account-1", customerId: "customer-1", email: "sherif@example.com",
      passwordHash: new Uint8Array([1]), passwordSalt: new Uint8Array([2]),
      workspace: { id: "workspace-1", primaryCardId: cardId, cards: [{ id: cardId, name: "Sherif", slug: "sherif" }] },
    };
    const repo = repository({
      findAccountBySessionHash: vi.fn(async () => account),
      createEditorSessionForAccount: vi.fn(async () => ({ cardId, slug: "sherif" })),
    });
    const service = new ActivationService(repo, SECRET);

    await expect(service.openCardForSession("customer-session", cardId)).resolves.toMatchObject({ cardId, slug: "sherif", editorToken: expect.any(String) });
    expect(repo.createEditorSessionForAccount).toHaveBeenCalledWith(expect.objectContaining({
      accountId: "account-1", customerId: "customer-1", workspaceId: "workspace-1", cardId,
      editorSessionHash: expect.any(Uint8Array), editorSessionExpiresAt: expect.any(Date),
    }));
  });
});
