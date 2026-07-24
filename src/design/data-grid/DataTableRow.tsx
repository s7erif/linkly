import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../primitives/utils";
import styles from "./data-grid.module.css";

export type DataTableRowProps = {
  children: ReactNode;
  selected?: boolean;
} & Omit<HTMLAttributes<HTMLTableRowElement>, "style" | "color">;

export function DataTableRow({
  children,
  className,
  selected = false,
  ...props
}: DataTableRowProps) {
  return (
    <tr
      aria-selected={selected || undefined}
      className={cx(styles.tableRow, selected && styles.tableRowSelected, className)}
      {...props}
    >
      {children}
    </tr>
  );
}
