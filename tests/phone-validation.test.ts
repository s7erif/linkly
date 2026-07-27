import { describe, expect, it } from "vitest";
import { normalizePhoneForUrl, isPlausiblePhone } from "@/lib/phone";
import { createCardButtonSchema } from "@/validation/card-builder";

const cardId = "0915a8e0-60eb-4cfc-b6dc-adcb01dd249a";
const token = "a".repeat(64);

// ── Phone normalisation utility ──────────────────────────────────────

describe("normalizePhoneForUrl", () => {
  describe("valid phone numbers", () => {
    const validCases: [string, string][] = [
      // Egyptian local numbers — prepend +20
      ["01153914912", "tel:+201153914912"],
      // Already E.164 with +
      ["+201153914912", "tel:+201153914912"],
      // Digits without + — prepend +
      ["201153914912", "tel:+201153914912"],
      // E.164 with spaces
      ["+44 20 1234 5678", "tel:+442012345678"],
      // US number with parentheses and dashes
      ["+1 (555) 123-4567", "tel:+15551234567"],
      // Number with dots
      ["+1.555.123.4567", "tel:+15551234567"],
      // Saudi number
      ["+966501234567", "tel:+966501234567"],
      // Egyptian number with leading 0 (non-01)
      ["0201153914912", "tel:+201153914912"],
    ];

    for (const [input, expected] of validCases) {
      it(`normalises "${input}" → "${expected}"`, () => {
        expect(normalizePhoneForUrl(input)).toBe(expected);
      });
    }
  });

  describe("rejects invalid inputs", () => {
    const invalidInputs = [
      "abc",
      "123",
      "++++",
      "javascript:alert(1)",
      "http://example.com",
      "https://evil.com",
      "mailto:test@test.com",
      "ftp://files.com",
      "<script>alert(1)</script>",
      "+", // too short
      "", // empty
      "   ", // whitespace only
    ];

    for (const input of invalidInputs) {
      it(`rejects "${input}"`, () => {
        expect(normalizePhoneForUrl(input)).toBeNull();
      });
    }
  });
});

describe("isPlausiblePhone", () => {
  it("returns true for valid phone numbers", () => {
    expect(isPlausiblePhone("+201153914912")).toBe(true);
    expect(isPlausiblePhone("01153914912")).toBe(true);
    expect(isPlausiblePhone("+1 (555) 123-4567")).toBe(true);
  });

  it("returns false for junk", () => {
    expect(isPlausiblePhone("abc")).toBe(false);
    expect(isPlausiblePhone("123")).toBe(false);
    expect(isPlausiblePhone("http://example.com")).toBe(false);
  });
});

// ── Server-side card-button schema ───────────────────────────────────

describe("createCardButtonSchema — phone URLs", () => {
  const base = {
    cardId,
    sessionToken: token,
    id: "11111111-1111-4111-8111-111111111111",
    label: "Call Me",
    isVisible: true,
  };

  describe("accepts valid phone formats", () => {
    const validPhones = [
      "tel:+201153914912",
      "tel:+442012345678",
      "tel:+15551234567",
      "tel:+966501234567",
    ];

    for (const phoneUrl of validPhones) {
      it(`accepts "${phoneUrl}"`, () => {
        const result = createCardButtonSchema.safeParse({
          ...base,
          url: phoneUrl,
        });
        expect(result.success).toBe(true);
      });
    }
  });

  describe("normalises formatted phone numbers in tel: URLs", () => {
    it("normalises tel: URL with spaces", () => {
      const result = createCardButtonSchema.safeParse({
        ...base,
        url: "tel:+1 555 123 4567",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe("tel:+15551234567");
      }
    });

    it("normalises tel: URL with dashes and parentheses", () => {
      const result = createCardButtonSchema.safeParse({
        ...base,
        url: "tel:+1 (555) 123-4567",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe("tel:+15551234567");
      }
    });

    it("normalises raw Egyptian number to tel: URL", () => {
      const result = createCardButtonSchema.safeParse({
        ...base,
        url: "01153914912",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe("tel:+201153914912");
      }
    });
  });

  describe("rejects dangerous inputs", () => {
    const dangerous = [
      "javascript:alert(1)",
      "abc",
      "123",
      "data:text/html,<script>alert(1)</script>",
      "file:///etc/passwd",
    ];

    for (const url of dangerous) {
      it(`rejects "${url}"`, () => {
        const result = createCardButtonSchema.safeParse({
          ...base,
          url,
        });
        expect(result.success).toBe(false);
      });
    }
  });
});
