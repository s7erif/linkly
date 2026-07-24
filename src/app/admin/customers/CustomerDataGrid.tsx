"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Copy, ExternalLink, MoreHorizontal, UsersRound } from "lucide-react";
import { Badge, Button, EmptyState, type BadgeVariant } from "@/design/components";
import { DataTable, Pagination, type DataGridColumn } from "@/design/data-grid";
import { Box, Inline, Stack, Text } from "@/design/primitives";
import { buildProfileUrl } from "@/lib/public-links";
import styles from "./customers.module.css";
import { useCustomerActions } from "./CustomerManager";

export type CustomerGridRow = {
  cardCount: number;
  createdAtLabel: string;
  createdAtValue: string;
  displayName: string;
  email: string | null;
  id: string;
  initials: string;
  phone: string | null;
  nfcCard: { id: string; activationToken: string; activatedAtLabel: string; status: string; workspaceSlug: string | null } | null;
  status: string;
  updatedAtLabel: string;
  updatedAtValue: string;
};

function editableCustomer(customer: CustomerGridRow) {
  return { id: customer.id, displayName: customer.displayName, email: customer.email, phone: customer.phone, status: customer.status, nfcCard: customer.nfcCard, createdAtLabel: customer.createdAtLabel, createdAtValue: customer.createdAtValue, updatedAtLabel: customer.updatedAtLabel, updatedAtValue: customer.updatedAtValue };
}

function CustomerName({ customer }: { customer: CustomerGridRow }) {
  const { openView } = useCustomerActions();
  return <button className={styles.customerLink} onClick={() => openView(editableCustomer(customer))} type="button">{customer.displayName}</button>;
}

function CustomerRowActions({ customer }: { customer: CustomerGridRow }) {
  const { busyCustomerId, openEdit, openView, remove } = useCustomerActions();
  const editable = editableCustomer(customer);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<CSSProperties | null>(null);
  const positionMenu = useCallback(() => {
    const trigger = detailsRef.current?.querySelector("summary");
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const triggerRect = trigger.getBoundingClientRect();
    const margin = 8;
    const gap = 8;
    const top = triggerRect.bottom + gap + panel.offsetHeight <= window.innerHeight - margin
      ? triggerRect.bottom + gap
      : Math.max(margin, triggerRect.top - panel.offsetHeight - gap);
    const left = Math.min(window.innerWidth - panel.offsetWidth - margin, Math.max(margin, triggerRect.right - panel.offsetWidth));
    setPosition({ left, top });
  }, []);

  useEffect(() => {
    if (!position) return;
    const reposition = () => positionMenu();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [position, positionMenu]);

  return (
    <details className={styles.actionMenu} onToggle={(event) => {
      if (event.currentTarget.open) requestAnimationFrame(positionMenu);
      else setPosition(null);
    }} ref={detailsRef}>
      <summary aria-label={"Actions for " + customer.displayName}><MoreHorizontal aria-hidden /></summary>
      <div className={styles.actionMenuPanel} data-positioned={Boolean(position)} ref={panelRef} style={position ?? undefined}>
        <button onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); openView(editable); }} type="button">View customer</button>
        <button onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); openEdit(editable); }} type="button">Edit customer</button>
        <button disabled={busyCustomerId === customer.id} onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); remove(editable); }} type="button">{busyCustomerId === customer.id ? "Deleting…" : "Delete customer"}</button>
      </div>
    </details>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase());
}

