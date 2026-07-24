import type { EmailTemplate } from "../services/template-engine";
import { baseHtml, baseText, type BaseContext } from "./base";

interface WelcomeContext extends BaseContext {
  workspaceUrl: string;
}

export const welcomeTemplate: EmailTemplate = (ctx) => {
  const c = ctx as unknown as WelcomeContext;
  const body = `<h1>Welcome to ${c.platformName}!</h1>
<p>Your account has been created and your digital business card is ready to customize.</p>
<a href="${c.workspaceUrl}" class="btn">Open Your Workspace</a>
<p class="muted" style="margin-top:24px;">If the button doesn't work, copy this link:<br>${c.workspaceUrl}</p>`;

  return {
    subject: `Welcome to ${c.platformName}!`,
    html: baseHtml(body, c as unknown as BaseContext),
    text: baseText(
      `Your account has been created! Open your workspace: ${c.workspaceUrl}`,
      c as unknown as BaseContext,
    ),
  };
};
