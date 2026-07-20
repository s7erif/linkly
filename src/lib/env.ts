import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});
export type Environment = z.infer<typeof schema>;
let cached: Environment | undefined;
export function getEnvironment(source: NodeJS.ProcessEnv = process.env): Environment {
  if (cached && source === process.env) return cached;
  const result = schema.safeParse(source);
  if (!result.success) throw new Error(`Invalid environment configuration: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  if (source === process.env) cached = result.data;
  return result.data;
}
