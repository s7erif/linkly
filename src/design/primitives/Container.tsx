import type { ElementType } from "react";
import styles from "./primitives.module.css";
import type { PrimitiveProps } from "./types";
import { cx } from "./utils";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";
type ContainerPadding = "none" | "sm" | "md" | "lg";

type ContainerOwnProps = {
  padding?: ContainerPadding;
  size?: ContainerSize;
};

const sizeClasses: Record<ContainerSize, string> = {
  sm: styles.containerSm, md: styles.containerMd, lg: styles.containerLg,
  xl: styles.containerXl, full: styles.containerFull,
};

const paddingClasses: Record<ContainerPadding, string> = {
  none: styles.paddingNone, sm: styles.paddingSm, md: styles.paddingMd, lg: styles.paddingLg,
};

export type ContainerProps<TElement extends ElementType = "div"> =
  PrimitiveProps<TElement, ContainerOwnProps>;

export function Container<TElement extends ElementType = "div">({
  as,
  className,
  padding = "md",
  size = "lg",
  ...props
}: ContainerProps<TElement>) {
  const Component: ElementType = as ?? "div";
  return <Component className={cx(styles.container, sizeClasses[size], paddingClasses[padding], className)} {...props} />;
}
