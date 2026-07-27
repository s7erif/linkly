"use client";

import { motion } from "framer-motion";
import { Reveal } from "./Motion";
import Link from "next/link";
import { useLanguage } from "@/i18n/context";
import styles from "./cta-section.module.css";

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className={styles.section}>
      <Reveal>
        <div className={styles.card}>
          {/* Aurora inner glow */}
          <div className={styles.aurora} />

          {/* Sparkle */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -15 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            className={styles.sparkle}
            style={{ top: "48px", insetInlineEnd: "48px" }}
          >
            <svg viewBox="0 0 24 24" className={styles.sparkleSvg}>
              <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
            </svg>
          </motion.div>

          <h3 className={styles.heading}>
            {t("title", "cta").split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h3>

          <motion.div
            whileHover={{ y: -1 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className={styles.btnWrap}
          >
            <Link href="/register" className={styles.btn}>
              {t("button", "cta")}
            </Link>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}
