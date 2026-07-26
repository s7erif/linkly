"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, Search } from "lucide-react";
import { Button, Input } from "@/design/components";
import { Select } from "@/design/forms";
import { Inline } from "@/design/primitives";
import { useCustomerActions } from "./CustomerManager";
import styles from "./customers.module.css";

type ToolbarProps = {
  initialSearch: string;
  initialSortBy: string;
  initialSortDirection: string;
  initialStatus?: string;
};

export function CustomerToolbar({ initialSearch, initialSortBy, initialSortDirection, initialStatus }: ToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [searchDraft, setSearchDraft] = useState({ source: initialSearch, value: initialSearch });
  const search = searchDraft.source === initialSearch ? searchDraft.value : initialSearch;
  const initialized = useRef(false);
  const debounceRef = useRef<number | null>(null);

  const update = useCallback((changes: Record<string, string | undefined>) => {
    const query = new URLSearchParams(queryString);
    for (const [key, value] of Object.entries(changes)) value ? query.set(key, value) : query.delete(key);
    if (!("page" in changes)) query.delete("page");
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  }, [pathname, queryString, router]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    const normalized = search.trim();
    if (normalized === initialSearch) return;
    debounceRef.current = window.setTimeout(() => update({ search: normalized || undefined }), 350);
    return () => { if (debounceRef.current !== null) window.clearTimeout(debounceRef.current); };
  }, [initialSearch, search, update]);

  const submitSearch = () => {
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    update({ search: search.trim() || undefined });
  };

  const reset = () => {
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    setSearchDraft({ source: "", value: "" });
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className={styles.toolbar} role="search">
      <Input aria-label="Search customers" className={styles.searchInput} name="search" onChange={(event) => setSearchDraft({ source: initialSearch, value: event.target.value })} placeholder="Search customers, workspace, card or activation code..." prefix={<Search />} size="md" value={search} />
      <Select aria-label="Sort customers by" onChange={(event) => update({ sortBy: event.target.value })} options={[{ label: "Created", value: "createdAt" }, { label: "Name", value: "displayName" }, { label: "Status", value: "status" }]} value={initialSortBy} />
      <Inline className={styles.toolbarActions} gap="xs">
        <Button aria-label="Search customers" iconOnly leftIcon={<Search />} onClick={submitSearch} size="sm" variant="secondary" />
        <CustomerExportButton variant="ghost" />
        <Button onClick={reset} size="sm" variant="ghost">Reset</Button>
      </Inline>
      <div aria-label="Customer filters" className={styles.filters} id="customer-filters">
        <fieldset className={styles.filterGroup}>
          <legend>Status</legend>
          <Inline gap="xs" wrap>
            {[{ label: "All", value: undefined }, { label: "Active", value: "ACTIVE" }, { label: "Suspended", value: "SUSPENDED" }].map((option) => {
              const selected = (initialStatus || undefined) === option.value;
              return <button aria-pressed={selected} className={styles.filterChip} key={option.label} onClick={() => update({ status: option.value })} type="button">{option.label}</button>;
            })}
          </Inline>
        </fieldset>
        <fieldset className={styles.filterGroup}>
          <legend>Sort</legend>
          <Inline gap="xs" wrap>
            <button aria-pressed={initialSortDirection === "desc"} className={styles.filterChip} onClick={() => update({ sortDirection: "desc" })} type="button">Newest</button>
            <button aria-pressed={initialSortDirection === "asc"} className={styles.filterChip} onClick={() => update({ sortDirection: "asc" })} type="button">Oldest</button>
          </Inline>
        </fieldset>
      </div>
    </div>
  );
}

export function CustomerExportButton({ variant = "secondary" }: { variant?: "secondary" | "ghost" }) {
  const searchParams = useSearchParams();
  const { notify } = useCustomerActions();
  const [exporting, setExporting] = useState(false);
  const exportCustomers = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/customers/export?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "customers.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      notify("Customer export downloaded.");
    } catch {
      notify("Unable to export customers. Please try again.", "danger");
    } finally {
      setExporting(false);
    }
  };
  return <Button leftIcon={<Download />} loading={exporting} loadingLabel="Exporting customers" onClick={exportCustomers} size="sm" variant={variant}>Export</Button>;
}
