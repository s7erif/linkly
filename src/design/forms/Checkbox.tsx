"use client";

import { useEffect, useId, useRef, type InputHTMLAttributes } from "react";
import { Check, Minus } from "lucide-react";
import { Icon, Inline, Stack } from "../primitives";
import { cx } from "../primitives/utils";
import { Description } from "./Description";
import { ErrorMessage } from "./ErrorMessage";
import { HelperText } from "./HelperText";
import { RequiredIndicator } from "./RequiredIndicator";
import type { FieldPresentationProps } from "./types";
import { fieldMessage, fieldStatus, joinIds } from "./types";
import styles from "./forms.module.css";

export type CheckboxProps = FieldPresentationProps & {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "color" | "type" | "onChange" | "checked">;

export function Checkbox({
  "aria-describedby": ariaDescribedBy,
  checked = false,
  description,
  disabled,
  error,
  helperText,
  id,
  indeterminate = false,
  label,
  loading,
  onCheckedChange,
  optional,
  readOnly,
  required,
  success,
  warning,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const controlId = id ?? generatedId;
  const descriptionId = description ? controlId + "-description" : undefined;
  const message = fieldMessage({ error, success, warning, helperText });
  const messageId = message ? controlId + "-message" : undefined;
  const status = fieldStatus({ error, success, warning });
  const unavailable = disabled || loading;

  return (
    <Stack aria-busy={loading || undefined} className={styles.choiceField} data-status={status} gap="xs">
      <Inline align="start" gap="sm">
        <span className={styles.checkboxFrame}>
          <input
            {...props}
            aria-describedby={joinIds(ariaDescribedBy, descriptionId, messageId)}
            aria-checked={indeterminate ? "mixed" : undefined}
            aria-invalid={Boolean(error) || undefined}
            checked={checked}
            className={styles.nativeChoice}
            disabled={unavailable}
            id={controlId}
            onChange={(event) => {
              if (!readOnly) onCheckedChange?.(event.currentTarget.checked);
            }}
            readOnly={readOnly}
            ref={inputRef}
            required={required}
            type="checkbox"
          />
          <Icon className={cx(styles.choiceMark, !checked && !indeterminate && styles.choiceMarkHidden)} size="sm">
            {indeterminate ? <Minus /> : <Check />}
          </Icon>
        </span>
        <Stack gap="xs">
          {label ? (
            <label className={styles.choiceLabel} htmlFor={controlId}>
              {label} {required || optional ? <RequiredIndicator optional={optional && !required} /> : null}
            </label>
          ) : null}
          {description ? <Description id={descriptionId}>{description}</Description> : null}
        </Stack>
      </Inline>
      {message ? status === "error" ? <ErrorMessage id={messageId}>{message}</ErrorMessage> : <HelperText id={messageId} tone={status === "default" ? "muted" : status}>{message}</HelperText> : null}
      {loading ? <HelperText>Loading</HelperText> : null}
    </Stack>
  );
}
