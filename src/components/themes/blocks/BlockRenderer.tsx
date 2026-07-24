import { lazy, memo, Suspense, type ReactNode } from "react";
import type { CardBlockDTO, PublicCardDTO } from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import styles from "../default-theme.module.css";
const Gallery = lazy(() =>
    import("./GalleryBlock").then((module) => ({
      default: module.GalleryBlock,
    })),
  ),
  Video = lazy(() =>
    import("./VideoBlock").then((module) => ({ default: module.VideoBlock })),
  ),
  Location = lazy(() =>
    import("./LocationBlock").then((module) => ({
      default: module.LocationBlock,
    })),
  );
function BlockRendererComponent({
  block,
  card,
  appearance,
}: {
  block: CardBlockDTO;
  card: PublicCardDTO;
  appearance: AppearanceSettings;
}) {
  const profile = card.profile;
  const registry: Record<CardBlockDTO["kind"], () => ReactNode> = {
    HERO: () =>
      appearance.sections.profile ? (
        <header className={styles.profile}>
          <div className={styles.avatar} aria-hidden>
            {(block.config.title ?? profile?.fullName ?? card.name)
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <h1>{block.config.title ?? profile?.fullName ?? card.name}</h1>
          {(block.config.subtitle ?? profile?.headline) && (
            <p>{block.config.subtitle ?? profile?.headline}</p>
          )}
          {profile?.company && <span>{profile.company}</span>}
        </header>
      ) : null,
    ABOUT: () =>
      appearance.sections.bio && (block.config.body ?? profile?.bio) ? (
        <section className={styles.contentBlock}>
          {block.config.heading && <h2>{block.config.heading}</h2>}
          <p>{block.config.body ?? profile?.bio}</p>
        </section>
      ) : null,
    CONTACT: () =>
      appearance.sections.contact && profile ? (
        <section className={styles.contact}>
          {block.config.heading && <h2>{block.config.heading}</h2>}
          {profile.email && (
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          )}
          {profile.phone && (
            <a href={`tel:${profile.phone}`}>{profile.phone}</a>
          )}
          {profile.website && <a href={profile.website}>{profile.website}</a>}
          {profile.address && <span>{profile.address}</span>}
        </section>
      ) : null,
    SOCIAL_LINKS: () =>
      appearance.sections.socialLinks && card.socialLinks.length ? (
        <nav className={styles.social}>
          {block.config.heading && <h2>{block.config.heading}</h2>}
          {card.socialLinks.map((link) => (
            <a key={link.id} href={link.url}>
              {link.label ?? link.platform}
            </a>
          ))}
        </nav>
      ) : null,
    CTA_BUTTONS: () =>
      appearance.sections.buttons && card.buttons.length ? (
        <section className={styles.actions}>
          {block.config.heading && <h2>{block.config.heading}</h2>}
          {card.buttons.map((button) => (
            <a
              key={button.id}
              href={button.url}
              className={`${styles.button} ${styles[appearance.buttonStyle.toLowerCase()]}`}
            >
              {button.label}
            </a>
          ))}
        </section>
      ) : null,
    GALLERY: () => <Gallery block={block} />,
    VIDEO: () => <Video block={block} />,
    FAQ: () => (
      <section className={styles.contentBlock}>
        {block.config.heading && <h2>{block.config.heading}</h2>}
        {(block.config.items ?? []).map((item) => (
          <details className={styles.faq} key={item.id}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
    ),
    LOCATION_MAP: () => <Location block={block} />,
    DIVIDER: () => (
      <hr
        className={styles.divider}
        style={{
          borderTopStyle: (
            { SOLID: "solid", DASHED: "dashed", DOTTED: "dotted" } as const
          )[block.config.style ?? "SOLID"],
        }}
      />
    ),
    RICH_TEXT: () => (
      <section className={styles.contentBlock}>
        {block.config.heading && <h2>{block.config.heading}</h2>}
        <p className={styles.richText}>{block.config.content}</p>
      </section>
    ),
  };
  return (
    <Suspense fallback={<div className={styles.blockLoading}>Loading…</div>}>
      {registry[block.kind]()}
    </Suspense>
  );
}
export const BlockRenderer = memo(BlockRendererComponent);
