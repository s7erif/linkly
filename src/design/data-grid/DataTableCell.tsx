import type { ReactNode, TdHTMLAttributes } from "react";
import { cx } from "../primitives/utils";
import type { CellAlignment } from "./types";
import styles from "./data-grid.module.css";

export type DataTableCellProps = {
  align?: CellAlignment;
  children: ReactNode;
  mobileLabel?: string;
} & Omit<TdHTMLAttributes<HTMLTableCellElement>, "style" | "color" | "align">;

const alignmentClasses: Record<CellAlignment, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
};

export function DataTableCell({
  align = "start",
  children,
  className,
  mobileLabel,
  ...props
}: DataTableCellProps) {
  return (
    <td
      className={cx(styles.tableCell, alignmentClasses[align], className)}
      data-label={mobileLabel}
      {...props}
    >
      {children}
    </td>
  );
}
