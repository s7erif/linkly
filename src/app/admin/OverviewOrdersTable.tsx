"use client";

import { Badge, Button, type BadgeVariant } from "@/design/components";
import { DataTable, type DataGridColumn } from "@/design/data-grid";
import { Text } from "@/design/primitives";
import styles from "./overview.module.css";

export type OverviewOrderRow = {
  createdAtLabel: string;
  customerName: string;
  id: string;
  orderNumber: string;
  status: string;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase());
}

function orderTone(status: string): BadgeVariant {
  if (status === "COMPLETED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

const columns: readonly DataGridColumn<OverviewOrderRow>[] = [
  {
    id: "order",
    header: "Order",
    mobileLabel: "Order",
    cell: (order) => <Button className={styles.orderLink} data-order-customer={order.customerName} data-order-detail={order.id} data-order-number={order.orderNumber} data-order-status={formatLabel(order.status)} size="xs" variant="link">{order.orderNumber}</Button>,
  },
  {
    id: "customer",
    header: "Customer",
    mobileLabel: "Customer",
    cell: (order) => <Text as="span" variant="small">{order.customerName}</Text>,
  },
  {
    id: "status",
    header: "Status",
    mobileLabel: "Status",
    cell: (order) => <Badge variant={orderTone(order.status)}>{formatLabel(order.status)}</Badge>,
  },
  {
    id: "created",
    header: "Created",
    mobileLabel: "Created",
    cell: (order) => <Text as="span" tone="muted" variant="small">{order.createdAtLabel}</Text>,
  },
];

export function OverviewOrdersTable({ rows }: { rows: readonly OverviewOrderRow[] }) {
  return (
    <DataTable
      caption="Five most recently submitted orders"
      className={styles.dataGrid}
      columns={columns}
      getRowId={(order) => order.id}
      rows={rows}
    />
  );
}
