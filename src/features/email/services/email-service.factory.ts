import { ResendEmailProvider } from "@/notifications/resend-email.provider";
import { createTemplateEngine } from "../templates/registry";
import { PlatformEmailService } from "./email-service";
import type { EmailService } from "./email-service.interface";
import type { Logger } from "@/lib/logger";

export interface EmailServiceConfig {
  apiKey: string | undefined;
  from: string;
  logger: Logger;
}

/**
 * Create the production email service backed by Resend.
 * Returns null if the provider is not configured so callers can handle
 * the missing-configuration case gracefully (e.g., log a warning and skip).
 */
export function createEmailService(config: EmailServiceConfig): EmailService | null {
  if (!config.apiKey) {
    config.logger.warn("Email provider skipped — RESEND_API_KEY not set");
    return null;
  }
  const provider = new ResendEmailProvider(config.apiKey);
  const templates = createTemplateEngine();
  return new PlatformEmailService(provider, templates, { from: config.from }, config.logger);
}
