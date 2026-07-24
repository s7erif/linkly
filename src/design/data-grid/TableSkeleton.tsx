import { Skeleton } from "../components";
import { Stack, Surface } from "../primitives";
import styles from "./data-grid.module.css";

export type TableSkeletonProps = {
  columns?: number;
  label?: string;
  rows?: number;
};

export function TableSkeleton({
  columns = 4,
  label = "Loading table data",
  rows = 5,
}: TableSkeletonProps) {
  return (
    <Surface
      aria-busy="true"
      aria-label={label}
      className={styles.tableSkeleton}
      radius="lg"
      role="status"
    >
      <Stack gap="sm">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div className={styles.skeletonRow} key={rowIndex}>
            {Array.from({ length: columns }, (_, columnIndex) => (
              <Skeleton key={columnIndex} variant={rowIndex === 0 ? "title" : "text"} />
            ))}
          </div>
        ))}
      </Stack>
    </Surface>
  );
}
