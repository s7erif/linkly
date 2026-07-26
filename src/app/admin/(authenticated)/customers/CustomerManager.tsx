"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition, type FormEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Archive, CheckCircle2, Clipboard, Mail, Pencil, X } from "lucide-react";
import { Badge, Button, Input, Skeleton } from "@/design/components";
import { Select } from "@/design/forms";
import { Box, Heading, Inline, Stack, Text } from "@/design/primitives";
import { deleteCustomerAction, saveCustomerAction, type CustomerMutationResult } from "@/features/admin/customer-actions";
import { loadCustomerDrawer } from "../entity-drawer-actions";
import styles from "./customers.module.css";

export type EditableCustomer = {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  status: string;
  nfcCard: { id: string; activationToken: string; activatedAtLabel: string; status: string; workspaceSlug: string | null } | null;
  createdAtLabel: string;
  createdAtValue: string;
  updatedAtLabel: string;
  updatedAtValue: string;
};

type CustomerManagerValue = {
  busyCustomerId: string | null;
  latestMutation: { kind: "save"; customer: EditableCustomer } | { kind: "delete"; id: string } | null;
  notify: (message: string, tone?: "success" | "danger") => void;
  openEdit: (customer: EditableCustomer) => void;
  openView: (customer: EditableCustomer) => void;
  openViewById: (customerId: string) => void;
  remove: (customer: EditableCustomer) => Promise<boolean>;
};

type DrawerState = { mode: "edit" | "view"; customer: EditableCustomer; loading?: boolean };
const CUSTOMER_CACHE_TTL_MS = 60_000;
type DrawerProps = {
  state: DrawerState | null;
  onArchive: (customer: EditableCustomer) => Promise<boolean>;
  onClose: () => void;
  onSaved: (result: CustomerMutationResult, customer: EditableCustomer) => void;
  notify: CustomerManagerValue["notify"];
};

const CustomerManagerContext = createContext<CustomerManagerValue | null>(null);

function useCustomerManager() {
  const value = useContext(CustomerManagerContext);
  if (!value) throw new Error("Customer actions must be rendered inside CustomerManager");
  return value;
}

function focusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('a[href], input:not(:disabled), select:not(:disabled), button:not(:disabled), [tabindex]:not([tabindex="-1"])'));
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "CU";
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase());
}

function statusVariant(status: string) {
  return status === "ACTIVE" ? "success" as const : status === "SUSPENDED" ? "warning" as const : "neutral" as const;
}

