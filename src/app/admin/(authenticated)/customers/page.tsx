import { adminReadService } from "@/lib/composition-root";
import { AdminPageHeader, Badge } from "@/design/components";
import { Heading, Inline, Stack, Text } from "@/design/primitives";
import { first, type SearchRecord } from "@/features/admin/admin-query";
import { CustomerDataGrid, type CustomerGridRow } from "./CustomerDataGrid";
import { CustomerExportButton, CustomerToolbar } from "./CustomerToolbar";
import styles from "./customers.module.css";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<SearchRecord> }) {
  const params = await searchParams;
  const query = {
    search: first(params.search),
    status: first(params.status),
    page: first(params.page),
    pageSize: first(params.pageSize),
    sortBy: first(params.sortBy),
    sortDirection: first(params.sortDirection),
  };
  const result = await adminReadService.listCustomers(query);
  const rows: readonly CustomerGridRow[] = result.items.map((customer) => ({
    cardCount: customer.cardCount,
    createdAtLabel: customer.createdAt.toLocaleDateString(),
    createdAtValue: customer.createdAt.toISOString(),
    displayName: customer.displayName,
    email: customer.email,
    id: customer.id,
    initials: customer.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "CU",
    status: customer.status,
    phone: customer.phone,
    nfcCard: customer.nfcCard ? { ...customer.nfcCard, activatedAtLabel: customer.nfcCard.activatedAt?.toLocaleString() ?? "Not activated" } : null,
    updatedAtLabel: customer.updatedAt.toLocaleString(),
    updatedAtValue: customer.updatedAt.toISOString(),
  }));
  const preservedQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const item = first(value);
    if (item && key !== "page") preservedQuery.set(key, item);
  }

  return (
    <Stack className={styles.page} gap="md">
      <AdminPageHeader actions={<CustomerExportButton/>} breadcrumbs={[{id:"overview",label:"Overview",href:"/admin"},{id:"customers",label:"Customers",current:true}]} description="Manage subscriptions, workspaces, digital cards and customer accounts." eyebrow="Customer operations" title="Customers"/>

      <section aria-labelledby="customer-directory-title" className={styles.workspace}>
        <CustomerToolbar initialSearch={query.search ?? ""} initialSortBy={query.sortBy ?? "createdAt"} initialSortDirection={query.sortDirection ?? "desc"} initialStatus={query.status} />

        <Inline align="center" className={styles.directoryHeader} gap="md" justify="between">
          <Stack gap="xs">
            <Heading id="customer-directory-title" level={2} variant="title">Customers</Heading>
            <Text tone="muted" variant="caption">Identity, ownership and account status</Text>
          </Stack>
          <Badge variant="neutral">{result.total} result{result.total === 1 ? "" : "s"}</Badge>
        </Inline>

        <CustomerDataGrid
          currentPage={result.page}
          pageSize={result.pageSize}
          queryString={preservedQuery.toString()}
          rows={rows}
          totalItems={result.total}
          totalPages={result.totalPages}
        />
      </section>
    </Stack>
  );
}
