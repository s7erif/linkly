const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] ?? character,
  );

export function emailLayout(input: {
  preheader: string;
  title: string;
  greeting: string;
  bodyHtml: string;
  bodyText: string;
}) {
  return {
    html: `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b"><div style="display:none">${escapeHtml(input.preheader)}</div><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:600px;background:#fff;border-radius:16px"><tr><td style="padding:32px"><p style="font-weight:700">OI Cards</p><h1>${escapeHtml(input.title)}</h1><p>${escapeHtml(input.greeting)}</p>${input.bodyHtml}<p style="margin-top:32px;color:#71717a;font-size:13px">OI Cards · Your identity, beautifully connected.</p></td></tr></table></td></tr></table></body></html>`,
    text: `OI Cards\n\n${input.title}\n\n${input.greeting}\n\n${input.bodyText}\n\nOI Cards · Your identity, beautifully connected.`,
  };
}

export { escapeHtml };
