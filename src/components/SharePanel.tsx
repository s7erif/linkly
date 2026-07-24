"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode/lib/browser";
import { buildProfileUrl } from "@/lib/public-links";
import styles from "./workspace-panels.module.css";

export function SharePanel({
  slug,
  status,
  visibility,
}: {
  slug: string;
  status: string;
  visibility: string;
}) {
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const published = status === "PUBLISHED" && visibility === "PUBLIC";
  useEffect(() => {
    const value = buildProfileUrl(slug);
    setUrl(value);
    if (!published) { setQr(""); return; }
    const canvas = document.createElement("canvas");
    QRCode.toCanvas(canvas, value, { width: 320, margin: 2 })
      .then(() => setQr(canvas.toDataURL("image/png")))
      .catch(() => setQr(""));
  }, [slug, published]);
  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <aside className={styles.share} aria-label="Share card">
      <header className={styles.shareHeader}>
        <span className={styles.shareIcon} aria-hidden>↗</span>
        <div>
          <p>Publish</p>
          <h2>Share card</h2>
        </div>
        <span className={published ? styles.publishedBadge : styles.draftBadge}>
          {published ? "Published" : visibility === "PRIVATE" ? "Private" : "Draft"}
        </span>
      </header>
      <div className={styles.urlBlock}>
        <label htmlFor="public-card-url">Public URL</label>
        <input id="public-card-url" readOnly value={published ? url : "Available after publishing"} />
      </div>
      <button className={styles.copyButton} type="button" onClick={() => void copyUrl()} disabled={!url || !published}>
        {copied ? "Copied" : "Copy link"}
      </button>
      {published && qr && (
        <div className={styles.qrCard}>
          <div className={styles.qrImage}>
            <Image src={qr} alt="Card QR code" width={160} height={160} unoptimized />
          </div>
          <p>Scan to open your public card</p>
        </div>
      )}
      <div className={styles.shareActions}>
        {published && qr && <a href={qr} download={`${slug}-qr.png`}>Download</a>}
        {published ? <Link href={buildProfileUrl(slug)} target="_blank">Open <span aria-hidden>↗</span></Link> : <span className={styles.unavailable}>Not available</span>}
      </div>
    </aside>
  );
}
