import { describe, expect, it, vi } from "vitest";
import type { AccessCodeDTO, CardDTO, CustomerDTO, EditorCardDTO } from "@/dto";
import { InitialAccessCodeExistsError, InvalidAccessCodeError, NotFoundError, ValidationError } from "@/lib/errors";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
import { CreateCard, CreateCustomer, CreateEditorSession, GenerateInitialAccessCode, ReadPublicCard, VerifyAccessCode } from "@/use-cases";

const CUSTOMER_ID = "3d594650-c44b-4f60-8c9a-c0f44f57615d";
const CARD_ID = "86bfda9c-ef1f-41b5-aec9-198cc664b42f";
const CODE_ID = "32ca1ea0-f889-49ff-aa1a-ab72691492e9";
const SESSION_ID = "ee50b035-0824-4551-a2ea-dfc7a40f62f0";
const NOW = new Date("2026-07-20T10:00:00.000Z");
const customer: CustomerDTO = { id: CUSTOMER_ID, displayName: "Ada", email: null, phone: null, status: "ACTIVE", locale: "en", timezone: "UTC", createdAt: NOW, updatedAt: NOW };
const card: CardDTO = { id: CARD_ID, customerId: CUSTOMER_ID, slug: "ada", name: "Ada", status: "DRAFT", visibility: "PRIVATE", publishedAt: null, accessVersion: 1, profile: { fullName: "Ada", headline: null, company: null, bio: null, email: null, phone: null, website: null, address: null, countryCode: null }, createdAt: NOW, updatedAt: NOW };
const accessCode: AccessCodeDTO = { id: CODE_ID, cardId: CARD_ID, version: 1, status: "ACTIVE", expiresAt: new Date("2026-07-21T10:00:00.000Z"), lastUsedAt: null, useCount: 0, createdAt: NOW, revokedAt: null };

function makeRepositories(overrides: Partial<TransactionRepositories> = {}): TransactionRepositories {
  return {
    customers: { findById: vi.fn(), create: vi.fn(), update: vi.fn() },
    cards: { findById: vi.fn(), findEditorById: vi.fn(), findRenderSourceBySlug: vi.fn(), create: vi.fn(), update: vi.fn(), incrementAccessVersion: vi.fn() },
    accessCodes: { findByHash: vi.fn(), findLatestByCard: vi.fn(), findMaximumVersion: vi.fn(), create: vi.fn(), updateMany: vi.fn(), markUsed: vi.fn(), recordEvent: vi.fn() },
    editorSessions: { create: vi.fn(), revokeByCard: vi.fn() },
    legacy: { listCardsByUser: vi.fn(), findCardByIdAndUser: vi.fn(), findCardByHash: vi.fn(), cardHashExists: vi.fn(), cardSlugExists: vi.fn(), listLinks: vi.fn(), findUserByEmail: vi.fn(), createCard: vi.fn(), updateCard: vi.fn(), deleteCard: vi.fn(), replaceLinks: vi.fn(), deleteLinks: vi.fn(), createUser: vi.fn() },
    ...overrides,
  } as TransactionRepositories;
}
function unitOfWork(repositories: TransactionRepositories): UnitOfWork {
  return { execute: (work) => work(repositories) };
}

