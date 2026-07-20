import { z } from "zod";
export const uuidSchema = z.uuid();
export const slugSchema = z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const nullableEmailSchema = z.email().max(254).nullable().optional();
export const nullableUrlSchema = z.url().max(2048).nullable().optional();
