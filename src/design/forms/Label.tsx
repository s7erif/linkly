import type { LabelHTMLAttributes, ReactNode } from "react";
import { Inline, Text } from "../primitives";
import { RequiredIndicator } from "./RequiredIndicator";
import styles from "./forms.module.css";

export type LabelProps = {
  children: ReactNode;
  optional?: boolean;
  required?: boolean;
} & Omit<LabelHTMLAttributes<HTMLLabelElement>, "style" | "color">;

export function Label({ children, className, optional, required, ...props }: LabelProps) {
  return (
    <Text as="label" className={className} variant="small" {...props}>
      <Inline as="span" gap="xs">
        <span className={styles.labelText}>{children}</span>
        {required || optional ? <RequiredIndicator optional={optional && !required} /> : null}
      </Inline>
    </Text>
  );
}
