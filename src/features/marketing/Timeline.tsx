"use client";

import { motion } from "framer-motion";
import { Reveal } from "./Motion";
import { useLanguage } from "@/i18n/context";
import styles from "./timeline.module.css";

/* ── Inline SVG icons ──────────────────────────────────────── */

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

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Types ──────────────────────────────────────────────────── */

type Step = { icon: React.FC; label: string };

const getSteps = (t: (k: string, n?: string) => string): Step[] => [
  { icon: IconUserPlus, label: t("steps.register", "everythingCards") },
  { icon: IconCheckCircle, label: t("steps.choosePlan", "everythingCards") },
  { icon: IconCreditCard, label: t("steps.payment", "everythingCards") },
  { icon: IconBriefcase, label: t("steps.workspace", "everythingCards") },
];

/* ── Main component ─────────────────────────────────────────── */

export default function Timeline() {
  const { t } = useLanguage();
  const steps = getSteps(t);

  return (
    <section id="how" className={styles.section}>
      <div className={styles.grid}>
        {/* Left: Steps */}
        <Reveal>
          <div>
            <h3 className={styles.heading}>{t("digital", "everythingCards")}</h3>
            <div className={styles.stepRow}>
              {steps.map((s, i) => (
                <div key={s.label} className={styles.stepItem}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
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
          </div>
        </Reveal>

        {/* Right: Floating phone mockup */}
        <Reveal delay={0.15}>
          <div className={styles.phoneArea}>
            {/* Floating chips */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
              className={`${styles.chip} ${styles.chipLeft}`}
            >
              <div className={styles.chipBox} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              className={`${styles.chip} ${styles.chipRight}`}
            >
              <div className={`${styles.chipBox} ${styles.chipBoxDim}`} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              className={`${styles.chip} ${styles.chipBottom}`}
            >
              <div className={`${styles.chipBox} ${styles.chipBoxMid}`} />
            </motion.div>

            {/* Dark phone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
              className={styles.phone}
            >
              <div className={styles.phoneInner}>
                <div className={styles.phoneNotch} />
                <div className={styles.phoneContent}>
                  <div className={styles.phoneAvatar}>
                    <IconUser />
                  </div>
                  <div className={styles.phoneTitle}>Linkly Profile</div>
                </div>
                <div className={styles.phoneList}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={styles.phoneRow}>
                      <div className={styles.phoneRowIcon}>
                        {i === 0 ? (
                          <IconCheck />
                        ) : (
                          <IconBell />
                        )}
                      </div>
                      <div className={styles.phoneRowBar} />
                    </div>
                  ))}
                </div>
                <div className={styles.phoneHome} />
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
