import { describe, expect, it } from "vitest";
import {
  resolveRendererLayout,
  toCardRendererProps,
} from "@/components/card-renderer";
import type { PublicCardDTO } from "@/dto";
import { defaultAppearanceSettings } from "@/validation/appearance";

const now = new Date("2026-07-26T12:00:00.000Z");

function publicCard(): PublicCardDTO {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "ada",
    name: "Ada",
    status: "PUBLISHED",
    visibility: "PUBLIC",
    publishedAt: now,
    seoTitle: null,
    seoDescription: null,
    profile: {
      fullName: "Ada Lovelace",
      headline: "Engineer",
      company: "Analytical Engines",
      bio: "Computing pioneer",
      email: "ada@example.com",
      phone: null,
      website: null,
      address: "London",
      countryCode: "GB",
    },
    avatarUrl: "https://cdn.example.com/ada.webp",
    appearance: {
      ...defaultAppearanceSettings,
      sections: {
        ...defaultAppearanceSettings.sections,
        socialLinks: false,
      },
      layout: {
        alignment: "LEFT",
        width: "WIDE",
        spacing: "SPACIOUS",
        position: "FLOATING",
        container: "GLASS_CARD",
      },
    },
    buttons: [
      {
        id: "button-1",
        label: "Portfolio",
        url: "https://example.com",
        position: 0,
        type: "WEBSITE",
        displayMode: "ICON",
        color: "#123456",
      },
    ],
    socialLinks: [
      {
        id: "social-1",
        platform: "linkedin",
        label: "LinkedIn",
        url: "https://linkedin.com/in/ada",
        position: 0,
      },
    ],
    blocks: [
      {
        id: "about",
        kind: "ABOUT",
        position: 0,
        isEnabled: true,
        config: {},
        mediaIds: [],
      },
      {
        id: "hero",
        kind: "HERO",
        position: 1,
        isEnabled: true,
        config: {},
        mediaIds: [],
      },
      {
        id: "hidden-gallery",
        kind: "GALLERY",
        position: 2,
        isEnabled: false,
        config: {},
        mediaIds: [],
      },
      {
        id: "buttons",
        kind: "CTA_BUTTONS",
        position: 3,
        isEnabled: true,
        config: {},
        mediaIds: [],
      },
      {
        id: "social",
        kind: "SOCIAL_LINKS",
        position: 4,
        isEnabled: true,
        config: {},
        mediaIds: [],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

describe("shared card renderer model", () => {
  it("maps public data to the same renderer contract used by Workspace", () => {
    const props = toCardRendererProps(publicCard());

    expect(props.avatarUrl).toBe("https://cdn.example.com/ada.webp");
    expect(props.data.buttons).toEqual([
      expect.objectContaining({
        type: "WEBSITE",
        displayMode: "ICON",
        color: "#123456",
      }),
    ]);
    expect(props.layout?.sectionOrder).toEqual([
      "bio",
      "header",
      "buttons",
      "socialLinks",
      "footer",
    ]);
    expect(props.layout).toEqual(
      expect.objectContaining({
        alignment: "LEFT",
        width: "WIDE",
        spacing: "SPACIOUS",
        position: "FLOATING",
        container: "GLASS_CARD",
        showSocialLinks: false,
      }),
    );
  });

  it("derives all renderer visibility from the persisted appearance document", () => {
    const appearance = {
      ...defaultAppearanceSettings,
      sections: {
        profile: false,
        bio: false,
        contact: false,
        buttons: false,
        socialLinks: false,
      },
    };

    expect(resolveRendererLayout(appearance)).toEqual(
      expect.objectContaining({
        showHeader: false,
        showBio: false,
        showButtons: false,
        showSocialLinks: false,
      }),
    );
  });
});
