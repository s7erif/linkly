"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "../components";
import { Inline, Surface } from "../primitives";
import styles from "./data-grid.module.css";

export type FilterBarProps = {
  children: ReactNode;
  clearLabel?: string;
  hasActiveFilters?: boolean;
  onClear?: () => void;
};

export function FilterBar({
  children,
  clearLabel = "Clear filters",
  hasActiveFilters = false,
  onClear,
}: FilterBarProps) {
  return (
    <Surface aria-label="Data filters" as="section" className={styles.filterBar} radius="lg">
      <Inline gap="sm" justify="between" wrap>
        <Inline className={styles.filterControls} gap="sm" wrap>{children}</Inline>
        {onClear ? (
          <Button
            disabled={!hasActiveFilters}
            leftIcon={<X />}
            onClick={onClear}
            size="sm"
            variant="ghost"
          >
            {clearLabel}
          </Button>
        ) : null}
      </Inline>
    </Surface>
  );
}
