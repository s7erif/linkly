import type { CSSProperties } from "react";
import type { PublicCardDTO } from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import styles from "./default-theme.module.css";

export interface DefaultThemeProps { card: PublicCardDTO; appearance: AppearanceSettings }

const fonts = { SYSTEM: "system-ui, sans-serif", SANS: "Inter, system-ui, sans-serif", SERIF: "Georgia, serif" } as const;
const shadows = { NONE: "none", SMALL: "0 4px 12px rgb(15 23 42 / 10%)", MEDIUM: "0 16px 40px rgb(15 23 42 / 16%)", LARGE: "0 24px 64px rgb(15 23 42 / 24%)" } as const;

export function DefaultTheme({ card, appearance }: DefaultThemeProps) {
  const profile = card.profile;
  const background = appearance.background.style === "GRADIENT" ? `linear-gradient(145deg, ${appearance.background.gradientFrom}, ${appearance.background.gradientTo})` : appearance.background.color;
  const variables = { "--primary": appearance.colors.primary, "--accent": appearance.colors.accent, "--text": appearance.colors.text, "--muted": appearance.colors.mutedText, "--radius": `${appearance.borderRadius}px`, "--card-shadow": shadows[appearance.shadow], "--font": fonts[appearance.typography], "--background": background, background } as CSSProperties;
  return <main className={styles.viewport} style={variables}>
    <article className={styles.card}>
      {appearance.sections.profile && <header className={styles.profile}><div className={styles.avatar} aria-hidden>{(profile?.fullName ?? card.name).slice(0, 1).toUpperCase()}</div><h1>{profile?.fullName ?? card.name}</h1>{profile?.headline && <p>{profile.headline}</p>}{profile?.company && <span>{profile.company}</span>}</header>}
      {appearance.sections.bio && profile?.bio && <section className={styles.section}><p>{profile.bio}</p></section>}
      {appearance.sections.contact && profile && <section className={styles.contact} aria-label="Contact details">{profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}{profile.phone && <a href={`tel:${profile.phone}`}>{profile.phone}</a>}{profile.website && <a href={profile.website}>{profile.website}</a>}{profile.address && <span>{profile.address}</span>}</section>}
      {appearance.sections.buttons && card.buttons.length > 0 && <section className={styles.actions}>{card.buttons.map(button => <a key={button.id} href={button.url} className={`${styles.button} ${styles[appearance.buttonStyle.toLowerCase()]}`}>{button.label}</a>)}</section>}
      {appearance.sections.socialLinks && card.socialLinks.length > 0 && <nav className={styles.social} aria-label="Social links">{card.socialLinks.map(link => <a key={link.id} href={link.url}>{link.label ?? link.platform}</a>)}</nav>}
    </article>
  </main>;
}
