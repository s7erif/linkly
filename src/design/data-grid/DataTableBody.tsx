import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../primitives/utils";
import styles from "./data-grid.module.css";

export type DataTableBodyProps = {
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLTableSectionElement>, "style" | "color">;

export function DataTableBody({ children, className, ...props }: DataTableBodyProps) {
  return (
    <tbody className={cx(styles.tableBody, className)} {...props}>
      {children}
    </tbody>
  );
}
