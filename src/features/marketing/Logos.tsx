"use client";

import { motion } from "framer-motion";
import styles from "./logos.module.css";

const logos = [
  {
    name: "stripe",
    label: (
      <span className={styles.logoStripe}>stripe</span>
    ),
  },
  {
    name: "Linear",
    label: (
      <span className={styles.logoRow}>
        <span className={styles.logoCircle} />
        Linear
      </span>
    ),
  },
  {
    name: "Notion",
    label: (
      <span className={styles.logoRow}>
        <span className={styles.logoSquare}>N</span>
        Notion
      </span>
    ),
  },
  {
    name: "Vercel",
    label: (
      <span className={styles.logoRow}>
        <svg viewBox="0 0 24 24" className={styles.logoVercelSvg}>
          <path d="M12 2 22 20H2z" />
        </svg>
        Vercel
      </span>
    ),
  },
  {
    name: "Framer",
    label: (
      <span className={styles.logoRow}>
        <svg viewBox="0 0 24 24" className={styles.logoFramerSvg}>
          <path d="M4 2h16v7h-8l8 7v6h-8l-8-7V9h8L4 2z" />
        </svg>
        Framer
      </span>
    ),
  },
  {
    name: "Figma",
    label: (
      <span className={styles.logoRow}>
        <span className={styles.logoFigmaCircle} />
        Figma
      </span>
    ),
  },
];

export default function Logos() {
  return (
    <div className={styles.wrap}>
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        className={styles.pill}
      >
        {logos.map((l, i) => (
          <motion.span
            key={l.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: 0.05 * i,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className={styles.logo}
          >
            {l.label}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
