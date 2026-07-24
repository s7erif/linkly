import type { ReactNode } from "react";
import { Breadcrumb } from "../navigation/Breadcrumb";
import type { BreadcrumbItemModel } from "../navigation/types";
import { Heading, Inline, Stack, Text } from "../primitives";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";
import styles from "./admin-page.module.css";

export type AdminPageProps = { children: ReactNode; className?: string };
export function AdminPage({ children, className }: AdminPageProps) {
  return <Stack className={[styles.page, className].filter(Boolean).join(" ")} gap="xl">{children}</Stack>;
}

export type AdminPageHeaderProps = {
  actions?: ReactNode;
  breadcrumbs?: readonly BreadcrumbItemModel[];
  description?: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
};
export function AdminPageHeader({ actions, breadcrumbs, description, eyebrow, title }: AdminPageHeaderProps) {
  return (
    <Stack as="header" className={styles.header} gap="md">
      {breadcrumbs?.length ? <Breadcrumb items={breadcrumbs} /> : null}
      <Inline align="end" className={styles.headerLayout} gap="lg" justify="between" wrap>
        <Stack className={styles.heading} gap="xs">
          <Text className={styles.eyebrow} tone="accent" variant="caption">{eyebrow}</Text>
          <Heading level={1} variant="h1">{title}</Heading>
          {description ? <Text tone="muted" variant="small">{description}</Text> : null}
        </Stack>
        {actions ? <Inline className={styles.actions} gap="sm" justify="end" wrap>{actions}</Inline> : null}
      </Inline>
    </Stack>
  );
}

export type AdminMetricCardProps = { hint?: ReactNode; label: ReactNode; tone?: "default" | "positive" | "accent"; value: ReactNode };
export function AdminMetricCard({ hint, label, value }: AdminMetricCardProps) {
  return <Card className={styles.metric}><Stack gap="xs"><Text tone="muted" variant="caption">{label}</Text><Text as="strong" className={styles.metricValue}>{value}</Text>{hint ? <Text tone="subtle" variant="caption">{hint}</Text> : null}</Stack></Card>;
}

export type AdminSectionProps = { action?: ReactNode; children: ReactNode; className?: string; description?: ReactNode; title?: ReactNode };
export function AdminSection({ action, children, className, description, title }: AdminSectionProps) {
  return <Card className={className}><Stack gap="md">{title || description || action ? <Inline align="start" gap="md" justify="between" wrap><Stack gap="xs">{title ? <Heading level={2} variant="title">{title}</Heading> : null}{description ? <Text tone="muted" variant="small">{description}</Text> : null}</Stack>{action}</Inline> : null}{children}</Stack></Card>;
}

export function AdminTabs({ active = 0, items }: { active?: number; items: readonly string[] }) {
  return <Inline aria-label="Sections" className={styles.tabs} gap="xs" role="tablist">{items.map((item, index) => <button aria-selected={index === active} className={styles.tab} data-active={index === active || undefined} key={item} role="tab" type="button">{item}</button>)}</Inline>;
}

export const AdminCard = AdminSection;
export const AdminStatCard = AdminMetricCard;

export function AdminPageSkeleton({ metrics = 0, rows = 6 }: { metrics?: number; rows?: number }) {
  return <Stack aria-busy="true" aria-label="Loading page" className={styles.page} gap="xl" role="status"><Stack gap="sm"><Skeleton variant="text"/><Skeleton variant="title"/><Skeleton variant="text"/></Stack>{metrics ? <div className={styles.skeletonMetrics}>{Array.from({ length: metrics }, (_, index) => <Skeleton key={index} variant="card"/>)}</div> : null}<Card><Stack gap="md"><Skeleton variant="text"/>{Array.from({ length: rows }, (_, index) => <Skeleton key={index} variant="table-row"/>)}</Stack></Card></Stack>;
}
