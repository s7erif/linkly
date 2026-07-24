import type { ReactNode } from "react";
import { Inline } from "../primitives";
import { cx } from "../primitives/utils";
import styles from "./components.module.css";

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";
export type BadgeSize = "sm" | "md";

export type BadgeProps = {
  children: ReactNode;
  className?: string;
  size?: BadgeSize;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  primary: styles.badgePrimary,
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
  neutral: styles.badgeNeutral,
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: styles.badgeSm,
  md: styles.badgeMd,
};

export function Badge({
  children,
  className,
  size = "sm",
  variant = "neutral",
}: BadgeProps) {
  return (
    <Inline
      as="span"
      className={cx(styles.badge, variantClasses[variant], sizeClasses[size], className)}
      gap="xs"
    >
      {children}
    </Inline>
  );
}
