"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Heading, Inline, Stack, Surface, Text } from "../primitives";
import styles from "./components.module.css";

export type ConfirmationDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  description: ReactNode;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: ReactNode;
};

export function ConfirmationDialog({ cancelLabel = "Cancel", confirmLabel, description, loading, onCancel, onConfirm, open, title }: ConfirmationDialogProps) {
  const titleId = useId(), descriptionId = useId(), rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    rootRef.current?.querySelector<HTMLElement>("button")?.focus();
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape" && !loading) { event.preventDefault(); onCancel(); } };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [loading, onCancel, open]);
  if (!open) return null;
  return <div className={styles.confirmRoot} ref={rootRef}><button aria-label="Close confirmation" className={styles.confirmBackdrop} disabled={loading} onClick={onCancel} tabIndex={-1} type="button"/><Surface aria-describedby={descriptionId} aria-labelledby={titleId} aria-modal="true" as="section" className={styles.confirmDialog} radius="xl" role="alertdialog" variant="glass"><Stack gap="lg"><Inline align="start" gap="md"><AlertTriangle aria-hidden/><Stack gap="xs"><Heading id={titleId} level={2} variant="h3">{title}</Heading><Text id={descriptionId} tone="muted" variant="small">{description}</Text></Stack></Inline><Inline gap="sm" justify="end"><Button disabled={loading} onClick={onCancel} variant="secondary">{cancelLabel}</Button><Button loading={loading} loadingLabel={confirmLabel} onClick={onConfirm} variant="danger">{confirmLabel}</Button></Inline></Stack></Surface></div>;
}
