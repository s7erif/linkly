import type { CardBlockDTO } from "@/dto";
import styles from "../default-theme.module.css";
export function VideoBlock({ block }: { block: CardBlockDTO }) {
  return (
    <section className={styles.contentBlock}>
      {block.config.heading && <h2>{block.config.heading}</h2>}
      {block.config.url ? (
        <video
          className={styles.video}
          controls
          preload="metadata"
          src={block.config.url}
        />
      ) : (
        <div className={styles.mediaPlaceholder}>Video</div>
      )}
      {block.config.caption && <p>{block.config.caption}</p>}
    </section>
  );
}
