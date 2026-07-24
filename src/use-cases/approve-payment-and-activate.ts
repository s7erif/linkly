import { ConflictError, NotFoundError } from "@/lib/errors";
import type { PaymentService } from "@/services/payment.service";
import type { ApproveOrder } from "./approve-order";
import type { EventDispatcher } from "@/events/dispatcher";

/** Idempotent application boundary for the single Admin "Approve & Activate" action. */
export class ApprovePaymentAndActivate {
  constructor(private readonly payments: PaymentService, private readonly approveOrder: ApproveOrder, private readonly dispatcher?: EventDispatcher) {}
  async execute(input: { paymentSubmissionId: string; orderId: string; adminId: string }) {
    const submission = await this.payments.find(input.paymentSubmissionId);
    if (!submission) throw new NotFoundError("Payment submission", input.paymentSubmissionId);
    if (submission.status === "REJECTED") throw new ConflictError("A rejected payment cannot be activated");
    if (submission.status === "APPROVED") return { alreadyProcessed: true, submission, orderId: input.orderId } as const;
    const approved = await this.payments.approve(input.paymentSubmissionId, input.adminId);
    const fulfillment = await this.approveOrder.execute({ orderId: input.orderId });
    if (this.dispatcher) await this.dispatcher.publish({ type:"PaymentApproved", paymentSubmissionId:input.paymentSubmissionId, orderId:input.orderId, customerId:fulfillment.customer.id, adminId:input.adminId, occurredAt:new Date() });
    return { alreadyProcessed: false, submission: approved, fulfillment } as const;
  }
}
