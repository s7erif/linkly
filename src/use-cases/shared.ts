import type { z } from "zod";
import { ValidationError } from "@/lib/errors";

export function parseUseCaseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Invalid use-case input", { fields: result.error.flatten().fieldErrors });
  }
  return result.data;
}
export interface Clock { now(): Date; }
export const systemClock: Clock = { now: () => new Date() };
