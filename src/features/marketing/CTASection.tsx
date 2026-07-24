"use client";

import { motion } from "framer-motion";
import { Reveal } from "./Motion";
import Link from "next/link";
import styles from "./cta-section.module.css";

export default function CTASection() {
  return (
    <section className={styles.section}>
      <Reveal>
        <div className={styles.card}>
          {/* Aurora inner glow */}
          <div className={styles.aurora} />

          {/* Sparkle */}
          <motion.div
            animate={{ rotate: [0, 12, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className={styles.sparkle}
          >
            <svg viewBox="0 0 24 24" className={styles.sparkleSvg}>
              <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
            </svg>
          </motion.div>

          <h3 className={styles.heading}>
            Your identity.
            <br />
            Ready in one tap.
          </h3>

          <motion.div
            whileHover={{ y: -1 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className={styles.btnWrap}
          >
            <Link href="/register" className={styles.btn}>
              Start with Tappy
            </Link>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}
