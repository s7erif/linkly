import type { EmailTemplate } from "../services/template-engine";
import { baseHtml, baseText, type BaseContext } from "./base";

export const paymentSuccessfulTemplate: EmailTemplate = (ctx) => {
  const c = ctx as unknown as { planName: string; amount: string; invoiceUrl: string } & BaseContext;
  const body = `<h1>Payment successful</h1>
<p>We received your payment of <strong>${c.amount}</strong> for the <strong>${c.planName}</strong> plan.</p>
<a href="${c.invoiceUrl}" class="btn">View Invoice</a>`;
  return {
    subject: `Payment received — ${c.amount}`,
    html: baseHtml(body, c as unknown as BaseContext),
    text: baseText(`Payment of ${c.amount} for ${c.planName} received. Invoice: ${c.invoiceUrl}`, c as unknown as BaseContext),
  };
};
