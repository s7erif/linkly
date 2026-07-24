import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../primitives/utils";
import styles from "./data-grid.module.css";

export type DataTableHeaderProps = {
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLTableSectionElement>, "style" | "color">;

export function DataTableHeader({ children, className, ...props }: DataTableHeaderProps) {
  return (
    <thead className={cx(styles.tableHeader, className)} {...props}>
      {children}
    </thead>
  );
}
