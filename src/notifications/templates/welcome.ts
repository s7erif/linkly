import type { EmailMessage } from "../contracts";
import { emailLayout, escapeHtml } from "./layout";

export function welcomeEmail(input: {
  from: string;
  to: string;
  customerName: string;
  publicUrl: string;
  workspaceUrl: string;
  accessCode: string;
}): EmailMessage {
  const signInUrl = `${new URL(input.workspaceUrl).origin}/login`;
  const bodyHtml = [
    `<p>Your card has been created and is waiting in your Workspace.</p>`,
    `<p style="font-size:24px;font-weight:700;letter-spacing:3px">${escapeHtml(input.accessCode)}</p>`,
    `<p>Keep this card code for your records.</p>`,
    `<p><a href="${escapeHtml(signInUrl)}">Sign in to your Workspace</a> · <a href="${escapeHtml(input.publicUrl)}">View your public card</a></p>`,
    `<ol>`,
    `<li>Sign in at <a href="${escapeHtml(signInUrl)}">${escapeHtml(signInUrl)}</a> with your email and password.</li>`,
    `<li>Your cards will be waiting in your Workspace — no code needed.</li>`,
    `<li>Personalize your profile, links, and appearance, then publish and share.</li>`,
    `</ol>`,
    `<p>Store this email securely. The card code above cannot be recovered or displayed again.</p>`,
  ].join("");
  const bodyText = [
    `Your card has been created and is waiting in your Workspace.`,
    ``,
    `Card code: ${input.accessCode}`,
    `Keep this card code for your records.`,
    ``,
    `Sign in: ${signInUrl}`,
    `Public card: ${input.publicUrl}`,
    ``,
    `1. Sign in at ${signInUrl} with your email and password.`,
    `2. Your cards will be waiting in your Workspace — no code needed.`,
    `3. Personalize your profile, links, and appearance, then publish and share.`,
    ``,
    `Store this email securely. The card code above cannot be recovered or displayed again.`,
  ].join("\n");
  const content = emailLayout({
    preheader: "Your OI Card is ready",
    title: "Your OI Card is ready",
    greeting: `Welcome, ${input.customerName}.`,
    bodyHtml,
    bodyText,
  });
  return {
    from: input.from,
    to: input.to,
    subject: "Welcome to OI Cards — your card is ready",
    ...content,
  };
}
