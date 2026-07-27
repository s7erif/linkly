import type { z } from "zod";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export function parseUseCaseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      code: issue.code,
      message: issue.message,
      ...(issue.path.length > 0 ? { field: issue.path[issue.path.length - 1] } : {}),
    }));
    logger.warn("usecase.validation.failed", {
      issues,
      input: JSON.stringify(input).slice(0, 500),
    });
    throw new ValidationError("Invalid use-case input", { fields: result.error.flatten().fieldErrors });
  }
  return result.data;
}
export interface Clock { now(): Date; }
export const systemClock: Clock = { now: () => new Date() };
