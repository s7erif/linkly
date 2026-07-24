import type { Logger } from "@/lib/logger";
import type {
  EmailProvider,
  NotificationRecord,
  NotificationRepository,
} from "./contracts";
import { EmailProviderError } from "./resend-email.provider";
import { welcomeEmail } from "./templates";
import { buildProfileUrl, buildWorkspaceUrl } from "@/lib/public-links";

export interface SendWelcomeInput {
  orderId: string;
  customerId: string;
  cardId: string;
  customerName: string;
  recipient: string;
  slug: string;
  accessCode: string;
}

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly emailProvider: EmailProvider,
    private readonly logger: Logger,
    private readonly config: { from: string },
    private readonly clock: () => Date = () => new Date(),
  ) {}
  async sendWelcome(input: SendWelcomeInput): Promise<NotificationRecord> {
    const idempotencyKey = `welcome/${input.orderId}/${input.cardId}`;
    const delivery = await this.repository.getOrCreate({
      orderId: input.orderId,
      customerId: input.customerId,
      cardId: input.cardId,
      channel: "EMAIL",
      template: "WELCOME",
      recipient: input.recipient,
      provider: this.emailProvider.name,
      idempotencyKey,
    });
    if (!(await this.repository.claimFirstAttempt(delivery.id, this.clock())))
      return delivery;
    try {
      const message = welcomeEmail({
        from: this.config.from,
        to: input.recipient,
        customerName: input.customerName,
        publicUrl: buildProfileUrl(input.slug),
        workspaceUrl: buildWorkspaceUrl(input.slug),
        accessCode: input.accessCode,
      });
      const sent = await this.emailProvider.send(message, { idempotencyKey });
      return await this.repository.markSent(
        delivery.id,
        sent.providerMessageId,
        this.clock(),
      );
    } catch (error) {
      const code =
        error instanceof EmailProviderError ? error.code : "DELIVERY_FAILED";
      const message =
        error instanceof Error
          ? error.message.slice(0, 500)
          : "Unknown email delivery failure";
      this.logger.error("Welcome notification delivery failed", error, {
        orderId: input.orderId,
        cardId: input.cardId,
        recipient: input.recipient,
        notificationId: delivery.id,
      });
      return this.repository.markFailed(delivery.id, code, message);
    }
  }
}
