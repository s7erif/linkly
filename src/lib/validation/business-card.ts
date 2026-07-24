import { z } from "zod";
import { emailValidator, phoneValidator, urlValidator, cuidValidator } from "./common";
import { CONSTANTS } from "../constants";

export const legacySocialLinksObjectSchema = z.record(
  z.string().max(50),
  urlValidator
);

export const businessCardSchema = z.object({
  name: z.string().min(1, "Name is required").max(CONSTANTS.MAX_FIELD_LENGTHS.NAME),
  title: z.string().min(1, "Title is required").max(CONSTANTS.MAX_FIELD_LENGTHS.TITLE),
  company: z.string().min(1, "Company is required").max(CONSTANTS.MAX_FIELD_LENGTHS.COMPANY),
  bio: z.string().max(CONSTANTS.MAX_FIELD_LENGTHS.BIO).nullable().optional(),
  email: emailValidator.nullable().optional(),
  phone: phoneValidator.nullable().optional(),
  website: urlValidator.nullable().optional(),
  address: z.string().max(CONSTANTS.MAX_FIELD_LENGTHS.ADDRESS).nullable().optional(),
  avatar: z.string().nullable().optional(),
  backgroundImage: z.string().nullable().optional(),
  templateId: z.string().default("classic"),
  isActive: z.boolean().default(true),
  socialLinks: z.union([
    legacySocialLinksObjectSchema,
    z.string().refine((val) => {
      try {
        const parsed = JSON.parse(val);
        return legacySocialLinksObjectSchema.safeParse(parsed).success;
      } catch {
        return false;
      }
    }, "Invalid social links JSON format")
  ]).optional().nullable(),
});

export const businessCardCreateSchema = businessCardSchema;

export const businessCardUpdateSchema = businessCardSchema.partial().extend({
  id: cuidValidator,
});

export const cardsQuerySchema = z.object({
  id: cuidValidator.optional(),
});

export const deleteCardQuerySchema = z.object({
  id: cuidValidator,
});

