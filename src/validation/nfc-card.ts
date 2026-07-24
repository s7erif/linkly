import { z } from "zod";

const search = z.string().trim().max(160).optional().transform((value) => value || undefined);
export const nfcCardStatusSchema = z.enum(["AVAILABLE", "RESERVED", "ACTIVATED", "DISABLED", "LOST", "ARCHIVED"]);
export const nfcCardQuerySchema = z.object({
  search,
  status: nfcCardStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(100).default(20),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
}).strict();
