import type { EmailTemplate } from "../services/template-engine";
import { baseHtml, baseText, type BaseContext } from "./base";

export const passwordResetTemplate: EmailTemplate = (ctx) => {
  const { resetUrl } = ctx as unknown as { resetUrl: string } & BaseContext;
  const body = `<h1>Reset your password</h1>
<p>Click the button below to reset your password. This link expires in 1 hour.</p>
<a href="${resetUrl}" class="btn">Reset Password</a>
<p class="muted" style="margin-top:24px;">If you didn't request a password reset, you can safely ignore this email.</p>`;
  return {
    subject: "Reset your password",
    html: baseHtml(body, ctx as unknown as BaseContext),
    text: baseText(`Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`, ctx as unknown as BaseContext),
  };
};
