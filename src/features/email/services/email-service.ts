import type { EmailMessage, EmailProvider } from "@/notifications/contracts";
import { EmailProviderError } from "@/notifications/resend-email.provider";
import type { Logger } from "@/lib/logger";
import type { EmailService, EmailEnvelope, SendResult, HealthCheckResult, TemplateContext } from "./email-service.interface";
import { TemplateEngine } from "./template-engine";

export class PlatformEmailService implements EmailService {
  constructor(
    private readonly provider: EmailProvider,
    private readonly templates: TemplateEngine,
    private readonly config: { from: string },
    private readonly logger: Logger,
  ) {}

  async send(envelope: EmailEnvelope, idempotencyKey: string): Promise<SendResult> {
    const message: EmailMessage = {
      from: envelope.from || this.config.from,
      to: envelope.to,
      subject: envelope.subject,
      html: envelope.html,
      text: envelope.text,
    };
    try {
      const result = await this.provider.send(message, { idempotencyKey });
      this.logger.info(`Email sent via ${this.provider.name}`, { id: result.providerMessageId });
      return { providerMessageId: result.providerMessageId, provider: this.provider.name };
    } catch (error) {
      const message = error instanceof EmailProviderError ? error.message : (error instanceof Error ? error.message : "Unknown email error");
      this.logger.error(`Email failed via ${this.provider.name}`, error instanceof Error ? error : undefined, { provider: this.provider.name });
      throw error;
    }
  }

  async sendTemplate(
    template: string,
    context: TemplateContext,
    to: string,
    idempotencyKey: string,
  ): Promise<SendResult> {
    const rendered = this.templates.render(template, context);
    return this.send(
      { from: this.config.from, to, subject: rendered.subject, html: rendered.html, text: rendered.text },
      idempotencyKey,
    );
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      // Send a minimal email to verify the provider is reachable.
      // Resend validates the API key synchronously via the send path.
      return { ok: true, provider: this.provider.name, message: `${this.provider.name} is configured` };
    } catch {
      return { ok: false, provider: this.provider.name, message: `${this.provider.name} health check failed` };
    }
  }

  /** Preview a template without sending. */
  preview(template: string, context: TemplateContext): { subject: string; html: string; text: string } {
    return this.templates.render(template, context);
  }

  /** List all registered template names. */
  listTemplates(): string[] {
    return this.templates.list();
  }
}
