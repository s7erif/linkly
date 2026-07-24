import type { CardBlockDTO } from "@/dto";
import styles from "../default-theme.module.css";
export function GalleryBlock({ block }: { block: CardBlockDTO }) {
  const count = block.mediaIds.length;
  return (
    <section className={styles.contentBlock}>
      {block.config.heading && <h2>{block.config.heading}</h2>}
      <div
        className={styles.gallery}
        style={{
          gridTemplateColumns: `repeat(${block.config.columns ?? 3},1fr)`,
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <div
            className={styles.mediaPlaceholder}
            aria-label="Gallery media awaiting Media Library integration"
            key={index}
          >
            Image
          </div>
        ))}
      </div>
      {!count && (
        <p className={styles.emptyBlock}>
          Add media after Media Library is available.
        </p>
      )}
    </section>
  );
}
