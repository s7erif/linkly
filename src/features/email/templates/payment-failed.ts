import type { EmailTemplate } from "../services/template-engine";
import { baseHtml, baseText, type BaseContext } from "./base";

export const paymentFailedTemplate: EmailTemplate = (ctx) => {
  const c = ctx as unknown as { planName: string; retryUrl: string } & BaseContext;
  const body = `<h1>Payment unsuccessful</h1>
<p>We were unable to process your payment for the <strong>${c.planName}</strong> plan. No action has been taken on your account.</p>
<a href="${c.retryUrl}" class="btn">Update Payment Method</a>`;
  return {
    subject: `Payment unsuccessful — ${c.planName}`,
    html: baseHtml(body, c as unknown as BaseContext),
    text: baseText(`Payment for ${c.planName} was unsuccessful. Update payment: ${c.retryUrl}`, c as unknown as BaseContext),
  };
};
