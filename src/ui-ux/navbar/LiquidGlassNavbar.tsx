"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./liquid-glass-navbar.module.css";

/* ── Types ────────────────────────────────────────────────────── */

interface NavLinkItem {
  label: string;
  href: string;
}

interface LiquidGlassNavbarProps {
  platformName: string;
}

/* ── Nav data ─────────────────────────────────────────────────── */

const NAV_LINKS: NavLinkItem[] = [
  { label: "Experience", href: "/#features" },
  { label: "The Card", href: "/#how-it-works" },
  { label: "Enterprise", href: "/#pricing" },
  { label: "Support", href: "/#contact" },
];

/* ── Scroll glass hook ────────────────────────────────────────── */

function useScrollGlass() {
  const [scrollState, setScrollState] = useState(0);

  useEffect(() => {
    let raf: number;
    let current = 0;
    let target = 0;

    const onScroll = () => {
      target = Math.min(window.scrollY / 80, 1);
    };

    const tick = () => {
      current += (target - current) * 0.08;
      if (Math.abs(target - current) < 0.001) current = target;
      setScrollState(current);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return scrollState;
}

/* ── Hamburger icon ───────────────────────────────────────────── */

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className={styles.hamburgerIcon}>
      <span className={styles.hamburgerLine} />
      <span className={styles.hamburgerLine} />
      <span className={styles.hamburgerLine} />
    </span>
  );
}

/* ── Desktop nav links ────────────────────────────────────────── */

function DesktopNav() {
  const pathname = usePathname();

  return (
    <ul className={styles.navList}>
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname?.startsWith(link.href));

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Desktop CTA ──────────────────────────────────────────────── */

function DesktopActions() {
  return (
    <Link href="/register" className={styles.ctaButton}>
      Get Started
    </Link>
  );
}

/* ── Mobile drawer ────────────────────────────────────────────── */

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={styles.mobileDrawerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
          />
          <motion.div
            className={styles.mobileDrawer}
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className={styles.mobileDrawerNav}>
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={styles.mobileNavLink}
                    style={
                      isActive
                        ? { color: "#000000", fontWeight: 700 }
                        : undefined
                    }
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/login"
                className={styles.mobileNavLink}
                onClick={onClose}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className={styles.mobileCtaButton}
                onClick={onClose}
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Main component ───────────────────────────────────────────── */

export default function LiquidGlassNavbar({
  platformName,
}: LiquidGlassNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollState = useScrollGlass();
  const isScrolled = scrollState > 0.5;

  // ── Route hiding ──────────────────────────────────────────
  const rootProfile = Boolean(
    pathname &&
      /^\/[^/]+$/.test(pathname) &&
      ![
        "/activate",
        "/register",
        "/gallery",
        "/admin/login",
      ].includes(pathname)
  );

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/workspace") ||
    pathname?.startsWith("/a/") ||
    pathname?.startsWith("/card/") ||
    pathname === "/login" ||
    rootProfile
  ) {
    return null;
  }

  return (
    <>
      <motion.header
        className={styles.wrapper}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        <nav className={`${styles.pill} ${isScrolled ? styles.scrolled : ""}`}>
          <Link href="/" className={styles.brand} aria-label={platformName}>
            {platformName}
          </Link>

          <DesktopNav />
          <DesktopActions />

          <button
            type="button"
            className={`${styles.hamburger} ${mobileOpen ? styles.open : ""}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </nav>
      </motion.header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
