import { z } from "zod";
import { uuidSchema } from "./common";
export const accessCodeSchema = z.string().trim().transform((value) => value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().replace(/^OI/, "")).pipe(z.string().length(26));
export const issueAccessCodeSchema = z.object({ cardId: uuidSchema, expiresAt: z.date().min(new Date()).nullable().optional() });
export type IssueAccessCodeInput = z.input<typeof issueAccessCodeSchema>;
