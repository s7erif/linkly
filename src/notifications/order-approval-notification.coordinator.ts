import type { ApprovedOrderDTO } from "@/dto/order.dto";
import type { ApproveOrder } from "@/use-cases/approve-order";
import type { Logger } from "@/lib/logger";
import type { NotificationService } from "./notification.service";

export class OrderApprovalNotificationCoordinator {
  constructor(
    private readonly approveOrder: ApproveOrder,
    private readonly notifications: NotificationService,
    private readonly logger: Logger,
  ) {}
  async execute(input: { orderId: string }): Promise<ApprovedOrderDTO> {
    const result = await this.approveOrder.execute(input);
    for (const [index, card] of result.cards.entries()) {
      const issued = result.issuedAccessCodes[index];
      if (!issued) {
        this.logger.error(
          "Approved card has no corresponding access code",
          undefined,
          { orderId: result.order.id, cardId: card.id },
        );
        continue;
      }
      try {
        await this.notifications.sendWelcome({
          orderId: result.order.id,
          customerId: result.customer.id,
          cardId: card.id,
          customerName: result.customer.displayName,
          recipient: result.order.email,
          slug: card.slug,
          accessCode: issued.code,
        });
      } catch (error) {
        this.logger.error(
          "Notification persistence failed after order approval",
          error,
          { orderId: result.order.id, cardId: card.id },
        );
      }
    }
    return result;
  }
}
