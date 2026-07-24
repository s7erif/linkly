import type { EmailTemplate } from "../services/template-engine";
import { baseHtml, baseText, type BaseContext } from "./base";

export const subscriptionRenewedTemplate: EmailTemplate = (ctx) => {
  const c = ctx as unknown as { planName: string; nextBillingDate: string } & BaseContext;
  const body = `<h1>Subscription renewed</h1>
<p>Your <strong>${c.planName}</strong> plan has been renewed. Next billing date: ${c.nextBillingDate}.</p>`;
  return {
    subject: `Your ${c.planName} subscription has been renewed`,
    html: baseHtml(body, c as unknown as BaseContext),
    text: baseText(`Your ${c.planName} plan has been renewed. Next billing: ${c.nextBillingDate}.`, c as unknown as BaseContext),
  };
};
