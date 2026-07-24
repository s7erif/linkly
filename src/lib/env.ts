import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1),
  ACCESS_CODE_HMAC_KEY: z.string().min(32),
  DIRECT_URL: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1).optional(),
  SUBSCRIPTION_CRON_SECRET: z.string().min(32).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z
    .string()
    .min(3)
    .default("OI Cards <onboarding@resend.dev>"),
});
export type Environment = z.infer<typeof schema>;
let cached: Environment | undefined;
export function getEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): Environment {
  if (cached && source === process.env) return cached;
  const result = schema.safeParse(source);
  if (!result.success)
    throw new Error(
      `Invalid environment configuration: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  if (source === process.env) cached = result.data;
  return result.data;
}
