import type { ReactNode, ThHTMLAttributes } from "react";
import { Text } from "../primitives";
import { cx } from "../primitives/utils";
import { SortButton } from "./SortButton";
import type { CellAlignment, SortDirection } from "./types";
import styles from "./data-grid.module.css";

export type ColumnHeaderProps = {
  align?: CellAlignment;
  children: ReactNode;
  columnId: string;
  direction?: SortDirection;
  sortable?: boolean;
  onSort?: (columnId: string, direction: Exclude<SortDirection, null>) => void;
} & Omit<ThHTMLAttributes<HTMLTableCellElement>, "style" | "color" | "align">;

const alignmentClasses: Record<CellAlignment, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
};

export function ColumnHeader({
  align = "start",
  children,
  className,
  columnId,
  direction = null,
  onSort,
  sortable = false,
  ...props
}: ColumnHeaderProps) {
  return (
    <th
      aria-sort={
        direction === "asc"
          ? "ascending"
          : direction === "desc"
            ? "descending"
            : sortable
              ? "none"
              : undefined
      }
      className={cx(styles.columnHeader, alignmentClasses[align], className)}
      scope="col"
      {...props}
    >
      {sortable && onSort ? (
        <SortButton
          columnId={columnId}
          direction={direction}
          label={children}
          onSort={onSort}
        />
      ) : (
        <Text as="span" variant="caption">{children}</Text>
      )}
    </th>
  );
}
