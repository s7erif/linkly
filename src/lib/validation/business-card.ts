import { z } from "zod";
import { emailValidator, phoneValidator, urlValidator } from "./common";
import { CONSTANTS } from "../constants";

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
});

export const businessCardUpdateSchema = businessCardSchema.partial();
