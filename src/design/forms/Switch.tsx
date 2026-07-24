"use client";

import { useId, type ButtonHTMLAttributes } from "react";
import { Inline, Stack } from "../primitives";
import { Description } from "./Description";
import { ErrorMessage } from "./ErrorMessage";
import { HelperText } from "./HelperText";
import { RequiredIndicator } from "./RequiredIndicator";
import type { FieldPresentationProps } from "./types";
import { fieldMessage, fieldStatus, joinIds } from "./types";
import styles from "./forms.module.css";

export type SwitchProps = FieldPresentationProps & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "color" | "role" | "onChange">;

export function Switch({
  "aria-describedby": ariaDescribedBy,
  checked,
  description,
  disabled,
  error,
  helperText,
  id,
  label,
  loading,
  onCheckedChange,
  optional,
  readOnly,
  required,
  success,
  warning,
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? controlId + "-description" : undefined;
  const message = fieldMessage({ error, success, warning, helperText });
  const messageId = message ? controlId + "-message" : undefined;
  const status = fieldStatus({ error, success, warning });
  const unavailable = disabled || loading;

  return (
    <Stack aria-busy={loading || undefined} className={styles.choiceField} data-status={status} gap="xs">
      <Inline gap="sm" justify="between">
        <Stack gap="xs">
          {label ? <span className={styles.choiceLabel} id={controlId + "-label"}>{label} {required || optional ? <RequiredIndicator optional={optional && !required} /> : null}</span> : null}
          {description ? <Description id={descriptionId}>{description}</Description> : null}
        </Stack>
        <button
          {...props}
          aria-checked={checked}
          aria-describedby={joinIds(ariaDescribedBy, descriptionId, messageId)}
          aria-invalid={Boolean(error) || undefined}
          aria-labelledby={label ? controlId + "-label" : undefined}
          className={styles.switchControl}
          data-checked={checked || undefined}
          disabled={unavailable}
          id={controlId}
          onClick={() => { if (!readOnly) onCheckedChange?.(!checked); }}
          role="switch"
          type="button"
        >
          <span aria-hidden className={styles.switchThumb} />
        </button>
      </Inline>
      {message ? status === "error" ? <ErrorMessage id={messageId}>{message}</ErrorMessage> : <HelperText id={messageId} tone={status === "default" ? "muted" : status}>{message}</HelperText> : null}
      {loading ? <HelperText>Loading</HelperText> : null}
    </Stack>
  );
}
