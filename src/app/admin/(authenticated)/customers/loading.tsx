import { Card, Skeleton } from "@/design/components";
import { Stack } from "@/design/primitives";
import styles from "./customers.module.css";

export default function CustomersLoading() {
  return (
    <Stack aria-busy="true" aria-label="Loading customer management" className={styles.page} gap="md" role="status">
      <Card className={styles.hero} variant="elevated"><Stack gap="sm"><Skeleton variant="title" /><Skeleton variant="text" /></Stack></Card>
      <Skeleton className={styles.loadingSummary} variant="text" />
      <section className={styles.workspace}><Stack gap="md"><Skeleton variant="text" /><Skeleton variant="text" />{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} variant="table-row" />)}</Stack></section>
    </Stack>
  );
}
