"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { Heading, Inline, Stack, Surface, Text } from "../primitives";
import styles from "./components.module.css";

export type DrawerProps = {
  children: ReactNode;
  closeHref?: string;
  onClose?: () => void;
  description?: ReactNode;
  footer?: ReactNode;
  open?: boolean;
  title: ReactNode;
};

export function Drawer({ children, closeHref, description, footer, onClose, open = true, title }: DrawerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => { if (onClose) onClose(); else if (closeHref) window.location.assign(closeHref); }, [closeHref, onClose]);

  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableSelector = "a[href]:not([tabindex='-1']), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusable = () => Array.from(root?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    focusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [close, open]);

  if (!open) return null;
  return (
    <div className={styles.drawerRoot} ref={rootRef}>
      <button aria-label="Close drawer" className={styles.drawerBackdrop} onClick={close} tabIndex={-1} type="button" />
      <Surface aria-describedby={description ? "oi-drawer-description" : undefined} aria-labelledby="oi-drawer-title" aria-modal="true" as="aside" className={styles.drawer} radius="xl" role="dialog" variant="glass">
        <Inline align="start" className={styles.drawerHeader} gap="md" justify="between">
          <Stack gap="xs">
            <Heading id="oi-drawer-title" level={2} variant="h3">{title}</Heading>
            {description ? <Text id="oi-drawer-description" tone="muted" variant="small">{description}</Text> : null}
          </Stack>
          <Button aria-label="Close drawer" iconOnly leftIcon={<X />} onClick={close} size="sm" variant="ghost" />
        </Inline>
        <div className={styles.drawerBody}>{children}</div>
        {footer ? <div className={styles.drawerFooter}>{footer}</div> : null}
      </Surface>
    </div>
  );
}
