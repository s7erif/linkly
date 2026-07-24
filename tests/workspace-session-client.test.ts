import { beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({ loadWorkspaceCard: vi.fn(), loadAdminWorkspaceCard: vi.fn() }));
vi.mock("@/features/appearance/actions", () => ({ loadWorkspaceCard: actionMocks.loadWorkspaceCard, loadAdminWorkspaceCard: actionMocks.loadAdminWorkspaceCard }));
import { editorSessionKey, establishEditorSession, fetchWorkspaceCard, getEditorSessionToken, getWorkspaceCardId, hasReusableEditorSession, storeEditorSession, rememberAdminWorkspaceCard, updateWorkspaceAppearance, updateWorkspaceProfile } from "@/features/appearance/workspace-session-client";
import type { AppearanceSettings } from "@/types/appearance";

const CARD_ID = "00000000-0000-4000-8000-000000000001";
const TOKEN = "a".repeat(64);
const profile = { fullName: "OI User", headline: null, company: null, bio: null, email: null, phone: null, website: null, address: null, countryCode: null };
const appearance: AppearanceSettings = { colors: { primary: "#000000", accent: "#111111", text: "#222222", mutedText: "#333333" }, background: { style: "SOLID", color: "#ffffff", gradientFrom: "#ffffff", gradientTo: "#eeeeee" }, typography: "SANS", buttonStyle: "SOLID", borderRadius: 16, shadow: "MEDIUM", sections: { profile: true, bio: true, contact: true, buttons: true, socialLinks: true } };

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, clear: () => values.clear(), getItem: key => values.get(key) ?? null, key: index => [...values.keys()][index] ?? null, removeItem: key => { values.delete(key); }, setItem: (key, value) => { values.set(key, value); } };
}

beforeEach(() => { vi.restoreAllMocks(); actionMocks.loadWorkspaceCard.mockReset(); actionMocks.loadAdminWorkspaceCard.mockReset(); Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: memoryStorage() }); });

describe("workspace editor session client", () => {
  it("creates and stores one card-scoped session, then reuses it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { session: { cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000).toISOString() }, token: TOKEN } }), { status: 201, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    await establishEditorSession(CARD_ID, "OI-01234-56789-ABCDE-FGHJK-MNPQRS");
    await establishEditorSession(CARD_ID, "OI-01234-56789-ABCDE-FGHJK-MNPQRS");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(hasReusableEditorSession(CARD_ID)).toBe(true);
    expect(getEditorSessionToken(CARD_ID)).toBe(TOKEN);
    expect(sessionStorage.getItem(editorSessionKey(CARD_ID))).not.toContain("OI-01234");
  });


  it("loads a draft private Order card through its stored editor session instead of the public slug reader", async () => {
    const slug = "sherif-osman-49486b01";
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const card = { id:CARD_ID, themeId:null, slug, name:"Sherif Osman Card", status:"DRAFT", visibility:"PRIVATE", publishedAt:null, profile, createdAt:new Date(), updatedAt:new Date(), appearance, buttons:[], socialLinks:[] };
    storeEditorSession(CARD_ID, TOKEN, expiresAt, slug);
    actionMocks.loadWorkspaceCard.mockResolvedValue({ ok:true, card });
    await expect(fetchWorkspaceCard(slug)).resolves.toEqual(card);
    expect(getWorkspaceCardId(slug)).toBe(CARD_ID);
    expect(actionMocks.loadWorkspaceCard).toHaveBeenCalledWith(CARD_ID, TOKEN);
  });

  it("injects the stored token into both existing update requests", async () => {
    sessionStorage.setItem(editorSessionKey(CARD_ID), JSON.stringify({ token: TOKEN, expiresAt: new Date(Date.now() + 60_000).toISOString() }));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: {} }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await Promise.all([updateWorkspaceProfile(CARD_ID, profile), updateWorkspaceAppearance(CARD_ID, appearance)]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [, init] of fetchMock.mock.calls) expect(JSON.parse(String(init.body)).sessionToken).toBe(TOKEN);
  });

  it("uses the Admin session branch without creating or reading a customer EditorSession", async () => {
    const slug = "admin-card";
    const card = { id:CARD_ID, themeId:null, slug, name:"Admin Card", status:"DRAFT", visibility:"PRIVATE", publishedAt:null, profile, createdAt:new Date(), updatedAt:new Date(), appearance, buttons:[], socialLinks:[] };
    rememberAdminWorkspaceCard(slug, CARD_ID);
    actionMocks.loadAdminWorkspaceCard.mockResolvedValue({ ok:true, card });
    await expect(fetchWorkspaceCard(slug)).resolves.toEqual(card);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success:true, data:{} }), { status:200 }));
    vi.stubGlobal("fetch", fetchMock);
    await updateWorkspaceProfile(CARD_ID, profile);
    expect(actionMocks.loadWorkspaceCard).not.toHaveBeenCalled();
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).sessionToken).toBe("0".repeat(64));
    expect(sessionStorage.getItem(editorSessionKey(CARD_ID))).toBeNull();
  });

  it("removes an expired stored session", () => {
    sessionStorage.setItem(editorSessionKey(CARD_ID), JSON.stringify({ token: TOKEN, expiresAt: new Date(Date.now() - 1_000).toISOString() }));
    expect(hasReusableEditorSession(CARD_ID)).toBe(false);
    expect(sessionStorage.getItem(editorSessionKey(CARD_ID))).toBeNull();
  });

  it("rejects a session issued for another card", async () => {
    const otherCard = "00000000-0000-4000-8000-000000000002";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { session: { cardId: otherCard, expiresAt: new Date(Date.now() + 60_000).toISOString() }, token: TOKEN } }), { status: 201 })));
    await expect(establishEditorSession(CARD_ID, "OI-01234-56789-ABCDE-FGHJK-MNPQRS")).rejects.toMatchObject({ status: 403 });
    expect(sessionStorage.getItem(editorSessionKey(CARD_ID))).toBeNull();
  });
});
