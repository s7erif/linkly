"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, Search } from "lucide-react";
import { Button, Input } from "@/design/components";
import { Inline, Stack, Text } from "@/design/primitives";
import type { NfcCardStatus } from "@/types/nfc-card";
import styles from "./cards.module.css";

const filters: readonly { label: string; value?: NfcCardStatus }[] = [
  { label: "All" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Activated", value: "ACTIVATED" },
  { label: "Disabled", value: "DISABLED" },
  { label: "Lost", value: "LOST" },
  { label: "Archived", value: "ARCHIVED" },
];

export function CardsToolbar({
  initialSearch,
  initialStatus,
}: {
  initialSearch: string;
  initialStatus?: NfcCardStatus;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  // Use the string representation as the dependency — NOT the URLSearchParams
  // object.  useSearchParams() returns a new object reference on every render,
  // even when the underlying URL hasn't changed.  A string is compared by value,
  // so the callback stays stable across renders that don't change the URL.
  const paramsString = params.toString();
  const [search, setSearch] = useState(initialSearch);
  const [pending, startTransition] = useTransition();
  const initialized = useRef(false);

  const update = useCallback(
    (changes: Record<string, string | undefined>) => {
      const query = new URLSearchParams(paramsString);
      for (const [key, value] of Object.entries(changes)) {
        value ? query.set(key, value) : query.delete(key);
      }
      query.delete("page");
      startTransition(() => router.replace(`${pathname}?${query}`));
    },
    [paramsString, pathname, router],
  );

  useEffect(() => {
    // Skip the very first render — the URL already reflects the initial
    // search params from the server.
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    // If the search term already matches what's in the URL, there's
    // nothing to synchronise.  This also breaks the potential cycle:
    //   type → update URL → re-render → new params → effect fires again.
    const normalized = search.trim();
    if (normalized === (new URLSearchParams(paramsString).get("search") ?? "")) {
      return;
    }
    const timer = setTimeout(
      () => update({ search: normalized || undefined }),
      350,
    );
    return () => clearTimeout(timer);
  }, [search, update]);

  return (
    <Stack className={styles.toolbar} gap="sm">
      <Inline align="end" gap="sm" wrap>
        <div className={styles.search}>
          <Input
            aria-label="Search NFC cards"
            disabled={pending}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search activation token, customer or workspace..."
            prefix={<Search />}
            value={search}
          />
        </div>
        <Button
          aria-label="Refresh inventory"
          iconOnly
          leftIcon={<RefreshCw />}
          onClick={() => router.refresh()}
          size="sm"
          variant="ghost"
        />
      </Inline>
      <fieldset className={styles.filters}>
        <legend>Status</legend>
        <Inline gap="xs" wrap>
          {filters.map((filter) => (
            <button
              aria-pressed={
                initialStatus === filter.value ||
                (!initialStatus && !filter.value)
              }
              className={styles.filterChip}
              disabled={pending}
              key={filter.label}
              onClick={() => update({ status: filter.value })}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </Inline>
      </fieldset>
      <Text aria-live="polite" className={styles.visuallyHidden}>
        {pending ? "Updating inventory" : "Inventory updated"}
      </Text>
    </Stack>
  );
}
