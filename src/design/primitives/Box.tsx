import type { ElementType } from "react";
import styles from "./primitives.module.css";
import type { PrimitiveProps } from "./types";
import { cx } from "./utils";

export type BoxProps<TElement extends ElementType = "div"> = PrimitiveProps<TElement>;

export function Box<TElement extends ElementType = "div">({
  as,
  className,
  ...props
}: BoxProps<TElement>) {
  const Component: ElementType = as ?? "div";
  return <Component className={cx(styles.box, className)} {...props} />;
}
