"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./hero.module.css";

/* ── Types ────────────────────────────────────────────────────── */

interface HeroSectionProps {
  brandName: string;
}

/* ── Easing ──────────────────────────────────────────────────── */

const spring: [number, number, number, number] = [0.22, 1, 0.36, 1];
const decelerate: [number, number, number, number] = [0.0, 0, 0.2, 1];

/* ── Sequence timings ─────────────────────────────────────────── */

const T = {
  phoneAppear: 0.0,
  cardApproach: 0.25,
  glowPulse: 0.9,
  profileAvatar: 1.0,
  profileName: 1.12,
  profileActions: 1.24,
  profileIcons: 1.36,
  headline: 0.15,
  body: 0.25,
  badge: 0.05,
  actions: 0.35,
  trust: 0.45,
} as const;

/* ── Profile card (on phone screen) ───────────────────────────── */

function ProfileCard({ brandName }: { brandName: string }) {
  const initials = brandName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.profileCard}>
      <motion.div
        className={styles.profileAvatar}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: T.profileAvatar, ease: spring }}
      >
        {initials}
      </motion.div>
      <motion.p
        className={styles.profileName}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: T.profileName, ease: spring }}
      >
        {brandName}
      </motion.p>
      <motion.p
        className={styles.profileTitle}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: T.profileName + 0.04, ease: spring }}
      >
        Creative Director
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: T.profileActions, ease: spring }}
      >
        <span className={styles.profileActionPrimary}>Save Contact</span>
        <span className={styles.profileActionSecondary}>View Portfolio</span>
      </motion.div>
      <motion.div
        className={styles.profileIcons}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: T.profileIcons, ease: spring }}
      >
        <span className={styles.profileIcon}>in</span>
        <span className={styles.profileIcon}>ig</span>
        <span className={styles.profileIcon}>↗</span>
      </motion.div>
    </div>
  );
}

/* ── Phone scene (right column) ────────────────────────────────── */

function PhoneScene({ brandName }: { brandName: string }) {
  const phoneRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = phoneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * 4, y: dx * 4 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={phoneRef}
      className={styles.composition}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Connection glow */}
      <motion.div
        className={styles.connectionGlow}
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: [0, 1, 0.7, 1],
          scale: [0.5, 1.15, 1, 1],
        }}
        transition={{
          duration: 1.2,
          delay: T.glowPulse,
          ease: spring,
          times: [0, 0.3, 0.6, 1],
        }}
      >
        <motion.div
          className={styles.glowPulse}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 3,
            delay: T.glowPulse + 0.6,
            ease: "easeInOut" as const,
            repeat: Infinity,
            repeatType: "loop" as const,
          }}
        />
        <div className={styles.glowCore} />
        <div className={styles.glowRing} />
      </motion.div>

      {/* NFC Card — approaches, lands on screen */}
      <motion.div
        className={styles.nfcCard}
        aria-hidden="true"
        initial={{ x: -52, y: -72, rotate: -24, opacity: 0 }}
        animate={{ x: 0, y: 0, rotate: -10, opacity: 1 }}
        transition={{ duration: 0.65, delay: T.cardApproach, ease: decelerate }}
      >
        <div className={styles.nfcChip} />
        <div className={styles.nfcPattern}>
          <div className={styles.nfcPatternLine} />
          <div className={styles.nfcPatternLine} />
          <div className={styles.nfcPatternLine} />
        </div>
        <div className={styles.nfcWireless} />
      </motion.div>

      {/* Phone */}
      <motion.div
        className={styles.phoneFrame}
        initial={{ opacity: 0, y: 24 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateY: -8 + tilt.y,
          rotateX: 2 + tilt.x,
        }}
        transition={{ duration: 0.6, delay: T.phoneAppear, ease: spring }}
      >
        {/* Side buttons */}
        <div className={styles.phoneBtnVolUp} />
        <div className={styles.phoneBtnVolDown} />
        <div className={styles.phoneBtnPower} />

        <div className={styles.phoneNotch} />
        <div className={styles.phoneScreen}>
          <ProfileCard brandName={brandName} />
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */

export default function HeroSection({ brandName }: HeroSectionProps) {
  return (
    <>
      {/* ── Ambient background layer (fixed) ──────────────────── */}
      <div className={styles.ambientBg} aria-hidden="true" />

      {/* ── Hero content ──────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-headline">
        {/* Left column — text content grouped together */}
        <div className={styles.textZone}>
          <motion.h1
            id="hero-headline"
            className={styles.headline}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: T.headline, ease: spring }}
          >
            One tap.{" "}
            <br className={styles.headlineBr} />
            <span className={styles.textGradient}>Instant connection.</span>
          </motion.h1>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: T.actions, ease: spring }}
          >
            <Link href="/products" className={styles.primaryCta}>
              Browse Our Products
            </Link>
            <Link href="/login" className={styles.secondaryCta}>
              Sign In
            </Link>
          </motion.div>

          <motion.p
            className={styles.body}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: T.body, ease: spring }}
          >
            The most elegant way to share who you are.
            Designed for the modern professional.
          </motion.p>

          <motion.div
            className={styles.trustRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: T.trust, ease: spring }}
          >
            <span className={styles.trustStat}>No app required</span>
            <span className={styles.trustStat}>Update anytime</span>
            <span className={styles.trustStat}>Share by NFC • QR • Link</span>
          </motion.div>
        </div>

        {/* Right column — NFC interaction scene */}
        <PhoneScene brandName={brandName} />
      </section>
    </>
  );
}
