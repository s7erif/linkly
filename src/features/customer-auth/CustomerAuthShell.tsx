import type { ReactNode } from "react";
import Link from "next/link";
import { getPlatformBranding } from "@/lib/platform-branding";
import styles from "./customer-auth.module.css";

export async function CustomerAuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  const branding = await getPlatformBranding();
  const mark = branding.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
  return <main className={styles.page}>
    <section className={styles.story} aria-label="Product introduction">
      <Link className={styles.brand} href="/"><span>{mark}</span>{branding.name}</Link>
      <div className={styles.storyCopy}><p className={styles.eyebrow}>One card. Every connection.</p><h2>Your identity, beautifully shared.</h2><p>Manage your digital presence, activate NFC cards, and keep every introduction current from one private Workspace.</p><ul><li>One secure customer Workspace</li><li>Update your card anytime</li><li>Share by link, QR, or NFC</li></ul></div>
      <p className={styles.copyright}>Digital identity, thoughtfully made.</p>
    </section>
    <section className={styles.panel}><div className={styles.authCard}><div className={styles.mobileBrand}><span>{mark}</span>{branding.name}</div><header><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>{children}</div></section>
  </main>;
}
