import type { EmailMessage } from "../contracts";
import { emailLayout, escapeHtml } from "./layout";

export function cardReadyEmail(input: {
  from: string;
  to: string;
  customerName: string;
  publicUrl: string;
}): EmailMessage {
  const content = emailLayout({
    preheader: "Your card is ready",
    title: "Card ready",
    greeting: `Hello ${input.customerName},`,
    bodyHtml: `<p>Your OI Card is ready to view and share.</p><p><a href="${escapeHtml(input.publicUrl)}">View your public card</a></p>`,
    bodyText: `Your OI Card is ready to view and share: ${input.publicUrl}`,
  });
  return {
    from: input.from,
    to: input.to,
    subject: "Your OI Card is ready",
    ...content,
  };
}
