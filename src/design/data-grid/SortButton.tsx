"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../components";
import type { SortDirection } from "./types";
import { nextSortDirection } from "./types";
import styles from "./data-grid.module.css";

export type SortButtonProps = {
  columnId: string;
  direction?: SortDirection;
  label: ReactNode;
  onSort: (columnId: string, direction: Exclude<SortDirection, null>) => void;
};

export function SortButton({
  columnId,
  direction = null,
  label,
  onSort,
}: SortButtonProps) {
  const icon =
    direction === "asc"
      ? <ArrowUp />
      : direction === "desc"
        ? <ArrowDown />
        : <ChevronsUpDown />;

  return (
    <Button
      aria-label={
        typeof label === "string"
          ? "Sort by " + label + ", currently " + (direction ?? "not sorted")
          : "Change column sorting"
      }
      className={styles.sortButton}
      onClick={() => onSort(columnId, nextSortDirection(direction))}
      rightIcon={icon}
      size="xs"
      variant="ghost"
    >
      {label}
    </Button>
  );
}
