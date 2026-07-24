import type { EmailTemplate } from "../services/template-engine";
import { baseHtml, baseText, type BaseContext } from "./base";

export const passwordChangedTemplate: EmailTemplate = (ctx) => {
  const body = `<h1>Password changed</h1>
<p>Your password was successfully changed. If you made this change, no further action is needed.</p>
<p>If you didn't change your password, please contact support immediately.</p>`;
  return {
    subject: "Your password has been changed",
    html: baseHtml(body, ctx as unknown as BaseContext),
    text: baseText("Your password was successfully changed. If this wasn't you, contact support immediately.", ctx as unknown as BaseContext),
  };
};
