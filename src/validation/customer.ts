import { z } from "zod";
import { nullableEmailSchema, uuidSchema } from "./common";
export const customerIdSchema = uuidSchema;
export const createCustomerSchema = z.object({
  displayName: z.string().trim().min(1).max(160),
  email: nullableEmailSchema,
  phone: z.string().trim().max(40).nullable().optional(),
  locale: z.string().trim().min(2).max(16).default("en"),
  timezone: z.string().trim().min(1).max(64).default("UTC"),
});
export const updateCustomerSchema = createCustomerSchema.partial().extend({ status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]).optional() });
export type CreateCustomerInput = z.input<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.input<typeof updateCustomerSchema>;
