import type { HTMLAttributes, ReactNode } from "react";
import { Inline, Surface } from "../primitives";
import styles from "./forms.module.css";

export type FormActionsProps = {
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "style" | "color">;

export function FormActions({ children, ...props }: FormActionsProps) {
  return (
    <Surface className={styles.formActions} radius="lg" variant="standard" {...props}>
      <Inline gap="sm" justify="end" wrap>{children}</Inline>
    </Surface>
  );
}
