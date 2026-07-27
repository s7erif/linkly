"use client";

import { motion } from "framer-motion";
import { Reveal } from "./Motion";
import { useLanguage } from "@/i18n/context";
import styles from "./everything-cards.module.css";

/* ── Inline SVG icons (no lucide-react dependency) ──────────── */

function IconUserPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconPower() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

function IconShare2() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

/* ── Types ──────────────────────────────────────────────────── */

type Step = {
  icon: React.FC;
  label: string;
};

/* ── Step row ───────────────────────────────────────────────── */

function StepRow({ steps }: { steps: Step[] }) {
  return (
    <div className={styles.stepRow}>
      {steps.map((s, i) => (
        <div key={s.label} className={styles.stepItem}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: 0.1 * i,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className={styles.stepContent}
          >
            <div className={styles.stepIcon}>
              <s.icon />
            </div>
            <span className={styles.stepLabel}>{s.label}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <div className={styles.stepLine}>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.9,
                  delay: 0.15 * i + 0.2,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
                style={{ transformOrigin: "left center" }}
                className={styles.stepLineFill}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export default function EverythingCards() {
  const { t } = useLanguage();

  const digital: Step[] = [
    { icon: IconUserPlus, label: t("steps.register", "everythingCards") },
    { icon: IconCheckCircle, label: t("steps.choosePlan", "everythingCards") },
    { icon: IconCreditCard, label: t("steps.payment", "everythingCards") },
    { icon: IconBriefcase, label: t("steps.workspace", "everythingCards") },
  ];
  const nfc: Step[] = [
    { icon: IconPower, label: t("steps.activate", "everythingCards") },
    { icon: IconBriefcase, label: t("steps.workspace", "everythingCards") },
    { icon: IconShare2, label: t("steps.share", "everythingCards") },
  ];

  return (
    <section id="features" className={styles.section}>
      <Reveal className={styles.headWrap}>
        <h2 className={styles.heading}>
          {t("title", "features").split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i === 0 && <br />}
            </span>
          ))}
        </h2>
      </Reveal>

      <div className={styles.grid}>
        <Reveal delay={0.05}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>{t("digital", "everythingCards")}</div>
            <StepRow steps={digital} />
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>{t("nfcCard", "everythingCards")}</div>
            <StepRow steps={nfc} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
