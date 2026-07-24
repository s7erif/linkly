import type { HTMLAttributes, ReactNode } from "react";
import { Box } from "../primitives";
import { cx } from "../primitives/utils";
import type { FormLayout } from "./types";
import styles from "./forms.module.css";

export type FormRowProps = {
  children: ReactNode;
  layout?: FormLayout;
} & Omit<HTMLAttributes<HTMLDivElement>, "style" | "color">;

const layoutClasses: Record<FormLayout, string> = {
  single: styles.layoutSingle,
  "two-columns": styles.layoutTwo,
  "auto-grid": styles.layoutAuto,
  inline: styles.layoutInline,
};

export function FormRow({ children, className, layout = "single", ...props }: FormRowProps) {
  return <Box className={cx(styles.formRow, layoutClasses[layout], className)} {...props}>{children}</Box>;
}
