import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  createCustomer: { execute: vi.fn() },
  createCard: { execute: vi.fn() },
  verifyAccessCode: { execute: vi.fn() },
  createEditorSession: { execute: vi.fn() },
  readPublicCard: { execute: vi.fn() },
}));
vi.mock("next-auth/next", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
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
    mocks.getServerSession.mockResolvedValue({ user: { id: "admin-1" } });
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("POST /customers requires activation and preserves the standard error envelope", async () => {
    const response = await createCustomerRoute(jsonRequest("/customers", { displayName: "Ada", locale: "en", timezone: "UTC" }));
    expect(response.status).toBe(409);
    expect(response.headers.get("x-request-id")).toBe("request-123");
    expect(await body(response)).toMatchObject({ success: false, error: { code: "ACTIVATION_REQUIRED" } });
    expect(mocks.createCustomer.execute).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("\"requestId\":\"request-123\""));
  });

  it("POST /customers never creates a customer from legacy request bodies", async () => {
    const response = await createCustomerRoute(jsonRequest("/customers", { displayName: "" }));
    expect(response.status).toBe(409);
    expect(await body(response)).toMatchObject({ success: false, error: { code: "ACTIVATION_REQUIRED" } });
    expect(mocks.createCustomer.execute).not.toHaveBeenCalled();
  });

  it("POST /cards rejects direct creation outside approved Order fulfillment", async () => {
    const response = await createCardRoute(jsonRequest("/cards", { customerId: "3d594650-c44b-4f60-8c9a-c0f44f57615d", slug: "ada", name: "Ada", fullName: "Ada" }));
    expect(response.status).toBe(409);
    expect(await body(response)).toMatchObject({ success: false, error: { code: "CONFLICT", message: "Cards must be created by approving an order" } });
    expect(mocks.createCard.execute).not.toHaveBeenCalled();
  });

  it("POST /customers rejects unauthenticated visitors", async () => {
    mocks.getServerSession.mockResolvedValue(null);
    const response = await createCustomerRoute(jsonRequest("/customers", { displayName: "Ada", locale: "en", timezone: "UTC" }));
    expect(response.status).toBe(401);
    expect(mocks.createCustomer.execute).not.toHaveBeenCalled();
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

  it("GET /card/[slug] returns immediately revalidated PublicCardDTO envelope", async () => {
    mocks.readPublicCard.execute.mockResolvedValue({ id: "card-1", slug: "ada", buttons: [], socialLinks: [] });
    const response = await publicCardRoute(new Request("https://oi.test/card/ada", { headers: { "x-request-id": "public-1" } }), { params: Promise.resolve({ slug: "ada" }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(response.headers.get("cdn-cache-control")).toBe("no-store");
    expect(response.headers.get("cloudflare-cdn-cache-control")).toBe("no-store");
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
