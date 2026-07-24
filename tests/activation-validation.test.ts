import { describe, expect, it } from "vitest";
import { activationRegistrationSchema, activationUsernameSchema, customerRegistrationSchema } from "@/validation/activation";

describe("activation registration validation", () => {
  it("normalizes surrounding whitespace and uppercase username characters", () => {
    expect(activationUsernameSchema.parse("  Sherif-Osman  ")).toBe("sherif-osman");
  });

  it("returns human-readable field messages without exposing raw issue data", () => {
    const result = activationRegistrationSchema.safeParse({ activationToken: "8FK2QM9X", username: "sherif_osman", firstName: "", lastName: "", email: "invalid", phone: "", password: "short", confirmPassword: "different" });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.flatten().fieldErrors;
    expect(fields.username?.[0]).toBe("Username may contain only lowercase letters, numbers and hyphens.");
    expect(fields.firstName?.[0]).toBe("First name is required.");
    expect(fields.lastName?.[0]).toBe("Last name is required.");
    expect(fields.email?.[0]).toBe("Enter a valid email address.");
    expect(fields.password?.[0]).toBe("Password must contain at least 8 characters.");
  });

  it("requires matching password confirmation", () => {
    const result = activationRegistrationSchema.safeParse({ activationToken: "8FK2QM9X", username: "sherif-osman", firstName: "Sherif", lastName: "Osman", email: "sherif@example.com", password: "Secure123", confirmPassword: "Different123" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBe("Passwords do not match.");
  });
  it("validates standalone customer registration", () => {
    const valid = customerRegistrationSchema.parse({ firstName: " Sherif ", lastName: " Osman ", email: " SHERIF@EXAMPLE.COM ", password: "Secure123", confirmPassword: "Secure123" });
    expect(valid).toMatchObject({ firstName: "Sherif", lastName: "Osman", email: "sherif@example.com" });
    const invalid = customerRegistrationSchema.safeParse({ firstName: "", lastName: "", email: "invalid", password: "Secure123", confirmPassword: "Different123" });
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(invalid.error.flatten().fieldErrors.confirmPassword?.[0]).toBe("Passwords do not match.");
  });
});
