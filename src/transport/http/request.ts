import type { z } from "zod";
import { ValidationError } from "@/lib/errors";

export async function parseJsonBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Request body must contain valid JSON");
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError("Request validation failed", { fields: result.error.flatten().fieldErrors });
  }
  return result.data;
}
export function parseRouteParams<T>(params: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new ValidationError("Route parameter validation failed", { fields: result.error.flatten().fieldErrors });
  }
  return result.data;
}
