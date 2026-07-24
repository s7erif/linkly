import styles from "./primitives.module.css";
import type { Gap, PrimitiveProps } from "./types";
import { cx } from "./utils";

type SpacerAxis = "block" | "inline" | "both";
type SpacerOwnProps = { children?: never; axis?: SpacerAxis; size?: Gap };

const axisClasses: Record<SpacerAxis, string> = {
  block: styles.spacerBlock, inline: styles.spacerInline, both: styles.spacerBoth,
};

const sizeClasses: Record<Gap, string> = {
  none: styles.spaceNone, xs: styles.spaceXs, sm: styles.spaceSm, md: styles.spaceMd,
  lg: styles.spaceLg, xl: styles.spaceXl, "2xl": styles.space2xl,
};

export type SpacerProps = PrimitiveProps<"span", SpacerOwnProps>;

export function Spacer({
  axis = "block",
  className,
  size = "md",
  ...props
}: SpacerProps) {
  return <span aria-hidden className={cx(styles.spacer, axisClasses[axis], sizeClasses[size], className)} {...props} />;
}
