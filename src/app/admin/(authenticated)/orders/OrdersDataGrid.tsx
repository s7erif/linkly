"use client";

import type { ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { Badge, Button, EmptyState } from "@/design/components";
import { DataTable, type DataGridColumn } from "@/design/data-grid";
import { Stack, Text } from "@/design/primitives";

export type OrderGridRow = { billing: string; created: string; createdIso: string; customer: string; email: string; id: string; number: string; packageName: string; payment: string; status: string; workspace: string };
const badgeVariant = (value: string): "success" | "danger" | "warning" | "neutral" => value === "Paid" || value === "Completed" ? "success" : value === "Cancelled" || value === "Failed" ? "danger" : value === "Pending" ? "warning" : "neutral";
const columns: readonly DataGridColumn<OrderGridRow>[] = [{ id: "order", header: "Order", mobileLabel: "Order", cell: (row) => <Button data-order-customer={row.customer} data-order-detail={row.id} data-order-number={row.number} data-order-status={row.status} size="xs" variant="link">{row.number}</Button> }, { id: "customer", header: "Customer", mobileLabel: "Customer", cell: (row) => <Stack gap="xs"><Text as="strong" variant="small">{row.customer}</Text><Text tone="muted" variant="caption">{row.email}</Text></Stack> }, { id: "package", header: "Package", mobileLabel: "Package", cell: (row) => <Stack gap="xs"><Text as="strong" variant="small">{row.packageName}</Text><Text tone="muted" variant="caption">{row.billing}</Text></Stack> }, { id: "payment", header: "Payment", mobileLabel: "Payment", cell: (row) => <Badge variant={badgeVariant(row.payment)}>{row.payment}</Badge> }, { id: "status", header: "Status", mobileLabel: "Status", cell: (row) => <Badge variant={badgeVariant(row.status)}>{row.status}</Badge> }, { id: "workspace", header: "Workspace", mobileLabel: "Workspace", accessor: "workspace" }, { id: "created", header: "Created", mobileLabel: "Created", cell: (row) => <time dateTime={row.createdIso}>{row.created}</time> }, { id: "actions", header: "Actions", mobileLabel: "Actions", cell: (row) => <Button data-order-customer={row.customer} data-order-detail={row.id} data-order-number={row.number} data-order-status={row.status} size="xs" variant="ghost">View</Button> }];

export function OrdersDataGrid({ pagination, rows }: { pagination?: ReactNode; rows: readonly OrderGridRow[] }) {
  return <DataTable caption="Digital orders" columns={columns} emptyState={<EmptyState actions={<Button as="a" href="/admin/orders" variant="secondary">Clear filters</Button>} description="Adjust the filters or wait for a new digital service purchase." icon={<ShoppingBag/>} title="No digital orders found"/>} getRowId={(row) => row.id} getRowLabel={(row) => row.number} pagination={pagination} rows={rows}/>;
}
