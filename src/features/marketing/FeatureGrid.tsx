"use client";

import { motion } from "framer-motion";
import { Reveal } from "./Motion";
import { useLanguage } from "@/i18n/context";
import styles from "./feature-grid.module.css";

/* ── Inline SVG icons ──────────────────────────────────────── */

const icons: Record<string, React.FC> = {
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Wifi: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" />
    </svg>
  ),
  QrCode: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="17" y="17" width="4" height="4" />
      <rect x="14" y="14" width="2" height="2" />
    </svg>
  ),
  BarChart3: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Folder: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Contact: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Palette: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20" /><path d="M12 2a10 10 0 0 0 0 20" />
    </svg>
  ),
  Link2: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
};

const features = [
  { icon: "User", key: "publicProfile" },
  { icon: "Wifi", key: "nfcSharing" },
  { icon: "QrCode", key: "qrCode" },
  { icon: "BarChart3", key: "analytics" },
  { icon: "Folder", key: "portfolio" },
  { icon: "Contact", key: "contacts" },
  { icon: "Palette", key: "themes" },
  { icon: "Link2", key: "socialLinks" },
];

/* ── Main component ─────────────────────────────────────────── */

export default function FeatureGrid() {
  const { t } = useLanguage();

  return (
    <section className={styles.section}>
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

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
        }}
        className={styles.grid}
      >
        {features.map((f) => {
          const Icon = icons[f.icon];
          return (
            <motion.div
              key={f.key}
              variants={{
                hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] },
                },
              }}
              className={styles.card}
            >
              <div className={styles.cardIcon}>
                <Icon />
              </div>
              <span className={styles.cardLabel}>{t(`items.${f.key}`, "features")}</span>
              <div className={styles.cardShine} />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