function CustomerFields({ customer, result }: { customer?: EditableCustomer; result: CustomerMutationResult | null }) {
  return (
    <Stack className={styles.customerDrawerFields} gap="md">
      {result && !result.ok ? <p className={styles.customerFormError} role="alert">{result.message}</p> : null}
      <Input autoComplete="name" defaultValue={customer?.displayName ?? ""} error={result?.fieldErrors?.displayName} label="Full Name" name="displayName" required />
      <Input autoComplete="email" defaultValue={customer?.email ?? ""} error={result?.fieldErrors?.email} label="Email Address" name="email" required type="email" />
      <Input autoComplete="tel" defaultValue={customer?.phone ?? ""} error={result?.fieldErrors?.phone} label="Phone" name="phone" type="tel" />
      <Select defaultValue={customer?.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE"} label="Status" name="status" options={[{ label: "Active", value: "ACTIVE" }, { label: "Suspended", value: "SUSPENDED" }]} />
    </Stack>
  );
}

function CustomerOverview({ customer }: { customer: EditableCustomer }) {
  const items = [
    ["Full Name", customer.displayName],
    ["Email", customer.email ?? "Not provided"],
    ["Phone", customer.phone ?? "Not provided"],
    ["Status", formatLabel(customer.status)],
    ["Customer ID", customer.id],
    ["Created At", customer.createdAtLabel],
    ["Last Updated", customer.updatedAtLabel],
    ["Activation Token", customer.nfcCard?.activationToken ?? "No NFC card assigned"],
    ["Activation Date", customer.nfcCard?.activatedAtLabel ?? "Not activated"],
    ["Current Card Status", customer.nfcCard ? formatLabel(customer.nfcCard.status) : "Not assigned"],
  ] as const;
  return (
    <dl className={styles.customerDetails}>
      {items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  );
}

function CustomerActivity({ customer }: { customer: EditableCustomer }) {
  const wasEdited = new Date(customer.updatedAtValue).getTime() - new Date(customer.createdAtValue).getTime() > 1000;
  return (
    <Stack aria-label="Customer activity timeline" className={styles.customerTimeline} gap="none">
      {wasEdited ? <article><Box aria-hidden className={styles.timelineMarker} /><Stack gap="xs"><Text as="strong" variant="small">Customer edited</Text><Text tone="muted" variant="caption">Customer details were last updated {customer.updatedAtLabel}.</Text></Stack></article> : null}
      <article><Box aria-hidden className={styles.timelineMarker} /><Stack gap="xs"><Text as="strong" variant="small">Customer created</Text><Text tone="muted" variant="caption">Customer account was created {customer.createdAtLabel}.</Text></Stack></article>
      {!wasEdited ? <Text className={styles.activityEmpty} tone="subtle" variant="caption">No additional customer activity is available yet.</Text> : null}
    </Stack>
  );
}

function CustomerDrawer({ state, onArchive, onClose, onSaved, notify }: DrawerProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const customer = state?.customer;
  const loading = state?.loading ?? false;
  const [tab, setTab] = useState<"overview" | "activity">("overview");
  const [editing, setEditing] = useState(state?.mode === "edit");
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<CustomerMutationResult | null>(null);

  useEffect(() => {
    if (!state) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const selector = state.mode === "edit" ? 'input[name="displayName"]' : '[data-drawer-initial-focus]';
    dialogRef.current?.querySelector<HTMLElement>(selector)?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [state]);

  if (!state || !customer) return null;

  const requestClose = () => {
    if (pending) return;
    if (dirty && !window.confirm("Discard unsaved customer changes?")) return;
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const items = focusable(dialogRef.current);
    const first = items[0];
    const last = items.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextTab = tab === "overview" ? "activity" : "overview";
    setTab(nextTab);
    dialogRef.current?.querySelector<HTMLButtonElement>(`#customer-${nextTab}-tab`)?.focus();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const next = await saveCustomerAction({
        id: customer.id,
        displayName: String(form.get("displayName") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        status: String(form.get("status") ?? "ACTIVE") as "ACTIVE" | "SUSPENDED",
      });
      setResult(next);
      if (next.ok) {
        const now = new Date();
        setDirty(false);
        onSaved(next, {
          id: next.customerId ?? customer.id,
          displayName: String(form.get("displayName") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? "") || null,
          status: String(form.get("status") ?? "ACTIVE"),
          createdAtLabel: customer.createdAtLabel,
          createdAtValue: customer.createdAtValue,
          updatedAtLabel: now.toLocaleString(),
          updatedAtValue: now.toISOString(),
          nfcCard: customer.nfcCard,
        });
      }
    });
  };

  const copy = async (label: string, value: string | null) => {
    if (!value) return;
    const legacyCopy = () => {
      const field = document.createElement("textarea");
      field.className = styles.clipboardFallback;
      field.value = value;
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) throw new Error("Clipboard unavailable");
    };
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        legacyCopy();
      }
      notify(`${label} copied to clipboard.`);
    } catch {
      try {
        legacyCopy();
        notify(`${label} copied to clipboard.`);
      } catch {
        notify(`Unable to copy ${label.toLowerCase()}.`, "danger");
      }
    }
  };

  const archive = async () => {
    if (!customer || pending) return;
    if (await onArchive(customer)) onClose();
  };

  const showEditor = editing;
  return (
    <div className={styles.customerDrawerLayer}>
      <button aria-label="Close customer drawer" className={styles.customerDrawerBackdrop} onClick={requestClose} type="button" />
      <aside aria-labelledby="customer-drawer-title" aria-modal="true" className={styles.customerDrawer} onKeyDown={handleKeyDown} ref={dialogRef} role="dialog">
        {customer ? (
          <>
            <header className={styles.customerProfileHeader}>
              <Inline align="start" gap="md" justify="between">
                <Inline align="center" gap="md">
                  <Box aria-hidden className={styles.drawerAvatar}>{initials(customer.displayName)}</Box>
                  <Stack gap="xs">
                    <Inline align="center" gap="sm" wrap><Heading id="customer-drawer-title" level={2} variant="title">{customer.displayName}</Heading><Badge variant={statusVariant(customer.status)}>{formatLabel(customer.status)}</Badge></Inline>
                    <Text tone="muted" variant="small">{customer.email ?? "No email available"}</Text>
                    <Text tone="subtle" variant="caption">Customer since {customer.createdAtLabel}</Text>
                  </Stack>
                </Inline>
                <Button aria-label="Close customer drawer" data-drawer-initial-focus disabled={pending} iconOnly leftIcon={<X />} onClick={requestClose} size="sm" variant="ghost" />
              </Inline>
              {!loading ? <Inline aria-label="Customer quick actions" className={styles.customerQuickActions} gap="xs" wrap>
                <Button leftIcon={<Pencil />} onClick={() => { setTab("overview"); setEditing(true); }} size="sm" variant="secondary">Edit</Button>
                <Button disabled={pending} leftIcon={<Archive />} onClick={() => void archive()} size="sm" variant="danger">Archive</Button>
                <Button disabled={!customer.email} leftIcon={<Mail />} onClick={() => void copy("Email", customer.email)} size="sm" variant="ghost">Copy Email</Button>
                <Button leftIcon={<Clipboard />} onClick={() => void copy("Customer ID", customer.id)} size="sm" variant="ghost">Copy ID</Button>
                {customer.nfcCard ? <Button as="a" href={`/admin/cards?search=${encodeURIComponent(customer.nfcCard.activationToken)}`} size="sm" variant="ghost">Open Card</Button> : null}
                {customer.nfcCard?.workspaceSlug ? <Button as="a" href={`/workspace?slug=${encodeURIComponent(customer.nfcCard.workspaceSlug)}`} size="sm" variant="ghost">Open Workspace</Button> : null}
              </Inline> : null}
            </header>
            {loading ? <Stack aria-busy="true" aria-label="Loading customer details" gap="lg"><Skeleton variant="title"/><Skeleton variant="card"/><Skeleton variant="card"/></Stack> : <>
            <div aria-label="Customer details" className={styles.customerTabs} role="tablist">
              <button aria-controls="customer-overview-panel" aria-selected={tab === "overview"} id="customer-overview-tab" onClick={() => setTab("overview")} onKeyDown={handleTabKeyDown} role="tab" tabIndex={tab === "overview" ? 0 : -1} type="button">Overview</button>
              <button aria-controls="customer-activity-panel" aria-selected={tab === "activity"} id="customer-activity-tab" onClick={() => setTab("activity")} onKeyDown={handleTabKeyDown} role="tab" tabIndex={tab === "activity" ? 0 : -1} type="button">Activity</button>
            </div>
            {tab === "overview" ? (
              <section aria-labelledby="customer-overview-tab" id="customer-overview-panel" role="tabpanel">
                {showEditor ? (
                  <form className={styles.customerDrawerForm} onChange={() => setDirty(true)} onSubmit={submit}>
                    <CustomerFields customer={customer} result={result} />
                    <Inline className={styles.customerDrawerActions} gap="sm" justify="end"><Button disabled={pending} onClick={() => { setEditing(false); setDirty(false); setResult(null); }} variant="secondary">Cancel</Button><Button loading={pending} loadingLabel="Saving customer" type="submit">Save Changes</Button></Inline>
                  </form>
                ) : <CustomerOverview customer={customer} />}
              </section>
            ) : <section aria-labelledby="customer-activity-tab" className={styles.customerActivityPanel} id="customer-activity-panel" role="tabpanel"><CustomerActivity customer={customer} /></section>}
            </>}
          </>
        ) : null}
      </aside>
    </div>
  );
}

