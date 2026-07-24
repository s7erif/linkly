import styles from "./primitives.module.css";
import type { PrimitiveProps } from "./types";
import { cx } from "./utils";

type SeparatorOrientation = "horizontal" | "vertical";
type SeparatorOwnProps = {
  children?: never;
  decorative?: boolean;
  orientation?: SeparatorOrientation;
};

export type SeparatorProps = PrimitiveProps<"div", SeparatorOwnProps>;

export function Separator({
  className,
  decorative = true,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : orientation}
      className={cx(
        styles.separator,
        orientation === "horizontal" ? styles.separatorHorizontal : styles.separatorVertical,
        className,
      )}
      role={decorative ? "none" : "separator"}
      {...props}
    />
  );
}
