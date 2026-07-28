"use client";

import { m, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/use-theme";
import { cn } from "@/lib/utils";

export interface SocialLink {
  id: string;
  platform: string;
  label?: string | null;
  url: string;
}

export interface SocialIconsProps {
  links: ReadonlyArray<SocialLink>;
  className?: string;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  website: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13 2 4" />
    </svg>
  ),
  google_maps: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="4" height="12" /><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><circle cx="4" cy="4" r="2" />
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  ),
  default: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
};

function iconFor(platform: string): React.ReactNode {
  return PLATFORM_ICONS[platform.toLowerCase()] ?? PLATFORM_ICONS.default;
}

export function SocialIcons({ links, className }: SocialIconsProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  if (!links.length) return null;

  return (
    <nav className={cn("social-icons-container flex justify-center gap-3 sm:gap-4 lg:gap-[var(--social-gap,1.25rem)] md:mt-1", className)}>
      {links.map((link, i) => (
        <m.a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label ?? link.platform}
          className="w-11 h-11 lg:w-[var(--social-icon-box,2.75rem)] lg:h-[var(--social-icon-box,2.75rem)] flex items-center justify-center transition-shadow backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}0D, ${theme.colors.primary}05)`,
            color: theme.colors.text, // Better contrast
            borderRadius: theme.shape.avatarRadius, // Inherit shape from token
            border: `1px solid ${theme.colors.primary}1A`,
            outlineColor: theme.colors.primary,
          }}
          whileHover={reduced ? undefined : {
            color: theme.colors.primary,
            background: `linear-gradient(135deg, ${theme.colors.primary}1A, ${theme.colors.primary}08)`,
            scale: 1.12,
            rotate: 3,
            y: -2,
            boxShadow: `0 4px 12px ${theme.colors.primary}25`
          }}
          whileTap={reduced ? undefined : { scale: 0.95, rotate: 0 }}
          initial={reduced ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? undefined : { 
            opacity: { delay: 0.1 * i, duration: 0.3 },
            y: { delay: 0.1 * i, duration: 0.3, ease: "easeOut" },
            scale: { type: "spring", stiffness: 350, damping: 30 },
            rotate: { type: "spring", stiffness: 350, damping: 30 },
          }}
        >
          {iconFor(link.platform)}
        </m.a>
      ))}
    </nav>
  );
}
