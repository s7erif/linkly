import type { ReactElement } from "react";
import styles from "./primitives.module.css";
import { toneClasses } from "./primitive-classes";
import type { PrimitiveProps, Tone } from "./types";
import { cx } from "./utils";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

type IconOwnProps = {
  children: ReactElement;
  label?: string;
  size?: IconSize;
  tone?: Tone;
};

const sizeClasses: Record<IconSize, string> = {
  xs: styles.iconXs, sm: styles.iconSm, md: styles.iconMd,
  lg: styles.iconLg, xl: styles.iconXl,
};

export type IconProps = PrimitiveProps<"span", IconOwnProps>;

export function Icon({
  children,
  className,
  label,
  size = "md",
  tone = "default",
  ...props
}: IconProps) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={cx(styles.icon, sizeClasses[size], toneClasses[tone], className)}
      role={label ? "img" : undefined}
      {...props}
    >
      {children}
    </span>
  );
}
