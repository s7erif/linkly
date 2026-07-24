"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, Button } from "../components";
import { Inline, Surface, Text } from "../primitives";
import styles from "./data-grid.module.css";

export type BulkActionsProps = {
  children: ReactNode;
  clearLabel?: string;
  onClear?: () => void;
  selectedCount: number;
};

export function BulkActions({
  children,
  clearLabel = "Clear selection",
  onClear,
  selectedCount,
}: BulkActionsProps) {
  if (selectedCount < 1) return null;

  return (
    <Surface
      aria-label="Bulk actions"
      className={styles.bulkActions}
      radius="lg"
      role="region"
      variant="elevated"
    >
      <Inline gap="md" justify="between" wrap>
        <Inline gap="sm">
          <Badge variant="primary">{selectedCount}</Badge>
          <Text aria-live="polite" variant="small">
            {selectedCount} selected
          </Text>
        </Inline>
        <Inline gap="sm" wrap>
          {children}
          {onClear ? (
            <Button leftIcon={<X />} onClick={onClear} size="sm" variant="ghost">
              {clearLabel}
            </Button>
          ) : null}
        </Inline>
      </Inline>
    </Surface>
  );
}
