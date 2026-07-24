import type { ReactNode } from "react";
import { Stack, Text } from "../primitives";
import { cx } from "../primitives/utils";
import styles from "./components.module.css";

export type FieldSize = "sm" | "md" | "lg";
export type FieldStatus = "default" | "error" | "success";

type FieldProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  helperText?: ReactNode;
  inputId: string;
  label?: ReactNode;
  messageId?: string;
  messageRole?: "alert" | "status";
  messageTone?: "muted" | "danger" | "success";
  message?: ReactNode;
};

export function Field({
  children,
  className,
  disabled,
  helperText,
  inputId,
  label,
  message,
  messageId,
  messageRole,
  messageTone = "muted",
}: FieldProps) {
  return (
    <Stack className={cx(styles.field, disabled && styles.fieldDisabled, className)} gap="xs">
      {label ? (
        <Text as="label" className={styles.fieldLabel} htmlFor={inputId} variant="small">
          {label}
        </Text>
      ) : null}
      {children}
      {message ? (
        <Text
          as="span"
          className={cx(
            styles.fieldMessage,
            messageTone === "danger" && styles.fieldMessageError,
            messageTone === "success" && styles.fieldMessageSuccess,
          )}
          id={messageId}
          role={messageRole}
          variant="small"
        >
          {message}
        </Text>
      ) : helperText ? (
        <Text as="span" className={styles.fieldMessage} id={messageId} variant="small">
          {helperText}
        </Text>
      ) : null}
    </Stack>
  );
}
