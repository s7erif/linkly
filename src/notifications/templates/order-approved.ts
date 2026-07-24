import type { EmailMessage } from "../contracts";
import { emailLayout, escapeHtml } from "./layout";

export function orderApprovedEmail(input: {
  from: string;
  to: string;
  customerName: string;
  orderNumber: string;
}): EmailMessage {
  const content = emailLayout({
    preheader: "Your order has been approved",
    title: "Order approved",
    greeting: `Hello ${input.customerName},`,
    bodyHtml: `<p>Your order <strong>${escapeHtml(input.orderNumber)}</strong> has been approved. We are preparing your OI Card.</p>`,
    bodyText: `Your order ${input.orderNumber} has been approved. We are preparing your OI Card.`,
  });
  return {
    from: input.from,
    to: input.to,
    subject: `Order ${input.orderNumber} approved`,
    ...content,
  };
}