export function CustomerManager({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "danger" } | null>(null);
  const [busyCustomerId, setBusyCustomerId] = useState<string | null>(null);
  const [latestMutation, setLatestMutation] = useState<CustomerManagerValue["latestMutation"]>(null);
  const cacheRef = useRef(new Map<string, { customer: EditableCustomer; loadedAt: number }>());
  const inFlightRef = useRef(new Map<string, ReturnType<typeof loadCustomerDrawer>>());
  const requestRef = useRef(0);

  const notify = useCallback((message: string, tone: "success" | "danger" = "success") => setToast({ message, tone }), []);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const remove = useCallback(async (customer: EditableCustomer) => {
    if (busyCustomerId || !window.confirm(`Archive ${customer.displayName}? This customer will be removed from the directory.`)) return false;
    setBusyCustomerId(customer.id);
    try {
      const result = await deleteCustomerAction(customer.id);
      notify(result.message, result.ok ? "success" : "danger");
      if (!result.ok) return false;
      setLatestMutation({ kind: "delete", id: customer.id });
      router.refresh();
      return true;
    } catch {
      notify("Unable to archive this customer. Please try again.", "danger");
      return false;
    } finally {
      setBusyCustomerId(null);
    }
  }, [busyCustomerId, notify, router]);

  const updateCustomerUrl = useCallback((customerId: string) => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("customerId") === customerId) return;
    url.searchParams.set("customerId", customerId);
    window.history.pushState({ ...window.history.state, oiDrawer: "customer" }, "", url);
  }, []);

  const closeDrawer = useCallback(() => {
    requestRef.current += 1;
    setDrawer(null);
    const url = new URL(window.location.href);
    if (!url.searchParams.has("customerId")) return;
    if (window.history.state?.oiDrawer === "customer") window.history.back();
    else {
      url.searchParams.delete("customerId");
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);

  const openViewById = useCallback(async (customerId: string, updateUrl = true) => {
    const request = requestRef.current + 1;
    requestRef.current = request;
    const cached = cacheRef.current.get(customerId);
    const fresh = cached && Date.now() - cached.loadedAt < CUSTOMER_CACHE_TTL_MS ? cached.customer : null;
    if (fresh) setDrawer({ mode: "view", customer: fresh });
    else setDrawer({ mode: "view", loading: true, customer: { id: customerId, displayName: "Customer details", email: null, phone: null, status: "ACTIVE", nfcCard: null, createdAtLabel: "Loading…", createdAtValue: new Date(0).toISOString(), updatedAtLabel: "Loading…", updatedAtValue: new Date(0).toISOString() } });
    if (updateUrl) updateCustomerUrl(customerId);
    if (fresh) return;
    let requestPromise = inFlightRef.current.get(customerId);
    if (!requestPromise) {
      requestPromise = loadCustomerDrawer(customerId);
      inFlightRef.current.set(customerId, requestPromise);
    }
    const result = await requestPromise;
    if (inFlightRef.current.get(customerId) === requestPromise) inFlightRef.current.delete(customerId);
    if (requestRef.current !== request) return;
    if (result.ok) {
      cacheRef.current.set(customerId, { customer: result.detail, loadedAt: Date.now() });
      setDrawer({ mode: "view", customer: result.detail });
    } else {
      setDrawer(null);
      notify(result.message, "danger");
    }
  }, [notify, updateCustomerUrl]);

  useEffect(() => {
    const syncFromUrl = () => {
      const customerId = new URL(window.location.href).searchParams.get("customerId");
      if (customerId) void openViewById(customerId, false);
      else {
        requestRef.current += 1;
        setDrawer(null);
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [openViewById]);

  const value = useMemo<CustomerManagerValue>(() => ({
    busyCustomerId,
    latestMutation,
    notify,
    openEdit: (customer) => { cacheRef.current.set(customer.id, { customer, loadedAt: Date.now() }); updateCustomerUrl(customer.id); setDrawer({ mode: "edit", customer }); },
    openView: (customer) => { cacheRef.current.set(customer.id, { customer, loadedAt: Date.now() }); updateCustomerUrl(customer.id); setDrawer({ mode: "view", customer }); },
    openViewById: (customerId) => void openViewById(customerId),
    remove,
  }), [busyCustomerId, latestMutation, notify, openViewById, remove, updateCustomerUrl]);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const trigger = (event.target as Element).closest<HTMLElement>("[data-customer-detail]");
    const customerId = trigger?.dataset.customerDetail;
    if (!customerId) return;
    event.preventDefault();
    void openViewById(customerId);
  };

  return (
    <CustomerManagerContext.Provider value={value}>
      <div onClick={handleClick}>{children}</div>
      <CustomerDrawer key={drawer ? `${drawer.mode}-${drawer.customer.id}` : "closed"} notify={notify} onArchive={remove} onClose={closeDrawer} onSaved={(result, customer) => { closeDrawer(); setLatestMutation({ kind: "save", customer }); notify(result.message); router.refresh(); }} state={drawer} />
      {toast ? <div className={styles.customerToast} data-tone={toast.tone} role={toast.tone === "danger" ? "alert" : "status"}><CheckCircle2 aria-hidden />{toast.message}<Button aria-label="Dismiss notification" iconOnly leftIcon={<X />} onClick={() => setToast(null)} size="xs" variant="ghost" /></div> : null}
    </CustomerManagerContext.Provider>
  );
}

export function useCustomerActions() {
  return useCustomerManager();
}
