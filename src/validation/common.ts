import { z } from "zod";
import { RESERVED_SLUGS } from "@/lib/slug-generator";
export const uuidSchema = z.uuid();
export const slugSchema = z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).refine((v) => !RESERVED_SLUGS.has(v), "This slug is reserved");
export const nullableEmailSchema = z.email().max(254).nullable().optional();
export const nullableUrlSchema = z.url().max(2048).nullable().optional();
