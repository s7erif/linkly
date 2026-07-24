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
  const content = emailLayout({
    preheader: "Your OI Card is ready",
    title: "Your OI Card is ready",
    greeting: `Welcome, ${input.customerName}.`,
    bodyHtml: `<p>Your card has been created. Use this one-time access code to enter your Workspace:</p><p style="font-size:24px;font-weight:700;letter-spacing:3px">${escapeHtml(input.accessCode)}</p><p><a href="${escapeHtml(input.workspaceUrl)}">Open Workspace</a> · <a href="${escapeHtml(input.publicUrl)}">View public card</a></p><ol><li>Open the Workspace.</li><li>Enter the access code.</li><li>Personalize and share your card.</li></ol><p>Store the code securely. It cannot be recovered or displayed again.</p>`,
    bodyText: `Your card has been created.\n\nOne-time access code: ${input.accessCode}\nWorkspace: ${input.workspaceUrl}\nPublic card: ${input.publicUrl}\n\n1. Open the Workspace.\n2. Enter the access code.\n3. Personalize and share your card.\n\nStore the code securely. It cannot be recovered or displayed again.`,
  });
  return {
    from: input.from,
    to: input.to,
    subject: "Welcome to OI Cards — your card is ready",
    ...content,
  };
}
