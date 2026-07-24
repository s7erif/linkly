import type { ReactNode } from "react";
import { Stack } from "../primitives";
import { Description } from "./Description";
import { ErrorMessage } from "./ErrorMessage";
import { HelperText } from "./HelperText";
import { Label } from "./Label";
import type { FieldPresentationProps } from "./types";
import { fieldMessage, fieldStatus } from "./types";
import styles from "./forms.module.css";

export type FieldGroupProps = FieldPresentationProps & {
  children: ReactNode;
  controlId: string;
  descriptionId?: string;
  messageId?: string;
};

export function FieldGroup({
  children,
  controlId,
  description,
  descriptionId,
  disabled,
  error,
  helperText,
  label,
  loading,
  messageId,
  optional,
  required,
  success,
  warning,
}: FieldGroupProps) {
  const status = fieldStatus({ error, success, warning });
  const message = fieldMessage({ error, success, warning, helperText });

  return (
    <Stack
      aria-busy={loading || undefined}
      className={styles.fieldGroup}
      data-disabled={disabled || undefined}
      data-status={status}
      gap="xs"
    >
      {label ? <Label htmlFor={controlId} optional={optional} required={required}>{label}</Label> : null}
      {description ? <Description id={descriptionId}>{description}</Description> : null}
      {children}
      {message ? (
        status === "error"
          ? <ErrorMessage id={messageId}>{message}</ErrorMessage>
          : <HelperText id={messageId} tone={status === "default" ? "muted" : status}>{message}</HelperText>
      ) : null}
      {loading ? <HelperText>Loading</HelperText> : null}
    </Stack>
  );
}
