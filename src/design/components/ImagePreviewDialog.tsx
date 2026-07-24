"use client";

import Image from "next/image";
import { Download, ImageOff, LoaderCircle, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Heading, Inline, Stack, Surface, Text } from "../primitives";
import styles from "./components.module.css";

export type ImagePreviewDialogProps = {
  alt: string;
  downloadName: string;
  height?: number | null;
  src: string;
  title: string;
  uploadedAt: string;
  width?: number | null;
};

const focusableSelector = "a[href], button:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";

export function ImagePreviewDialog({ alt, downloadName, height, src, title, uploadedAt, width }: ImagePreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">("loading");
  const [zoom, setZoom] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    dialogRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button aria-haspopup="dialog" className={styles.imagePreviewTrigger} onClick={() => { setImageState("loading"); setZoom(1); setOpen(true); }} ref={triggerRef} type="button">
        <span className={styles.imagePreviewFrame}>
          <Image alt={alt} fill loading="lazy" onError={() => setImageState("error")} onLoad={() => setImageState("ready")} sizes="(max-width: 640px) 100vw, 28rem" src={src} unoptimized />
        </span>
        <span>Open fullscreen preview</span>
      </button>
      {open ? (
        <div className={styles.imageDialogRoot} ref={dialogRef}>
          <button aria-label="Close image preview" className={styles.imageDialogBackdrop} onClick={() => setOpen(false)} tabIndex={-1} type="button" />
          <Surface aria-labelledby="payment-proof-preview-title" aria-modal="true" as="section" className={styles.imageDialog} radius="xl" role="dialog" variant="glass">
            <Inline className={styles.imageDialogHeader} gap="md" justify="between">
              <Stack gap="xs">
                <Heading id="payment-proof-preview-title" level={2} variant="h3">{title}</Heading>
                <Text tone="muted" variant="caption"><time dateTime={uploadedAt}>{new Date(uploadedAt).toLocaleString()}</time>{width && height ? ` · ${width} × ${height} px` : ""}</Text>
              </Stack>
              <Inline gap="xs">
                <Button aria-label="Zoom out" disabled={zoom <= 1} iconOnly leftIcon={<Minus />} onClick={() => setZoom((value) => Math.max(1, value - 0.25))} size="sm" variant="ghost" />
                <Text aria-live="polite" className={styles.zoomValue} variant="caption">{Math.round(zoom * 100)}%</Text>
                <Button aria-label="Zoom in" disabled={zoom >= 3} iconOnly leftIcon={<Plus />} onClick={() => setZoom((value) => Math.min(3, value + 0.25))} size="sm" variant="ghost" />
                <Button aria-label="Close image preview" iconOnly leftIcon={<X />} onClick={() => setOpen(false)} size="sm" variant="ghost" />
              </Inline>
            </Inline>
            <div className={styles.imageDialogCanvas}>
              {imageState === "loading" ? <div aria-live="polite" className={styles.imageState}><LoaderCircle aria-hidden className={styles.imageSpinner} /><span>Loading payment proof…</span></div> : null}
              {imageState === "error" ? <div className={styles.imageState} role="alert"><ImageOff aria-hidden /><strong>Payment proof unavailable</strong><span>The file may have been moved, deleted, or could not be loaded.</span></div> : null}
              <Image alt={alt} className={imageState === "error" ? styles.imageFailed : undefined} height={height ?? 1200} onError={() => setImageState("error")} onLoad={() => setImageState("ready")} src={src} style={{ transform: `scale(${zoom})` }} unoptimized width={width ?? 1600} />
            </div>
            <Inline className={styles.imageDialogFooter} justify="end">
              <Button as="a" download={downloadName} href={src} leftIcon={<Download />} size="sm" variant="secondary">Download proof</Button>
            </Inline>
          </Surface>
        </div>
      ) : null}
    </>
  );
}
