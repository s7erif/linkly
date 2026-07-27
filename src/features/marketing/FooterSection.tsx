"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/i18n/context";
import styles from "./footer-section.module.css";

interface FooterProps {
  brandName: string;
}

export default function FooterSection({ brandName }: FooterProps) {
  const initial = brandName.charAt(0).toUpperCase();
  const { t } = useLanguage();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      className={styles.footer}
    >
      <Link href="/" className={styles.brand}>
        <span className={styles.brandMark}>{initial}</span>
        {brandName}
      </Link>
      <div className={styles.links}>
        <Link href="/" className={styles.link}>{t("links", "footer")}</Link>
        <Link href="/" className={styles.link}>{t("about", "footer")}</Link>
        <Link href="/" className={styles.link}>{t("term", "footer")}</Link>
        <Link href="/" className={styles.link}>{t("contact", "footer")}</Link>
      </div>
    </motion.footer>
  );
}
