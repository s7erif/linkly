"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RadioTower, X } from "lucide-react";
import { Badge, Button, Input } from "@/design/components";
import { Box, Heading, Inline, Stack, Text } from "@/design/primitives";
import { deleteNfcCardAction, generateNfcCardsAction, setNfcCardStatusAction } from "@/features/admin/nfc-card-actions";
import { buildProfileUrl } from "@/lib/public-links";
import type { NfcCardStatus } from "@/types/nfc-card";
import styles from "./cards.module.css";

export type CardInventoryRow = { id: string; activationToken: string; activationUrl: string; status: NfcCardStatus; customer: { id: string; displayName: string; email: string | null } | null; workspaceSlug: string | null; createdAtLabel: string; activatedAtLabel: string };
type MutableStatus = "AVAILABLE" | "RESERVED" | "DISABLED" | "LOST" | "ARCHIVED";
type Mutation = { kind: "status"; id: string; status: MutableStatus } | { kind: "delete"; id: string } | { kind: "generate" };
type Value = { busyId: string | null; latestMutation: Mutation | null; openGenerate: () => void; openView: (card: CardInventoryRow) => void; remove: (card: CardInventoryRow) => Promise<boolean>; setStatus: (card: CardInventoryRow, status: MutableStatus) => Promise<boolean> };
const Context = createContext<Value | null>(null);
export function useCardInventory() { const value = useContext(Context); if (!value) throw new Error("Card inventory controls require CardManager"); return value; }
const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase());
const tone = (status: NfcCardStatus) => status === "AVAILABLE" ? "success" as const : status === "DISABLED" || status === "LOST" ? "danger" as const : status === "ACTIVATED" ? "primary" as const : "neutral" as const;

function Drawer({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null), previous = useRef<HTMLElement | null>(null);
  useEffect(() => { previous.current = document.activeElement as HTMLElement | null; ref.current?.querySelector<HTMLElement>("[data-initial-focus]")?.focus(); return () => previous.current?.focus(); }, []);
  const keyDown = (event: KeyboardEvent<HTMLElement>) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } };
  return <div className={styles.drawerLayer}><button aria-label="Close drawer" className={styles.drawerBackdrop} onClick={onClose} type="button" /><aside aria-modal="true" className={styles.drawer} onKeyDown={keyDown} ref={ref} role="dialog">{children}</aside></div>;
}

function GenerateDrawer({ close, done }: { close: () => void; done: (message: string) => void }) {
  const [pending, startTransition] = useTransition(), [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); startTransition(async () => { const result = await generateNfcCardsAction({ quantity: Number(form.get("quantity")) }); if (!result.ok) setError(result.message); else done(result.message); }); };
  return <Drawer onClose={pending ? () => undefined : close}><form className={styles.drawerForm} onSubmit={submit}><Inline className={styles.drawerHeader} gap="md" justify="between"><Stack gap="xs"><Text tone="accent" variant="caption">NFC provisioning</Text><Heading level={2} variant="title">Generate Activation Tokens</Heading><Text tone="muted" variant="small">Each token creates one permanent NFC URL.</Text></Stack><Button aria-label="Close generator" data-initial-focus disabled={pending} iconOnly leftIcon={<X />} onClick={close} size="sm" variant="ghost" /></Inline><Stack className={styles.drawerContent} gap="md">{error ? <p className={styles.formError} role="alert">{error}</p> : null}<Input defaultValue="1" label="Quantity" max={500} min={1} name="quantity" required type="number" /></Stack><Inline className={styles.drawerFooter} gap="sm" justify="end"><Button disabled={pending} onClick={close} variant="secondary">Cancel</Button><Button loading={pending} loadingLabel="Generating tokens" type="submit">Generate</Button></Inline></form></Drawer>;
}

