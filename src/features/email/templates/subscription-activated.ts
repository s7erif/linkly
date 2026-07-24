import type { EmailTemplate } from "../services/template-engine";
import { baseHtml, baseText, type BaseContext } from "./base";

export const subscriptionActivatedTemplate: EmailTemplate = (ctx) => {
  const c = ctx as unknown as { planName: string; workspaceUrl: string } & BaseContext;
  const body = `<h1>Your subscription is active</h1>
<p>Your <strong>${c.planName}</strong> plan is now active. You have full access to all features.</p>
<a href="${c.workspaceUrl}" class="btn">Go to Workspace</a>`;
  return {
    subject: `Your ${c.planName} subscription is active`,
    html: baseHtml(body, c as unknown as BaseContext),
    text: baseText(`Your ${c.planName} plan is now active. Go to: ${c.workspaceUrl}`, c as unknown as BaseContext),
  };
};
