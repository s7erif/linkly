import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCustomer: { execute: vi.fn() },
  createCard: { execute: vi.fn() },
  verifyAccessCode: { execute: vi.fn() },
  createEditorSession: { execute: vi.fn() },
  readPublicCard: { execute: vi.fn() },
}));
vi.mock("@/lib/composition-root", () => ({
  createCustomer: mocks.createCustomer,
  createCard: mocks.createCard,
  readPublicCard: mocks.readPublicCard,
  getAccessCodeUseCases: () => ({ verifyAccessCode: mocks.verifyAccessCode, createEditorSession: mocks.createEditorSession }),
}));

import { POST as createCustomerRoute } from "@/app/customers/route";
import { POST as createCardRoute } from "@/app/cards/route";
import { POST as verifyRoute } from "@/app/access/verify/route";
import { POST as createSessionRoute } from "@/app/editor/session/route";
import { GET as publicCardRoute } from "@/app/card/[slug]/route";
import { NotFoundError } from "@/lib/errors";

function jsonRequest(path: string, body: unknown, requestId = "request-123"): Request {
  return new Request(`https://oi.test${path}`, { method: "POST", headers: { "content-type": "application/json", "x-request-id": requestId }, body: JSON.stringify(body) });
}
async function body(response: Response): Promise<Record<string, unknown>> {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("Sprint 3 route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("POST /customers validates, calls CreateCustomer, envelopes output, and propagates request ID", async () => {
    mocks.createCustomer.execute.mockResolvedValue({ id: "customer-1" });
    const response = await createCustomerRoute(jsonRequest("/customers", { displayName: "Ada", locale: "en", timezone: "UTC" }));
    expect(response.status).toBe(201);
    expect(response.headers.get("x-request-id")).toBe("request-123");
    expect(await body(response)).toEqual({ success: true, data: { id: "customer-1" } });
    expect(mocks.createCustomer.execute).toHaveBeenCalledWith({ displayName: "Ada", locale: "en", timezone: "UTC" });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("\"requestId\":\"request-123\""));
  });

  it("POST /customers maps transport validation failures without calling the use case", async () => {
    const response = await createCustomerRoute(jsonRequest("/customers", { displayName: "" }));
    expect(response.status).toBe(400);
    expect(await body(response)).toMatchObject({ success: false, error: { code: "VALIDATION_ERROR" } });
    expect(mocks.createCustomer.execute).not.toHaveBeenCalled();
  });

  it("POST /cards calls CreateCard and returns the standard envelope", async () => {
    mocks.createCard.execute.mockResolvedValue({ id: "card-1" });
    const response = await createCardRoute(jsonRequest("/cards", { customerId: "3d594650-c44b-4f60-8c9a-c0f44f57615d", slug: "ada", name: "Ada", fullName: "Ada" }));
    expect(response.status).toBe(201);
    expect(await body(response)).toEqual({ success: true, data: { id: "card-1" } });
  });

  it("POST /access/verify and POST /editor/session call only their composed use cases", async () => {
    mocks.verifyAccessCode.execute.mockResolvedValue({ accessCodeId: "code-1", cardId: "card-1" });
    mocks.createEditorSession.execute.mockResolvedValue({ session: { id: "session-1" }, token: "one-time-token" });
    const verifyResponse = await verifyRoute(jsonRequest("/access/verify", { code: "OI-01234-56789-ABCDE-FGHJK-MNPQRS" }));
    const sessionResponse = await createSessionRoute(jsonRequest("/editor/session", { code: "OI-01234-56789-ABCDE-FGHJK-MNPQRS", lifetimeSeconds: 3600 }));
    expect(verifyResponse.status).toBe(200);
    expect(sessionResponse.status).toBe(201);
    expect(mocks.verifyAccessCode.execute).toHaveBeenCalledWith({ code: "0123456789ABCDEFGHJKMNPQRS" });
    expect(mocks.createEditorSession.execute).toHaveBeenCalledWith({ code: "0123456789ABCDEFGHJKMNPQRS", lifetimeSeconds: 3600 });
  });

  it("GET /card/[slug] returns cache-friendly PublicCardDTO envelope", async () => {
    mocks.readPublicCard.execute.mockResolvedValue({ id: "card-1", slug: "ada", buttons: [], socialLinks: [] });
    const response = await publicCardRoute(new Request("https://oi.test/card/ada", { headers: { "x-request-id": "public-1" } }), { params: Promise.resolve({ slug: "ada" }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("s-maxage=300");
    expect(response.headers.get("cdn-cache-control")).toContain("stale-while-revalidate=86400");
    expect(response.headers.get("cloudflare-cdn-cache-control")).toContain("max-age=300");
    expect(await body(response)).toEqual({ success: true, data: { id: "card-1", slug: "ada", buttons: [], socialLinks: [] } });
    expect(mocks.readPublicCard.execute).toHaveBeenCalledWith({ slug: "ada" });
  });

  it("maps domain errors to HTTP and disables caching for failures", async () => {
    mocks.readPublicCard.execute.mockRejectedValue(new NotFoundError("Card", "missing"));
    const response = await publicCardRoute(new Request("https://oi.test/card/missing"), { params: Promise.resolve({ slug: "missing" }) });
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await body(response)).toMatchObject({ success: false, error: { code: "NOT_FOUND" } });
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });
});
