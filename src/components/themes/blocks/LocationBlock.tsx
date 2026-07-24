import type { CardBlockDTO } from "@/dto";
import styles from "../default-theme.module.css";
export function LocationBlock({ block }: { block: CardBlockDTO }) {
  const address = block.config.address ?? "";
  return (
    <section className={styles.contentBlock}>
      {block.config.heading && <h2>{block.config.heading}</h2>}
      <div className={styles.mapPlaceholder}>⌖</div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noreferrer"
      >
        {address}
      </a>
    </section>
  );
}
