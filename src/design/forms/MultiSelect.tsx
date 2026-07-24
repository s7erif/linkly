"use client";

import { useId, type SelectHTMLAttributes } from "react";
import { FieldGroup } from "./FieldGroup";
import type { ChoiceOption, FieldPresentationProps } from "./types";
import { fieldStatus, joinIds } from "./types";
import styles from "./forms.module.css";

export type MultiSelectProps = FieldPresentationProps & {
  onValuesChange?: (values: readonly string[]) => void;
  options: readonly ChoiceOption[];
  values?: readonly string[];
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "style" | "color" | "children" | "multiple" | "value" | "onChange">;

export function MultiSelect({
  "aria-describedby": ariaDescribedBy,
  description,
  disabled,
  error,
  helperText,
  id,
  label,
  loading,
  onValuesChange,
  optional,
  options,
  readOnly,
  required,
  success,
  values = [],
  warning,
  ...props
}: MultiSelectProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? controlId + "-description" : undefined;
  const messageId = error || warning || success || helperText ? controlId + "-message" : undefined;
  const status = fieldStatus({ error, success, warning });
  const unavailable = disabled || loading;

  return (
    <FieldGroup controlId={controlId} description={description} descriptionId={descriptionId} disabled={unavailable} error={error} helperText={helperText} label={label} loading={loading} messageId={messageId} optional={optional} readOnly={readOnly} required={required} success={success} warning={warning}>
      <select
        {...props}
        aria-describedby={joinIds(ariaDescribedBy, descriptionId, messageId)}
        aria-invalid={Boolean(error) || undefined}
        aria-readonly={readOnly || undefined}
        className={styles.multiSelect}
        data-status={status}
        disabled={unavailable || readOnly}
        id={controlId}
        multiple
        onChange={(event) => onValuesChange?.(Array.from(event.currentTarget.selectedOptions, (option) => option.value))}
        required={required}
        value={[...values]}
      >
        {options.map((option) => <option disabled={option.disabled} key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </FieldGroup>
  );
}