function statusTone(status: string): BadgeVariant {
  if (status === "ACTIVE") return "success";
  if (status === "SUSPENDED") return "warning";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

const columns: readonly DataGridColumn<CustomerGridRow>[] = [
  {
    id: "customer",
    header: "Customer",
    mobileLabel: "Customer",
    cell: (customer) => (
      <Inline align="center" gap="sm">
        <Box aria-hidden className={styles.avatar}>{customer.initials}</Box>
        <Stack gap="xs">
          <CustomerName customer={customer} />
          <Text tone="muted" variant="caption">{customer.email ?? "No email available"}</Text>
        </Stack>
      </Inline>
    ),
  },
  {
    id: "subscription",
    header: "Subscription",
    mobileLabel: "Subscription",
    cell: () => <Stack gap="xs"><Badge variant="neutral">Not available</Badge><Text tone="subtle" variant="caption">Pending data contract</Text></Stack>,
  },
  {
    id: "workspace",
    header: "Workspace",
    mobileLabel: "Workspace",
    cell: (customer) => (
      <Stack gap="xs">
        <Text tone="muted" variant="small">{customer.nfcCard?.workspaceSlug ?? "Not assigned"}</Text>
        <Inline gap="xs">
          <Button aria-label="Copy workspace URL" disabled={!customer.nfcCard?.workspaceSlug} iconOnly leftIcon={<Copy />} onClick={() => customer.nfcCard?.workspaceSlug && void navigator.clipboard.writeText(buildProfileUrl(customer.nfcCard.workspaceSlug))} size="xs" variant="ghost" />
          <Button aria-label="Open workspace" as={customer.nfcCard?.workspaceSlug ? "a" : "button"} disabled={!customer.nfcCard?.workspaceSlug} href={customer.nfcCard?.workspaceSlug ? `/workspace?slug=${customer.nfcCard.workspaceSlug}` : undefined} iconOnly leftIcon={<ExternalLink />} size="xs" variant="ghost" />
        </Inline>
      </Stack>
    ),
  },
  {
    id: "card",
    header: "Card",
    mobileLabel: "Card",
    cell: (customer) => <Stack gap="xs"><Text as="strong" variant="small">{customer.nfcCard?.activationToken ?? `${customer.cardCount} digital`}</Text><Text tone="subtle" variant="caption">{customer.nfcCard ? "Linked NFC card" : "No NFC card"}</Text></Stack>,
  },
  {
    id: "renewal",
    header: "Renewal",
    mobileLabel: "Renewal",
    cell: () => <Stack gap="xs"><Text as="strong" variant="small">—</Text><Text tone="subtle" variant="caption">Not available</Text></Stack>,
  },
  {
    id: "status",
    header: "Status",
    mobileLabel: "Status",
    cell: (customer) => <Stack gap="xs"><Badge variant={statusTone(customer.status)}>{formatLabel(customer.status)}</Badge><Text tone="subtle" variant="caption">Created {customer.createdAtLabel}</Text></Stack>,
  },
  {
    align: "end",
    id: "actions",
    header: "Actions",
    mobileLabel: "Actions",
    cell: (customer) => <CustomerRowActions customer={customer} />,
  },
];

export function CustomerDataGrid({
  currentPage,
  pageSize,
  queryString,
  rows,
  totalItems,
  totalPages,
}: {
  currentPage: number;
  pageSize: number;
  queryString: string;
  rows: readonly CustomerGridRow[];
  totalItems: number;
  totalPages: number;
}) {
  const router = useRouter();
  const { latestMutation, openView } = useCustomerActions();
  const visibleRows = useMemo(() => {
    if (!latestMutation) return rows;
    if (latestMutation.kind === "delete") return rows.filter((row) => row.id !== latestMutation.id);
    const customer = latestMutation.customer;
    const existing = rows.find((row) => row.id === customer.id);
    const next: CustomerGridRow = {
      cardCount: existing?.cardCount ?? 0,
      createdAtLabel: existing?.createdAtLabel ?? new Date().toLocaleDateString(),
      createdAtValue: existing?.createdAtValue ?? customer.createdAtValue,
      displayName: customer.displayName,
      email: customer.email,
      id: customer.id,
      initials: customer.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "CU",
      phone: customer.phone,
      nfcCard: existing?.nfcCard ?? customer.nfcCard,
      status: customer.status,
      updatedAtLabel: customer.updatedAtLabel,
      updatedAtValue: customer.updatedAtValue,
    };
    return existing ? rows.map((row) => row.id === customer.id ? next : row) : [next, ...rows];
  }, [latestMutation, rows]);
  const changePage = (page: number) => {
    const query = new URLSearchParams(queryString);
    query.set("page", String(page));
    router.push("/admin/customers?" + query.toString());
  };

  const rowForTarget = (target: EventTarget) => {
    if (!(target instanceof Element)) return null;
    const row = target.closest<HTMLTableRowElement>("tbody tr");
    if (!row) return null;
    return visibleRows[row.sectionRowIndex] ?? null;
  };

  return (
    <div
      className={styles.customerTableInteraction}
      onClick={(event) => {
        if ((event.target as Element).closest("a, button, input, select, textarea, summary")) return;
        const customer = rowForTarget(event.target);
        if (!customer) return;
        (event.target as Element).closest<HTMLTableRowElement>("tr")?.querySelector<HTMLElement>("[data-grid-cell]")?.focus();
        openView(editableCustomer(customer));
      }}
      onKeyDownCapture={(event) => {
        if (event.key !== "Enter" || (event.target as Element).closest("a, button, input, select, textarea, summary")) return;
        const customer = rowForTarget(event.target);
        if (!customer) return;
        event.preventDefault();
        openView(editableCustomer(customer));
      }}
    >
      <DataTable
      caption="Customer accounts, subscription availability, workspaces, cards, renewals and lifecycle status"
      className={styles.dataGrid}
      columns={columns}
      emptyState={(
        <EmptyState
          description="Customers appear here after successfully activating an NFC product."
          illustration={<Box aria-hidden className={styles.emptyIllustration}><UsersRound /></Box>}
          title="No activated customers"
        />
      )}
      getRowId={(customer) => customer.id}
      pagination={<Pagination currentPage={currentPage} onPageChange={changePage} pageSize={pageSize} totalItems={totalItems} totalPages={totalPages} />}
      rows={visibleRows}
      />
    </div>
  );
}