function CardDrawer({ card, busy, close, remove, status }: { card: CardInventoryRow; busy: boolean; close: () => void; remove: () => void; status: (value: MutableStatus) => void }) {
  return <Drawer onClose={busy ? () => undefined : close}><header className={styles.cardDrawerHeader}><Inline gap="md" justify="between"><Inline align="center" gap="md"><Box aria-hidden className={styles.cardGlyph}><RadioTower /></Box><Stack gap="xs"><Heading level={2} variant="title">NFC Card</Heading><Text className={styles.codeHint} variant="small">{card.activationToken}</Text><Badge variant={tone(card.status)}>{label(card.status)}</Badge></Stack></Inline><Button aria-label="Close card drawer" data-initial-focus disabled={busy} iconOnly leftIcon={<X />} onClick={close} size="sm" variant="ghost" /></Inline><Inline gap="sm" wrap>{card.status === "DISABLED" ? <Button disabled={busy} onClick={() => status("AVAILABLE")} size="sm">Restore</Button> : <Button disabled={busy} onClick={() => status("DISABLED")} size="sm" variant="secondary">Disable</Button>}<Button disabled={busy} onClick={() => status("LOST")} size="sm" variant="secondary">Mark Lost</Button><Button disabled={busy} onClick={remove} size="sm" variant="danger">Archive</Button></Inline></header><dl className={styles.details}>{[["Activation Token", card.activationToken], ["NFC URL", card.activationUrl], ["Status", label(card.status)], ["Customer", card.customer?.displayName ?? "Not linked"], ["Workspace", card.workspaceSlug ?? "Not linked"], ["Created", card.createdAtLabel], ["Activated", card.activatedAtLabel]].map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl><Inline gap="sm" justify="center"><Button onClick={() => void navigator.clipboard.writeText(card.activationUrl)} size="sm" variant="secondary">Copy Activation URL</Button>{card.workspaceSlug ? <Button as="a" href={buildProfileUrl(card.workspaceSlug)} size="sm">Open Profile</Button> : null}</Inline></Drawer>;
}

export function CardManager({ children, initialGenerate = false }: { children: ReactNode; initialGenerate?: boolean }) {
  const router = useRouter(), [drawer, setDrawer] = useState<{ kind: "generate" } | { kind: "view"; card: CardInventoryRow } | null>(initialGenerate ? { kind: "generate" } : null), [busyId, setBusyId] = useState<string | null>(null), [latestMutation, setLatestMutation] = useState<Mutation | null>(null), [toast, setToast] = useState("");
  useEffect(() => { if (!toast) return; const timeout = setTimeout(() => setToast(""), 4000); return () => clearTimeout(timeout); }, [toast]);
  const setStatus = useCallback(async (card: CardInventoryRow, status: MutableStatus) => { if (busyId) return false; setBusyId(card.id); try { const result = await setNfcCardStatusAction(card.id, status); setToast(result.message); if (result.ok) { setLatestMutation({ kind: "status", id: card.id, status }); router.refresh(); } return result.ok; } finally { setBusyId(null); } }, [busyId, router]);
  const remove = useCallback(async (card: CardInventoryRow) => { if (busyId || !confirm(`Archive NFC token ${card.activationToken}?`)) return false; setBusyId(card.id); try { const result = await deleteNfcCardAction(card.id); setToast(result.message); if (result.ok) { setLatestMutation({ kind: "delete", id: card.id }); router.refresh(); } return result.ok; } finally { setBusyId(null); } }, [busyId, router]);
  const value = useMemo<Value>(() => ({ busyId, latestMutation, openGenerate: () => setDrawer({ kind: "generate" }), openView: (card) => setDrawer({ kind: "view", card }), remove, setStatus }), [busyId, latestMutation, remove, setStatus]);
  return <Context.Provider value={value}>{children}{drawer?.kind === "generate" ? <GenerateDrawer close={() => setDrawer(null)} done={(message) => { setDrawer(null); setLatestMutation({ kind: "generate" }); setToast(message); router.refresh(); }} /> : drawer?.kind === "view" ? <CardDrawer busy={busyId === drawer.card.id} card={latestMutation?.kind === "status" && latestMutation.id === drawer.card.id ? { ...drawer.card, status: latestMutation.status } : drawer.card} close={() => setDrawer(null)} remove={() => void remove(drawer.card).then((ok) => ok && setDrawer(null))} status={(next) => void setStatus(drawer.card, next)} /> : null}{toast ? <div className={styles.toast} role="status"><CheckCircle2 />{toast}</div> : null}</Context.Provider>;
}

export function GenerateCardsButton({ label = "Generate Activation Token" }: { label?: string }) { return <Button leftIcon={<RadioTower />} onClick={useCardInventory().openGenerate} size="sm">{label}</Button>; }