describe("Sprint 2 application use cases", () => {
  it("CreateCustomer validates input, writes in UnitOfWork, and returns CustomerDTO", async () => {
    const repositories = makeRepositories();
    vi.mocked(repositories.customers.create).mockResolvedValue(customer);
    let executions = 0;
    const trackedUnitOfWork: UnitOfWork = { execute: (work) => { executions += 1; return work(repositories); } };
    const result = await new CreateCustomer(trackedUnitOfWork).execute({ displayName: " Ada ", locale: "en", timezone: "UTC" });
    expect(executions).toBe(1);
    expect(repositories.customers.create).toHaveBeenCalledWith({ displayName: "Ada", locale: "en", timezone: "UTC" });
    expect(result).toEqual(customer);
  });

  it("CreateCustomer converts Zod failures to an explicit ValidationError", async () => {
    expect(() => new CreateCustomer(unitOfWork(makeRepositories())).execute({ displayName: "", locale: "en", timezone: "UTC" })).toThrow(ValidationError);
  });

  it("CreateCard verifies the customer and returns CardDTO", async () => {
    const repositories = makeRepositories();
    vi.mocked(repositories.customers.findById).mockResolvedValue(customer);
    vi.mocked(repositories.cards.create).mockResolvedValue(card);
    const result = await new CreateCard(unitOfWork(repositories)).execute({ customerId: CUSTOMER_ID, slug: "ada", name: "Ada", fullName: "Ada Lovelace" });
    expect(repositories.cards.create).toHaveBeenCalledWith({ customerId: CUSTOMER_ID, slug: "ada", name: "Ada", fullName: "Ada Lovelace" });
    expect(result).toEqual(card);
  });

  it("CreateCard raises NotFoundError without writing for a missing customer", async () => {
    const repositories = makeRepositories();
    vi.mocked(repositories.customers.findById).mockResolvedValue(null);
    await expect(new CreateCard(unitOfWork(repositories)).execute({ customerId: CUSTOMER_ID, slug: "ada", name: "Ada", fullName: "Ada" })).rejects.toBeInstanceOf(NotFoundError);
    expect(repositories.cards.create).not.toHaveBeenCalled();
  });

  it("GenerateInitialAccessCode returns plaintext once and persists only its hash", async () => {
    const repositories = makeRepositories();
    vi.mocked(repositories.cards.findById).mockResolvedValue(card);
    vi.mocked(repositories.accessCodes.findMaximumVersion).mockResolvedValue(null);
    vi.mocked(repositories.accessCodes.create).mockResolvedValue(accessCode);
    const hash = new Uint8Array([1, 2, 3]);
    const hasher = { hash: vi.fn().mockResolvedValue(hash) };
    const generator = { generate: vi.fn().mockReturnValue("0123456789ABCDEFGHJKMNPQRS"), format: vi.fn((value: string) => `OI-${value}`) };
    const result = await new GenerateInitialAccessCode(unitOfWork(repositories), hasher, generator).execute({ cardId: CARD_ID });
    expect(result.code).toBe("OI-0123456789ABCDEFGHJKMNPQRS");
    expect(repositories.accessCodes.create).toHaveBeenCalledWith(expect.objectContaining({ cardId: CARD_ID, codeHash: hash, version: 1 }));
    expect(repositories.accessCodes.create).not.toHaveBeenCalledWith(expect.objectContaining({ code: expect.anything() }));
  });

  it("GenerateInitialAccessCode rejects a second initial code", async () => {
    const repositories = makeRepositories();
    vi.mocked(repositories.cards.findById).mockResolvedValue(card);
    vi.mocked(repositories.accessCodes.findMaximumVersion).mockResolvedValue(1);
    await expect(new GenerateInitialAccessCode(unitOfWork(repositories), { hash: vi.fn().mockResolvedValue(new Uint8Array([1])) }, { generate: () => "0123456789ABCDEFGHJKMNPQRS", format: (value) => value }).execute({ cardId: CARD_ID })).rejects.toBeInstanceOf(InitialAccessCodeExistsError);
  });

  it("VerifyAccessCode hashes normalized plaintext, records usage, and returns a safe DTO", async () => {
    const repositories = makeRepositories();
    vi.mocked(repositories.accessCodes.findByHash).mockResolvedValue(accessCode);
    const hasher = { hash: vi.fn().mockResolvedValue(new Uint8Array([4, 5, 6])) };
    const result = await new VerifyAccessCode(unitOfWork(repositories), hasher, { now: () => NOW }).execute({ code: "OI-01234-56789-ABCDE-FGHJK-MNPQRS" });
    expect(hasher.hash).toHaveBeenCalledWith("0123456789ABCDEFGHJKMNPQRS");
    expect(repositories.accessCodes.markUsed).toHaveBeenCalledWith(CODE_ID, NOW);
    expect(repositories.accessCodes.recordEvent).toHaveBeenCalledWith(expect.objectContaining({ accessCodeId: CODE_ID, success: true }));
    expect(result).toEqual({ accessCodeId: CODE_ID, cardId: CARD_ID, verifiedAt: NOW, expiresAt: accessCode.expiresAt });
    expect(result).not.toHaveProperty("code");
  });

  it("VerifyAccessCode commits a known expired-code event before rejecting", async () => {
    const repositories = makeRepositories();
    vi.mocked(repositories.accessCodes.findByHash).mockResolvedValue({ ...accessCode, expiresAt: new Date("2026-07-19T10:00:00.000Z") });
    const useCase = new VerifyAccessCode(unitOfWork(repositories), { hash: vi.fn().mockResolvedValue(new Uint8Array([1])) }, { now: () => NOW });
    await expect(useCase.execute({ code: "0123456789ABCDEFGHJKMNPQRS" })).rejects.toBeInstanceOf(InvalidAccessCodeError);
    expect(repositories.accessCodes.recordEvent).toHaveBeenCalledWith(expect.objectContaining({ success: false, failureReason: "EXPIRED" }));
  });

  it("CreateEditorSession stores only a token hash and returns the token once", async () => {
    const repositories = makeRepositories();
    vi.mocked(repositories.accessCodes.findByHash).mockResolvedValue(accessCode);
    vi.mocked(repositories.editorSessions.create).mockImplementation(async (command) => ({ id: SESSION_ID, cardId: command.cardId, accessCodeId: command.accessCodeId, status: "ACTIVE", expiresAt: command.expiresAt, lastSeenAt: null, createdAt: NOW, revokedAt: null }));
    const tokenHash = new Uint8Array([9, 8, 7]);
    const result = await new CreateEditorSession(unitOfWork(repositories), { hash: vi.fn().mockResolvedValue(new Uint8Array([1])) }, { generate: () => "session-plaintext", hash: vi.fn().mockResolvedValue(tokenHash) }, { now: () => NOW }).execute({ code: "0123456789ABCDEFGHJKMNPQRS", lifetimeSeconds: 3600 });
    expect(result.token).toBe("session-plaintext");
    expect(repositories.editorSessions.create).toHaveBeenCalledWith({ cardId: CARD_ID, accessCodeId: CODE_ID, tokenHash, expiresAt: new Date("2026-07-20T11:00:00.000Z") });
    expect(repositories.accessCodes.recordEvent).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("ReadPublicCard returns only PublicCardDTO and filters hidden actions", async () => {
    const source: EditorCardDTO = { ...card, status: "PUBLISHED", visibility: "PUBLIC", themeConfig: { private: true }, buttons: [{ id: "b1", label: "Visible", url: "https://example.com", position: 0, isVisible: true, type: "WEBSITE", displayMode: "BUTTON", color: null, openInNewTab: false, analyticsEnabled: false }, { id: "b2", label: "Hidden", url: "https://example.com/h", position: 1, isVisible: false, type: "WEBSITE", displayMode: "BUTTON", color: null, openInNewTab: false, analyticsEnabled: false }], socialLinks: [{ id: "s1", platform: "x", label: null, url: "https://x.com/a", position: 0, isVisible: true }] };
    const cards = { findById: vi.fn(), findEditorById: vi.fn(), findRenderSourceBySlug: vi.fn().mockResolvedValue(source) };
    const result = await new ReadPublicCard(cards).execute({ slug: "ada" });
    expect(result.buttons).toEqual([expect.objectContaining({ id: "b1", label: "Visible", url: "https://example.com", position: 0 })]);
    expect(result.buttons).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "b2" })]));
    expect(result).not.toHaveProperty("customerId");
    expect(result).not.toHaveProperty("accessVersion");
    expect(result).not.toHaveProperty("themeConfig");
  });
});
