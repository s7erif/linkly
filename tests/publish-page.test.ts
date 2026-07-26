import { beforeAll, describe, expect, it, vi } from "vitest";

const qrMocks = vi.hoisted(() => ({
  toDataURL: vi.fn(async () => "data:image/png;base64,qr"),
  toString: vi.fn(async () => "<svg>qr</svg>"),
}));

vi.mock("qrcode/lib/browser", () => ({ default: qrMocks }));

import { createQRCodeAssets } from "@/components/workspace/publish/public-qr-code";
import { resolvePublishAction } from "@/components/workspace/publish/publish-state";
import { buildProfileUrl } from "@/lib/public-links";
import { slugSchema } from "@/validation/common";

describe("Workspace Publish review contracts", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://domain.test/";
  });

  it("uses the existing canonical /@username URL", () => {
    expect(buildProfileUrl("@ada-lovelace")).toBe("https://domain.test/@ada-lovelace");
  });

  it("reuses the shared slug validator for syntax and reserved routes", () => {
    expect(slugSchema.safeParse("ada-lovelace").success).toBe(true);
    expect(slugSchema.safeParse("admin").success).toBe(false);
    expect(slugSchema.safeParse("Ada Lovelace").success).toBe(false);
  });

  it("delegates PNG and SVG generation to the installed QR package", async () => {
    await expect(createQRCodeAssets("https://domain.test/@ada", 220)).resolves.toEqual({
      pngDataUrl: "data:image/png;base64,qr",
      svg: "<svg>qr</svg>",
      value: "https://domain.test/@ada",
    });
    expect(qrMocks.toDataURL).toHaveBeenCalledWith("https://domain.test/@ada", expect.objectContaining({ width: 220 }));
    expect(qrMocks.toString).toHaveBeenCalledWith("https://domain.test/@ada", expect.objectContaining({ type: "svg", width: 220 }));
  });

  it("preserves publication semantics and exposes save-only live updates", () => {
    expect(resolvePublishAction({ status: "DRAFT", saveState: "saved", usernameReady: true, hasValidationErrors: false, operationPending: false })).toEqual({ disabled: false, kind: "PUBLISH", label: "Publish" });
    expect(resolvePublishAction({ status: "PUBLISHED", saveState: "dirty", usernameReady: true, hasValidationErrors: false, operationPending: false })).toEqual({ disabled: false, kind: "UPDATE", label: "Update Live Card" });
    expect(resolvePublishAction({ status: "PUBLISHED", saveState: "saved", usernameReady: true, hasValidationErrors: false, operationPending: false })).toEqual({ disabled: true, kind: "NONE", label: "No unpublished changes" });
    expect(resolvePublishAction({ status: "DRAFT", saveState: "dirty", usernameReady: true, hasValidationErrors: false, operationPending: false })).toEqual({ disabled: true, kind: "NONE", label: "Waiting for autosave" });
  });
});
