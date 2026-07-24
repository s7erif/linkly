"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "../components";
import { Surface } from "../primitives";
import { Sidebar } from "./Sidebar";
import type { NavigationGroupModel } from "./types";
import styles from "./navigation.module.css";

export type MobileDrawerProps = {
  brand?: ReactNode;
  groups: readonly NavigationGroupModel[];
  label?: string;
  onClose: () => void;
  open: boolean;
  platformName?: string;
};

function drawerFocusables(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a:not([aria-disabled="true"]), button:not(:disabled), summary, [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function MobileDrawer({
  brand,
  groups,
  label = "Mobile navigation",
  onClose,
  open,
  platformName,
}: MobileDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerFocusables(dialog ?? document.body)[0]?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;

    const items = drawerFocusables(dialogRef.current);
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

  return (
    <div className={styles.drawerLayer}>
      <button
        aria-label="Close navigation"
        className={styles.drawerBackdrop}
        onClick={onClose}
        type="button"
      />
      <div
        aria-label={label}
        aria-modal="true"
        className={styles.drawer}
        onClick={(event) => { if ((event.target as HTMLElement).closest("a[href]")) onClose(); }}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <Surface className={styles.drawerSurface} radius="none" variant="overlay">
        <Button
          aria-label="Close navigation"
          className={styles.drawerClose}
          iconOnly
          leftIcon={<X />}
          onClick={onClose}
          size="sm"
          variant="ghost"
        />
          <Sidebar brand={brand} groups={groups} label={label} platformName={platformName} />
        </Surface>
      </div>
    </div>
  );
}
