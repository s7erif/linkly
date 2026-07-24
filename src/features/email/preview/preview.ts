/**
 * Local email preview utility.
 *
 * Usage (Node.js / tsx):
 *   npx tsx src/features/email/preview/preview.ts
 *
 * Or import programmatically:
 *   import { previewAll } from "@/features/email/preview/preview";
 *   previewAll().then(files => console.log(files));
 */

import { createTemplateEngine } from "../templates/registry";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SAMPLE_CONTEXT = {
  platformName: "OI Cards",
  platformUrl: "https://oicards.com",
  recipientName: "Alex",
  workspaceUrl: "https://oicards.com/workspace",
  verifyUrl: "https://oicards.com/verify?token=sample-token",
  resetUrl: "https://oicards.com/reset-password?token=sample-token",
  planName: "Professional",
  nextBillingDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString(),
  renewUrl: "https://oicards.com/billing/renew",
  amount: "$29.00",
  invoiceUrl: "https://oicards.com/invoice/inv_123",
  retryUrl: "https://oicards.com/billing/payment",
};

export async function previewAll(): Promise<string[]> {
  const engine = createTemplateEngine();
  const names = engine.list();
  const outDir = join(process.cwd(), ".email-preview");
  mkdirSync(outDir, { recursive: true });

  const files: string[] = [];
  for (const name of names) {
    try {
      const rendered = engine.render(name, SAMPLE_CONTEXT);
      const htmlPath = join(outDir, `${name}.html`);
      const textPath = join(outDir, `${name}.txt`);
      writeFileSync(htmlPath, rendered.html);
      writeFileSync(textPath, rendered.text);
      files.push(`${name}.html`, `${name}.txt`);
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nPreview files written to ${outDir}/`);
  return files;
}

// Run directly: npx tsx src/features/email/preview/preview.ts
const isMain = process.argv[1]?.endsWith("preview.ts") || process.argv[1]?.endsWith("preview/preview.ts");
if (isMain) {
  previewAll().catch(console.error);
}
