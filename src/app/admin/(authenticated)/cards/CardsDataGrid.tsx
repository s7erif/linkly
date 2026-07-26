"use client";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MoreHorizontal, RadioTower } from "lucide-react";
import { Badge, EmptyState, type BadgeVariant } from "@/design/components";
import { DataTable, Pagination, type DataGridColumn } from "@/design/data-grid";
import { Box, Stack, Text } from "@/design/primitives";
import type { NfcCardStatus } from "@/types/nfc-card";
import { type CardInventoryRow, useCardInventory } from "./CardManager";
import styles from "./cards.module.css";
const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase());
const tone = (status: NfcCardStatus): BadgeVariant => status === "AVAILABLE" ? "success" : status === "ACTIVATED" ? "primary" : status === "DISABLED" || status === "LOST" ? "danger" : "neutral";
function Actions({ card }: { card: CardInventoryRow }) { const { openView } = useCardInventory(); return <button aria-label={`Actions for ${card.activationToken}`} className={styles.filterChip} onClick={() => openView(card)} type="button"><MoreHorizontal /></button>; }
const columns: readonly DataGridColumn<CardInventoryRow>[] = [
  { id: "card", header: "Card", mobileLabel: "Card", cell: (card) => <Text as="strong" className={styles.gridCardId} variant="small">{card.id}</Text> },
  { id: "token", header: "Activation Token", mobileLabel: "Activation Token", cell: (card) => <Text className={styles.codeHint} variant="small">{card.activationToken}</Text> },
  { id: "status", header: "Status", mobileLabel: "Status", cell: (card) => <Badge variant={tone(card.status)}>{label(card.status)}</Badge> },
  { id: "customer", header: "Customer", mobileLabel: "Customer", cell: (card) => <Text variant="small">{card.customer?.displayName ?? "Not linked"}</Text> },
  { id: "workspace", header: "Workspace", mobileLabel: "Workspace", cell: (card) => <Text variant="small">{card.workspaceSlug ?? "Not linked"}</Text> },
  { id: "created", header: "Created", mobileLabel: "Created", cell: (card) => <Text tone="muted" variant="small">{card.createdAtLabel}</Text> },
  { id: "activated", header: "Activated", mobileLabel: "Activated", cell: (card) => <Text tone="muted" variant="small">{card.activatedAtLabel}</Text> },
  { align: "end", id: "actions", header: "Actions", mobileLabel: "Actions", cell: (card) => <Actions card={card} /> },
];
export function CardsDataGrid({ currentPage, pageSize, queryString, rows, totalItems, totalPages }: { currentPage: number; pageSize: number; queryString: string; rows: readonly CardInventoryRow[]; totalItems: number; totalPages: number }) { const router = useRouter(), pathname = usePathname(), { latestMutation, openView } = useCardInventory(); const visible = useMemo(() => latestMutation?.kind === "delete" ? rows.filter((row) => row.id !== latestMutation.id) : latestMutation?.kind === "status" ? rows.map((row) => row.id === latestMutation.id ? { ...row, status: latestMutation.status } : row) : rows, [latestMutation, rows]); const rowFor = (target: EventTarget) => { if (!(target instanceof Element)) return null; const row = target.closest<HTMLTableRowElement>("tbody tr"); return row ? visible[row.sectionRowIndex] ?? null : null; }; return <div className={styles.gridInteraction} onClick={(event) => { if ((event.target as Element).closest("a,button,input,summary")) return; const card = rowFor(event.target); if (card) openView(card); }} onKeyDownCapture={(event) => { if (event.key !== "Enter") return; const card = rowFor(event.target); if (card) { event.preventDefault(); openView(card); } }}><DataTable caption="NFC activation tokens and assignments" className={styles.dataGrid} columns={columns} emptyState={<EmptyState description="Generate the first NFC activation token from the page header." illustration={<Box aria-hidden className={styles.emptyIcon}><RadioTower /></Box>} title="No NFC cards" />} getRowId={(card) => card.id} pagination={<Pagination currentPage={currentPage} onPageChange={(page) => { const query = new URLSearchParams(queryString); query.set("page", String(page)); router.push(`${pathname}?${query}`); }} pageSize={pageSize} totalItems={totalItems} totalPages={totalPages} />} rows={visible} /></div>; }
