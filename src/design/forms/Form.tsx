import type { FormHTMLAttributes, ReactNode } from "react";
import { Stack, Surface } from "../primitives";
import { ErrorMessage } from "./ErrorMessage";
import { HelperText } from "./HelperText";
import styles from "./forms.module.css";

export type FormProps = {
  children: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
} & Omit<FormHTMLAttributes<HTMLFormElement>, "style" | "color">;

export function Form({ children, className, error, success, ...props }: FormProps) {
  return (
    <Surface as="form" className={className} radius="lg" variant="standard" {...props}>
      <Stack className={styles.form} gap="lg">
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {success ? <HelperText tone="success">{success}</HelperText> : null}
        {children}
      </Stack>
    </Surface>
  );
}
