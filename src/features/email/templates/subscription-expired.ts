import type { EmailTemplate } from "../services/template-engine";
import { baseHtml, baseText, type BaseContext } from "./base";

export const subscriptionExpiredTemplate: EmailTemplate = (ctx) => {
  const c = ctx as unknown as { planName: string; renewUrl: string } & BaseContext;
  const body = `<h1>Subscription expired</h1>
<p>Your <strong>${c.planName}</strong> plan has expired. Some features may be limited until you renew.</p>
<a href="${c.renewUrl}" class="btn">Renew Subscription</a>`;
  return {
    subject: `Your ${c.planName} subscription has expired`,
    html: baseHtml(body, c as unknown as BaseContext),
    text: baseText(`Your ${c.planName} plan has expired. Renew: ${c.renewUrl}`, c as unknown as BaseContext),
  };
};
