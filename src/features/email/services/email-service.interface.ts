/** Result of a successful email send. */
export interface SendResult {
  providerMessageId: string;
  provider: string;
}

/** A ready-to-send email message with both HTML and plain-text content. */
export interface EmailEnvelope {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Context passed to template renderers. */
export type TemplateContext = Record<string, unknown>;

/** Status of the email provider configuration. */
export interface HealthCheckResult {
  ok: boolean;
  provider: string;
  message: string;
}

/**
 * Application-level email service.
 *
 * The rest of the application depends ONLY on this interface.
 * Provider-specific logic (Resend, SMTP, console, etc.) lives behind it.
 */
export interface EmailService {
  /** Send a raw email envelope. */
  send(envelope: EmailEnvelope, idempotencyKey: string): Promise<SendResult>;

  /** Render a named template and send it. */
  sendTemplate(
    template: string,
    context: TemplateContext,
    to: string,
    idempotencyKey: string,
  ): Promise<SendResult>;

  /** Verify the provider is correctly configured and reachable. */
  healthCheck(): Promise<HealthCheckResult>;
}
