import { Box } from "../primitives";
import { cx } from "../primitives/utils";
import styles from "./components.module.css";

export type SkeletonVariant = "text" | "title" | "avatar" | "card" | "table-row";

export type SkeletonProps = {
  className?: string;
  variant?: SkeletonVariant;
};

const variantClasses: Record<SkeletonVariant, string> = {
  text: styles.skeletonText,
  title: styles.skeletonTitle,
  avatar: styles.skeletonAvatar,
  card: styles.skeletonCard,
  "table-row": styles.skeletonTableRow,
};

export function Skeleton({
  className,
  variant = "text",
}: SkeletonProps) {
  return <Box aria-hidden className={cx(styles.skeleton, variantClasses[variant], className)} />;
}
