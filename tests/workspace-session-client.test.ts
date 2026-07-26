import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/appearance/actions", () => ({ loadWorkspaceCard: vi.fn(), loadAdminWorkspaceCard: vi.fn() }));
import { editorSessionKey, getEditorSessionToken, hasReusableEditorSession, storeEditorSession, rememberAdminWorkspaceCard, updateWorkspaceAppearance, updateWorkspaceProfile, workspaceCardKey } from "@/features/appearance/workspace-session-client";
import type { AppearanceSettings } from "@/types/appearance";

const CARD_ID = "00000000-0000-4000-8000-000000000001";
const TOKEN = "a".repeat(64);
const profile = { fullName: "OI User", headline: null, company: null, bio: null, email: null, phone: null, website: null, address: null, countryCode: null };
const appearance: AppearanceSettings = { colors: { primary: "#000000", accent: "#111111", text: "#222222", mutedText: "#333333" }, background: { style: "SOLID", color: "#ffffff", gradientFrom: "#ffffff", gradientTo: "#eeeeee" }, typography: "SANS", buttonStyle: "SOLID", borderRadius: 16, avatarBorderRadius: null, shadow: "MEDIUM", sections: { profile: true, bio: true, contact: true, buttons: true, socialLinks: true }, layout: { alignment: "CENTER", width: "MEDIUM", spacing: "COMFORTABLE", position: "TOP", container: "FLAT" } };

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, clear: () => values.clear(), getItem: key => values.get(key) ?? null, key: index => [...values.keys()][index] ?? null, removeItem: key => { values.delete(key); }, setItem: (key, value) => { values.set(key, value); } };
}

beforeEach(() => { vi.restoreAllMocks(); Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: memoryStorage() }); });

describe("workspace editor session client", () => {
  it("stores a server-issued card-scoped session without retaining access-code plaintext", () => {
    storeEditorSession(CARD_ID, TOKEN, new Date(Date.now() + 60_000).toISOString());
    expect(hasReusableEditorSession(CARD_ID)).toBe(true);
    expect(getEditorSessionToken(CARD_ID)).toBe(TOKEN);
    expect(sessionStorage.getItem(editorSessionKey(CARD_ID))).not.toContain("OI-01234");
  });


  it("stores the server-authorized card-to-slug mapping", () => {
    const slug = "sherif-osman-49486b01";
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    storeEditorSession(CARD_ID, TOKEN, expiresAt, slug);
    expect(sessionStorage.getItem(workspaceCardKey(slug))).toBe(CARD_ID);
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
    rememberAdminWorkspaceCard(slug, CARD_ID);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success:true, data:{} }), { status:200 }));
    vi.stubGlobal("fetch", fetchMock);
    await updateWorkspaceProfile(CARD_ID, profile);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).sessionToken).toBe("0".repeat(64));
    expect(sessionStorage.getItem(editorSessionKey(CARD_ID))).toBeNull();
  });

  it("removes an expired stored session", () => {
    sessionStorage.setItem(editorSessionKey(CARD_ID), JSON.stringify({ token: TOKEN, expiresAt: new Date(Date.now() - 1_000).toISOString() }));
    expect(hasReusableEditorSession(CARD_ID)).toBe(false);
    expect(sessionStorage.getItem(editorSessionKey(CARD_ID))).toBeNull();
  });

  it("rejects malformed server-issued tokens", () => {
    expect(() => storeEditorSession(CARD_ID, "not-a-token", new Date(Date.now() + 60_000).toISOString())).toThrow();
    expect(sessionStorage.getItem(editorSessionKey(CARD_ID))).toBeNull();
  });
});
