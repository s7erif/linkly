"use client";

import { useId, type ReactNode } from "react";
import { Stack } from "../primitives";
import { Description } from "./Description";
import { ErrorMessage } from "./ErrorMessage";
import { HelperText } from "./HelperText";
import { RequiredIndicator } from "./RequiredIndicator";
import type { ChoiceOption, FieldPresentationProps } from "./types";
import { fieldMessage, fieldStatus, joinIds } from "./types";
import styles from "./forms.module.css";

export type RadioGroupProps = FieldPresentationProps & {
  name: string;
  onValueChange?: (value: string) => void;
  options: readonly ChoiceOption[];
  value?: string;
};

export function RadioGroup({
  description,
  disabled,
  error,
  helperText,
  label,
  loading,
  name,
  onValueChange,
  optional,
  options,
  readOnly,
  required,
  success,
  value,
  warning,
}: RadioGroupProps) {
  const groupId = useId();
  const descriptionId = description ? groupId + "-description" : undefined;
  const message = fieldMessage({ error, success, warning, helperText });
  const messageId = message ? groupId + "-message" : undefined;
  const status = fieldStatus({ error, success, warning });
  const unavailable = disabled || loading;

  return (
    <fieldset
      aria-busy={loading || undefined}
      aria-describedby={joinIds(descriptionId, messageId)}
      aria-invalid={Boolean(error) || undefined}
      className={styles.choiceGroup}
      disabled={unavailable}
    >
      {label ? <legend className={styles.groupLegend}>{label} {required || optional ? <RequiredIndicator optional={optional && !required} /> : null}</legend> : null}
      {description ? <Description id={descriptionId}>{description}</Description> : null}
      <Stack className={styles.choiceOptions} gap="sm">
        {options.map((option) => {
          const optionId = groupId + "-" + option.value;
          return (
            <label className={styles.radioOption} data-disabled={option.disabled || unavailable || undefined} key={option.value} htmlFor={optionId}>
              <input
                checked={value === option.value}
                className={styles.nativeRadio}
                disabled={option.disabled || unavailable}
                id={optionId}
                name={name}
                onChange={() => { if (!readOnly) onValueChange?.(option.value); }}
                readOnly={readOnly}
                required={required}
                type="radio"
                value={option.value}
              />
              <span aria-hidden className={styles.radioMark} />
              <Stack gap="xs">
                <span className={styles.choiceLabel}>{option.label}</span>
                {option.description ? <Description>{option.description}</Description> : null}
              </Stack>
            </label>
          );
        })}
      </Stack>
      {message ? status === "error" ? <ErrorMessage id={messageId}>{message}</ErrorMessage> : <HelperText id={messageId} tone={status === "default" ? "muted" : status}>{message}</HelperText> : null}
      {loading ? <HelperText>Loading</HelperText> : null}
    </fieldset>
  );
}
