import { z } from "zod";
import { nullableEmailSchema, nullableUrlSchema, slugSchema, uuidSchema } from "./common";
export const cardIdSchema = uuidSchema;
export const createCardSchema = z.object({
  customerId: uuidSchema,
  slug: slugSchema,
  name: z.string().trim().min(1).max(120),
  fullName: z.string().trim().min(1).max(160),
});
export const updateCardSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: slugSchema.optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
  profile: z.object({
    fullName: z.string().trim().min(1).max(160).optional(),
    headline: z.string().trim().max(160).nullable().optional(),
    company: z.string().trim().max(160).nullable().optional(),
    bio: z.string().trim().max(2000).nullable().optional(),
    email: nullableEmailSchema,
    phone: z.string().trim().max(40).nullable().optional(),
    website: nullableUrlSchema,
  }).optional(),
});
export type CreateCardInput = z.input<typeof createCardSchema>;
export type UpdateCardInput = z.input<typeof updateCardSchema>;
