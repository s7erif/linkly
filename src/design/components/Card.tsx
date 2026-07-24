import type { HTMLAttributes } from "react";
import { Surface } from "../primitives";
import { cx } from "../primitives/utils";
import styles from "./components.module.css";

export type CardVariant = "default" | "elevated" | "glass" | "interactive";

export type CardProps = {
  variant?: CardVariant;
} & Omit<HTMLAttributes<HTMLDivElement>, "style" | "color">;

const surfaceVariants = {
  default: "standard",
  elevated: "elevated",
  glass: "glass",
  interactive: "standard",
} as const;

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <Surface
      className={cx(styles.card, variant === "interactive" && styles.cardInteractive, className)}
      variant={surfaceVariants[variant]}
      {...props}
    />
  );
}
