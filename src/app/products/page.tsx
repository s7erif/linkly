"use client";

import { motion } from "framer-motion";
import styles from "./products.module.css";

/* ── Easing ──────────────────────────────────────────────────── */
const spring: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ProductsPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* ── Ambient background layer (fixed) ──────────────────── */}
      <div className={styles.ambientBg} aria-hidden="true" />
      
      {/* ── Floating Background Blobs ──────────────────────────── */}
      <motion.div
        className={`${styles.blob} ${styles.blob1}`}
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 10,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        aria-hidden="true"
      />
      
      <motion.div
        className={`${styles.blob} ${styles.blob2}`}
        animate={{
          y: [0, 40, 0],
          x: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1,
        }}
        aria-hidden="true"
      />

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className={styles.content}>
        
        {/* Headings */}
        <motion.h1
          className={styles.headline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: spring }}
        >
          <span className={styles.textGradient}>Our Store</span>
        </motion.h1>
        
        <motion.h2
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: spring }}
        >
          Coming Soon
        </motion.h2>
        
        <motion.p
          className={styles.body}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: spring }}
        >
          We&apos;re building a premium collection of NFC products and accessories designed to make networking effortless. Stay tuned for our official launch.
        </motion.p>
        
        {/* Countdown */}
        <motion.div
          className={styles.countdownGrid}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: spring }}
        >
          {[
            { label: "Days", value: "00" },
            { label: "Hours", value: "00" },
            { label: "Minutes", value: "00" },
            { label: "Seconds", value: "00" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className={styles.countdownCard}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2, ease: spring }}
            >
              <div className={styles.countdownValue}>{item.value}</div>
              <div className={styles.countdownLabel}>{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* CTA Area */}
        <motion.div
          className={styles.ctaWrapper}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: spring }}
        >
          <button type="button" className={styles.notifyButton} disabled aria-disabled="true">
            Notify Me
          </button>
          
          <motion.div
            className={styles.stayTuned}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: spring }}
          >
            Stay tuned.
          </motion.div>
        </motion.div>
        
      </main>
    </div>
  );
}
