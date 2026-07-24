import type { ReactNode } from "react";
import { CircleSlash } from "lucide-react";
import { Badge, Button, EmptyState as SharedEmptyState } from "@/design/components";
import { Breadcrumb } from "@/design/navigation/Breadcrumb";
import { Inline, Text } from "@/design/primitives";
import styles from "./admin-read-ui.module.css";

export const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^./, (character) => character.toUpperCase());
export function Breadcrumbs({ items }: { items: ReadonlyArray<{ label: string; href?: string }> }) { return <Breadcrumb items={items.map((item, index) => ({ ...item, id: `${item.label}-${index}`, current: index === items.length - 1 }))}/>; }
export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) { return <Badge variant={tone}>{children}</Badge>; }
export function Pagination({ href, page, totalPages }: { href: (page: number) => string; page: number; totalPages: number }) { if (totalPages <= 1) return null; return <Inline aria-label="Pagination" as="nav" gap="md" justify="end"><Button aria-disabled={page <= 1} as="a" href={href(Math.max(1, page - 1))} size="sm" variant="ghost">Previous</Button><Text aria-live="polite" tone="muted" variant="small">Page {page} of {totalPages}</Text><Button aria-disabled={page >= totalPages} as="a" href={href(Math.min(totalPages, page + 1))} size="sm" variant="ghost">Next</Button></Inline>; }
export function EmptyState({ description, title }: { description: string; title: string }) { return <SharedEmptyState description={description} icon={<CircleSlash/>} title={title}/>; }
export function TableScroll({ children }: { children: ReactNode }) { return <div className={styles.tableScroll}>{children}</div>; }
