import type { ReactNode } from "react";
import Link from "next/link";
import { getPlatformBranding } from "@/lib/platform-branding";
import { Surface } from "@/design/primitives";
import styles from "./customer-auth.module.css";

export async function CustomerAuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  const branding = await getPlatformBranding();
  const mark = branding.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
  
  return (
    <main className={styles.mainContainer}>
      <div className={styles.authContainer}>
        {/* Ambient Glow */}
        <div className={styles.ambientGlow} aria-hidden="true" />
        
        <div className={styles.scene}>
          <Surface variant="glassLg" radius="xl" className={styles.authCard}>
            <div className={styles.mobileBrand}>
              <span>{mark}</span>
              {branding.name}
            </div>
            <header>
              <p className={styles.eyebrow}>{eyebrow}</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </header>
            {children}
          </Surface>
        </div>
      </div>
    </main>
  );
}
