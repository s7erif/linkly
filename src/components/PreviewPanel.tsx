"use client";
import { memo, useState } from "react";
import Link from "next/link";
import type { PublicCardDTO } from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import { DefaultTheme } from "@/components/themes/DefaultTheme";
import { buildProfileUrl } from "@/lib/public-links";
import styles from "./workspace-panels.module.css";
type Device = "mobile" | "desktop";
type Zoom = "actual" | "fit";
function PreviewPanelComponent({
  card,
  appearance,
}: {
  card: PublicCardDTO;
  appearance: AppearanceSettings;
}) {
  const [device, setDevice] = useState<Device>("mobile"),
    [zoom, setZoom] = useState<Zoom>("fit");
  const published = card.status === "PUBLISHED" && card.visibility === "PUBLIC";
  return (
    <section className={styles.preview} aria-label="Live preview">
      <div className={styles.previewToolbar}>
        <div className={styles.toolbarGroup} aria-label="Preview device">
          <button
            type="button"
            className={device === "mobile" ? styles.activeTool : styles.tool}
            onClick={() => setDevice("mobile")}
            aria-pressed={device === "mobile"}
          >
            <span aria-hidden>▯</span> Mobile
          </button>
          <button
            type="button"
            className={device === "desktop" ? styles.activeTool : styles.tool}
            onClick={() => setDevice("desktop")}
            aria-pressed={device === "desktop"}
          >
            <span aria-hidden>▭</span> Desktop
          </button>
        </div>
        <div className={styles.toolbarGroup} aria-label="Preview zoom">
          <button
            type="button"
            className={zoom === "actual" ? styles.activeTool : styles.tool}
            onClick={() => setZoom("actual")}
            aria-pressed={zoom === "actual"}
          >
            100%
          </button>
          <button
            type="button"
            className={zoom === "fit" ? styles.activeTool : styles.tool}
            onClick={() => setZoom("fit")}
            aria-pressed={zoom === "fit"}
          >
            Fit
          </button>
          {published ? (
            <Link className={styles.publicView} href={buildProfileUrl(card.slug)} target="_blank">
              Public View <span aria-hidden>↗</span>
            </Link>
          ) : (
            <span className={styles.publicUnavailable}>Public unavailable</span>
          )}
        </div>
      </div>
      <div className={styles.canvas}>
        <div
          className={`${styles.previewFrame} ${styles[device]} ${styles[zoom]}`}
        >
          <DefaultTheme card={card} appearance={appearance} />
        </div>
      </div>
    </section>
  );
}
export const PreviewPanel = memo(PreviewPanelComponent);
