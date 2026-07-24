import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc" | null;
export type CellAlignment = "start" | "center" | "end";

export type DataGridColumn<T> = {
  id: string;
  header: ReactNode;
  mobileLabel: string;
  accessor?: keyof T | ((row: T) => ReactNode);
  cell?: (row: T) => ReactNode;
  align?: CellAlignment;
  sortable?: boolean;
  sortDirection?: SortDirection;
  hideOnMobile?: boolean;
};

export type DataGridSelectionChange = (selectedIds: readonly string[]) => void;

export function renderColumnValue<T>(column: DataGridColumn<T>, row: T): ReactNode {
  if (column.cell) return column.cell(row);
  if (typeof column.accessor === "function") return column.accessor(row);
  if (column.accessor !== undefined) return row[column.accessor] as ReactNode;
  return null;
}

export function nextSortDirection(direction: SortDirection): Exclude<SortDirection, null> {
  return direction === "asc" ? "desc" : "asc";
}
