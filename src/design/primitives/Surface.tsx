import type { ElementType } from "react";
import styles from "./primitives.module.css";
import type { PrimitiveProps } from "./types";
import { cx } from "./utils";

type SurfaceVariant = "standard" | "elevated" | "floating" | "glass" | "glassXs" | "glassSm" | "glassMd" | "glassLg" | "glassXl" | "overlay";
type SurfaceRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

type SurfaceOwnProps = {
  radius?: SurfaceRadius;
  variant?: SurfaceVariant;
};

const variantClasses: Record<SurfaceVariant, string> = {
  standard: "oi-surface",
  elevated: "oi-surface-elevated",
  floating: "oi-surface-floating",
  glass: "oi-glass",
  glassXs: "oi-glass-xs",
  glassSm: "oi-glass-sm",
  glassMd: "oi-glass-md",
  glassLg: "oi-glass-lg",
  glassXl: "oi-glass-xl",
  overlay: "oi-surface-overlay",
};

const radiusClasses: Record<SurfaceRadius, string> = {
  none: styles.radiusNone, sm: styles.radiusSm, md: styles.radiusMd,
  lg: styles.radiusLg, xl: styles.radiusXl, "2xl": styles.radius2xl, full: styles.radiusFull,
};

export type SurfaceProps<TElement extends ElementType = "div"> =
  PrimitiveProps<TElement, SurfaceOwnProps>;

export function Surface<TElement extends ElementType = "div">({
  as,
  className,
  radius = "lg",
  variant = "standard",
  ...props
}: SurfaceProps<TElement>) {
  const Component: ElementType = as ?? "div";
  return <Component className={cx(styles.surface, variantClasses[variant], radiusClasses[radius], className)} {...props} />;
}
