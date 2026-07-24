"use client";

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components";
import { Inline, Text } from "../primitives";
import styles from "./data-grid.module.css";

export type PaginationProps = {
  currentPage: number;
  label?: string;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  totalPages: number;
};

export function Pagination({
  currentPage,
  label = "Pagination",
  onPageChange,
  pageSize,
  totalItems,
  totalPages,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const rangeStart =
    totalItems !== undefined && pageSize !== undefined && totalItems > 0
      ? (safePage - 1) * pageSize + 1
      : undefined;
  const rangeEnd =
    rangeStart !== undefined && totalItems !== undefined && pageSize !== undefined
      ? Math.min(safePage * pageSize, totalItems)
      : undefined;

  return (
    <Inline
      aria-label={label}
      as="nav"
      className={styles.pagination}
      gap="md"
      justify="between"
      wrap
    >
      <Text aria-live="polite" tone="muted" variant="small">
        {rangeStart !== undefined && rangeEnd !== undefined
          ? rangeStart + "-" + rangeEnd + " of " + totalItems
          : "Page " + safePage + " of " + safeTotalPages}
      </Text>
      <Inline gap="xs">
        <Button aria-label="First page" disabled={safePage === 1} iconOnly leftIcon={<ChevronFirst />} onClick={() => onPageChange(1)} size="sm" variant="ghost" />
        <Button aria-label="Previous page" disabled={safePage === 1} iconOnly leftIcon={<ChevronLeft />} onClick={() => onPageChange(safePage - 1)} size="sm" variant="ghost" />
        <Text className={styles.pageStatus} variant="small">{safePage} / {safeTotalPages}</Text>
        <Button aria-label="Next page" disabled={safePage === safeTotalPages} iconOnly leftIcon={<ChevronRight />} onClick={() => onPageChange(safePage + 1)} size="sm" variant="ghost" />
        <Button aria-label="Last page" disabled={safePage === safeTotalPages} iconOnly leftIcon={<ChevronLast />} onClick={() => onPageChange(safeTotalPages)} size="sm" variant="ghost" />
      </Inline>
    </Inline>
  );
}
