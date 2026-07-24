import { describe, expect, it } from "vitest";
import { first, pageHref, type SearchRecord } from "@/features/admin/admin-query";

describe("Admin runtime query normalization", () => {
  it("normalizes absent and blank query values before strict validation", () => {
    expect(first(undefined)).toBeUndefined();
    expect(first(null)).toBeUndefined();
    expect(first("")).toBeUndefined();
    expect(first("   ")).toBeUndefined();
    expect(first(["", "PENDING"])).toBeUndefined();
  });

  it("preserves valid enum, date, pagination, filter, and sorting values", () => {
    expect(first("PENDING")).toBe("PENDING");
    expect(first("2026-07-21")).toBe("2026-07-21");
    expect(first("2")).toBe("2");
    expect(first("customerName")).toBe("customerName");
    expect(first(["asc", "desc"])).toBe("asc");
  });

  it("omits empty filters while retaining valid deep-link state", () => {
    const params: SearchRecord = {
      search: "",
      status: "PENDING",
      from: null,
      sortDirection: "asc",
      page: "4",
    };

    expect(pageHref("/admin/orders", params, 2)).toBe(
      "/admin/orders?status=PENDING&sortDirection=asc&page=2",
    );
  });
});
