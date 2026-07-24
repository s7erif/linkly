"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { Stack, Surface } from "../primitives";
import { ColumnHeader } from "./ColumnHeader";
import { DataTableBody } from "./DataTableBody";
import { DataTableCell } from "./DataTableCell";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableRow } from "./DataTableRow";
import { EmptyTableState } from "./EmptyTableState";
import { SelectionCheckbox } from "./SelectionCheckbox";
import { TableSkeleton } from "./TableSkeleton";
import type { DataGridColumn, DataGridSelectionChange, SortDirection } from "./types";
import { renderColumnValue } from "./types";
import styles from "./data-grid.module.css";

export type DataTableProps<T> = {
  bulkActions?: ReactNode;
  caption?: ReactNode;
  className?: string;
  columns: readonly DataGridColumn<T>[];
  emptyState?: ReactNode;
  getRowId: (row: T) => string;
  getRowLabel?: (row: T) => string;
  isRowSelectable?: (row: T) => boolean;
  loading?: boolean;
  onSelectionChange?: DataGridSelectionChange;
  onSort?: (columnId: string, direction: Exclude<SortDirection, null>) => void;
  pagination?: ReactNode;
  rows: readonly T[];
  selectable?: boolean;
  selectedRowIds?: readonly string[];
  skeletonRows?: number;
  sortAnnouncement?: string;
  toolbar?: ReactNode;
};

export function DataTable<T>({
  bulkActions,
  caption,
  className,
  columns,
  emptyState,
  getRowId,
  getRowLabel,
  isRowSelectable,
  loading = false,
  onSelectionChange,
  onSort,
  pagination,
  rows,
  selectable = false,
  selectedRowIds = [],
  skeletonRows = 5,
  sortAnnouncement,
  toolbar,
}: DataTableProps<T>) {
  const selectionEnabled = selectable && Boolean(onSelectionChange);
  const selectedIds = new Set(selectedRowIds);
  const selectableIds = rows
    .filter((row) => isRowSelectable?.(row) ?? true)
    .map(getRowId);
  const selectedVisibleCount = selectableIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = selectableIds.length > 0 && selectedVisibleCount === selectableIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;
  const activeSort = columns.find((column) => column.sortDirection);
  const announcedSort = sortAnnouncement ?? (
    activeSort && typeof activeSort.header === "string"
      ? activeSort.header + " sorted " + (activeSort.sortDirection === "asc" ? "ascending" : "descending")
      : ""
  );

  const updateVisibleSelection = (checked: boolean) => {
    const next = new Set(selectedRowIds);
    for (const id of selectableIds) checked ? next.add(id) : next.delete(id);
    onSelectionChange?.(Array.from(next));
  };

  const updateRowSelection = (rowId: string, checked: boolean) => {
    const next = new Set(selectedRowIds);
    checked ? next.add(rowId) : next.delete(rowId);
    onSelectionChange?.(Array.from(next));
  };

  const handleTableKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const current = (event.target as HTMLElement).closest<HTMLElement>("[data-grid-cell]");
    if (!current) return;

    const table = event.currentTarget;
    const rowIndex = Number(current.dataset.gridRow);
    const columnIndex = Number(current.dataset.gridColumn);
    const rowCells = Array.from(table.querySelectorAll<HTMLElement>('[data-grid-row="' + rowIndex + '"]'));
    const isRtl = getComputedStyle(table).direction === "rtl";
    let nextRow = rowIndex;
    let nextColumn = columnIndex;

    if (event.key === "ArrowUp") nextRow -= 1;
    if (event.key === "ArrowDown") nextRow += 1;
    if (event.key === "ArrowLeft") nextColumn += isRtl ? 1 : -1;
    if (event.key === "ArrowRight") nextColumn += isRtl ? -1 : 1;
    if (event.key === "Home") nextColumn = 0;
    if (event.key === "End") nextColumn = rowCells.length - 1;

    const next = table.querySelector<HTMLElement>(
      '[data-grid-row="' + nextRow + '"][data-grid-column="' + nextColumn + '"]',
    );
    if (!next) return;
    event.preventDefault();
    current.tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  };

  return (
    <Stack className={className} gap="md">
      {toolbar}
      {bulkActions}
      {loading ? (
        <TableSkeleton columns={columns.length + (selectionEnabled ? 1 : 0)} rows={skeletonRows} />
      ) : (
        <Surface className={styles.tableFrame} radius="lg" variant="standard">
          <div className={styles.tableScroller}>
            <table className={styles.table} onKeyDown={handleTableKeyDown}>
              {caption ? <caption className={styles.caption}>{caption}</caption> : null}
              <DataTableHeader>
                <DataTableRow>
                  {selectionEnabled ? (
                    <ColumnHeader className={styles.selectionColumn} columnId="selection">
                      <SelectionCheckbox
                        checked={allVisibleSelected}
                        disabled={selectableIds.length === 0}
                        indeterminate={someVisibleSelected}
                        label="Select all rows on this page"
                        onChange={updateVisibleSelection}
                      />
                    </ColumnHeader>
                  ) : null}
                  {columns.map((column) => (
                    <ColumnHeader
                      align={column.align}
                      className={column.hideOnMobile ? styles.mobileHidden : undefined}
                      columnId={column.id}
                      direction={column.sortDirection}
                      key={column.id}
                      onSort={onSort}
                      sortable={column.sortable}
                    >
                      {column.header}
                    </ColumnHeader>
                  ))}
                </DataTableRow>
              </DataTableHeader>
              <DataTableBody>
                {rows.length === 0 ? (
                  <DataTableRow>
                    <DataTableCell colSpan={columns.length + (selectionEnabled ? 1 : 0)}>
                      {emptyState ?? <EmptyTableState />}
                    </DataTableCell>
                  </DataTableRow>
                ) : rows.map((row, rowIndex) => {
                  const rowId = getRowId(row);
                  const rowSelected = selectedIds.has(rowId);
                  const rowSelectable = isRowSelectable?.(row) ?? true;
                  const columnOffset = selectionEnabled ? 1 : 0;
                  return (
                    <DataTableRow key={rowId} selected={selectionEnabled && rowSelected}>
                      {selectionEnabled ? (
                        <DataTableCell
                          className={styles.selectionColumn}
                          data-grid-cell
                          data-grid-column={0}
                          data-grid-row={rowIndex}
                          mobileLabel="Select"
                          tabIndex={rowIndex === 0 ? 0 : -1}
                        >
                          <SelectionCheckbox
                            checked={rowSelected}
                            disabled={!rowSelectable}
                            label={"Select " + (getRowLabel?.(row) ?? "row " + (rowIndex + 1))}
                            onChange={(checked) => updateRowSelection(rowId, checked)}
                          />
                        </DataTableCell>
                      ) : null}
                      {columns.map((column, columnIndex) => (
                        <DataTableCell
                          align={column.align}
                          className={column.hideOnMobile ? styles.mobileHidden : undefined}
                          data-grid-cell
                          data-grid-column={columnIndex + columnOffset}
                          data-grid-row={rowIndex}
                          key={column.id}
                          mobileLabel={column.mobileLabel}
                          tabIndex={!selectionEnabled && rowIndex === 0 && columnIndex === 0 ? 0 : -1}
                        >
                          {renderColumnValue(column, row)}
                        </DataTableCell>
                      ))}
                    </DataTableRow>
                  );
                })}
              </DataTableBody>
            </table>
          </div>
          <span aria-live="polite" className={styles.visuallyHidden}>{announcedSort}</span>
        </Surface>
      )}
      {pagination}
    </Stack>
  );
}
