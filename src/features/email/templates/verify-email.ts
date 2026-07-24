import type { EmailTemplate } from "../services/template-engine";
import { baseHtml, baseText, type BaseContext } from "./base";

export const verifyEmailTemplate: EmailTemplate = (ctx) => {
  const { verifyUrl } = ctx as unknown as { verifyUrl: string } & BaseContext;
  const body = `<h1>Verify your email address</h1>
<p>Click the button below to confirm your email address. This link expires in 1 hour.</p>
<a href="${verifyUrl}" class="btn">Verify Email</a>
<p class="muted" style="margin-top:24px;">If you didn't create this account, you can safely ignore this email.</p>`;
  return {
    subject: "Verify your email address",
    html: baseHtml(body, ctx as unknown as BaseContext),
    text: baseText(`Verify your email: ${verifyUrl}\n\nThis link expires in 1 hour.`, ctx as unknown as BaseContext),
  };
};
