import type { EmailMessage, EmailProvider } from "./contracts";

export class EmailProviderError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "EmailProviderError";
  }
}

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  constructor(
    private readonly apiKey: string | undefined,
    private readonly request: typeof fetch = fetch,
  ) {}

  async send(
    message: EmailMessage,
    options: { idempotencyKey: string },
  ): Promise<{ providerMessageId: string }> {
    if (!this.apiKey)
      throw new EmailProviderError(
        "PROVIDER_NOT_CONFIGURED",
        "Resend is not configured",
      );
    const response = await this.request("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": options.idempotencyKey,
      },
      body: JSON.stringify({
        from: message.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const providerMessage =
        typeof payload === "object" &&
        payload &&
        "message" in payload &&
        typeof payload.message === "string"
          ? payload.message.slice(0, 500)
          : `Resend returned HTTP ${response.status}`;
      throw new EmailProviderError(
        `RESEND_${response.status}`,
        providerMessage,
      );
    }
    if (
      typeof payload !== "object" ||
      !payload ||
      !("id" in payload) ||
      typeof payload.id !== "string"
    ) {
      throw new EmailProviderError(
        "INVALID_PROVIDER_RESPONSE",
        "Resend returned an invalid response",
      );
    }
    return { providerMessageId: payload.id };
  }
}
