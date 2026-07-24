"use client";

import { useId, type ChangeEvent } from "react";
import { Inline } from "../primitives";
import { FieldGroup } from "./FieldGroup";
import type { FieldPresentationProps } from "./types";
import { fieldStatus, joinIds } from "./types";
import styles from "./forms.module.css";

export type ColorPickerPlaceholderProps = FieldPresentationProps & {
  id?: string;
  onValueChange?: (value: string) => void;
  value: string;
};

export function ColorPickerPlaceholder({
  description,
  disabled,
  error,
  helperText,
  id,
  label,
  loading,
  onValueChange,
  optional,
  readOnly,
  required,
  success,
  value,
  warning,
}: ColorPickerPlaceholderProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? controlId + "-description" : undefined;
  const messageId = error || warning || success || helperText ? controlId + "-message" : undefined;
  const unavailable = disabled || loading;

  return (
    <FieldGroup controlId={controlId} description={description} descriptionId={descriptionId} disabled={unavailable} error={error} helperText={helperText} label={label} loading={loading} messageId={messageId} optional={optional} readOnly={readOnly} required={required} success={success} warning={warning}>
      <Inline className={styles.colorControl} data-status={fieldStatus({ error, success, warning })} gap="sm">
        <input
          aria-describedby={joinIds(descriptionId, messageId)}
          aria-invalid={Boolean(error) || undefined}
          className={styles.colorInput}
          disabled={unavailable || readOnly}
          id={controlId}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onValueChange?.(event.currentTarget.value)}
          readOnly={readOnly}
          required={required}
          type="color"
          value={value}
        />
        <span className={styles.colorValue}>{value}</span>
      </Inline>
    </FieldGroup>
  );
}
