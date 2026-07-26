import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CardProfileDTO, WorkspaceCardDTO } from "@/dto";
import { useCardEditorStore, type EditorButton, type EditorSocialLink } from "@/store/use-card-editor-store";
import { defaultAppearanceSettings } from "@/validation/appearance";

vi.mock("@/features/appearance/workspace-session-client", () => ({
  getEditorSessionToken: () => null,
}));

const cardId = "20b71e7d-75b2-479b-99f7-bfaba3a263ce";
const buttonId = "872a294a-5de6-47ac-95e2-4af9b32a79bb";
const socialId = "b49bdfb4-26aa-4eaa-a021-a6c09ef88654";
const profile: CardProfileDTO = {
  fullName: "Ada Lovelace",
  headline: "Engineer",
  company: null,
  bio: null,
  email: "ada@example.com",
  phone: null,
  website: null,
  address: null,
  countryCode: null,
};
const button: EditorButton = {
  id: buttonId,
  type: "WEBSITE",
  label: "Website",
  url: "https://example.com",
  position: 0,
  isVisible: true,
  displayMode: "BUTTON",
  color: null,
  openInNewTab: true,
  analyticsEnabled: true,
};
const social: EditorSocialLink = {
  id: socialId,
  platform: "LINKEDIN",
  label: "LinkedIn",
  url: "https://linkedin.com/in/ada",
  position: 0,
  isVisible: true,
};

function hydrate() {
  useCardEditorStore.getState().hydrate({
    card: { id: cardId, slug: "ada", avatarUrl: "data:image/png;base64,legacy" } as WorkspaceCardDTO,
    appearance: defaultAppearanceSettings,
    profile,
    editorButtons: [button],
    editorSocialLinks: [social],
    cardId,
    slug: "ada",
    editorToken: null,
    editorExpiresAt: null,
  });
}

beforeEach(() => {
  useCardEditorStore.getState().reset();
  vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 200 })));
  hydrate();
});

describe("card editor autosave request reduction", () => {
  it("sends no requests when hydrated data has not changed", async () => {
    await useCardEditorStore.getState().saveCard();
    expect(fetch).not.toHaveBeenCalled();
    expect(useCardEditorStore.getState().saveState).toBe("saved");
  });

  it("sends only the changed profile resource", async () => {
    useCardEditorStore.getState().setProfileField("headline", "Programmer");
    await useCardEditorStore.getState().saveCard();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
      `/cards/${cardId}/profile?save=true`,
    );
  });

  it("sends only the changed button instead of every editor resource", async () => {
    useCardEditorStore.getState().updateButton(buttonId, { label: "Portfolio" });
    await useCardEditorStore.getState().saveCard();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
      `/cards/${cardId}/buttons/${buttonId}?save=true`,
    );
    expect(useCardEditorStore.getState().dirtyButtonIds.size).toBe(0);
  });

  it("applies confirmed slug and publication responses without creating unsaved editor state", () => {
    useCardEditorStore.getState().setAvailableCards([{ id: cardId, name: "Ada", slug: "ada" }]);
    useCardEditorStore.getState().applySlug("ada-live");

    expect(useCardEditorStore.getState()).toMatchObject({ slug: "ada-live", saveState: "saved" });
    expect(useCardEditorStore.getState().availableCards[0].slug).toBe("ada-live");

    const current = useCardEditorStore.getState().card!;
    useCardEditorStore.getState().applyServerCard({
      ...current,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      publishedAt: new Date("2026-07-26T15:00:00.000Z"),
    });
    expect(useCardEditorStore.getState().card).toMatchObject({ status: "PUBLISHED", visibility: "PUBLIC" });
    expect(useCardEditorStore.getState().saveState).toBe("saved");
  });
});
