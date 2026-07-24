import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { Box, Icon, Inline } from "../primitives";
import { cx } from "../primitives/utils";
import { FieldGroup } from "./FieldGroup";
import type { ChoiceOption, FieldPresentationProps } from "./types";
import { fieldStatus, joinIds } from "./types";
import styles from "./forms.module.css";

export type SelectProps = FieldPresentationProps & {
  options: readonly ChoiceOption[];
  placeholder?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "style" | "color" | "children">;

export function Select({
  "aria-describedby": ariaDescribedBy,
  description,
  disabled,
  error,
  helperText,
  id,
  label,
  loading,
  optional,
  options,
  placeholder,
  readOnly,
  required,
  success,
  warning,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? controlId + "-description" : undefined;
  const messageId = error || warning || success || helperText ? controlId + "-message" : undefined;
  const status = fieldStatus({ error, success, warning });
  const unavailable = disabled || loading;

  return (
    <FieldGroup
      controlId={controlId}
      description={description}
      descriptionId={descriptionId}
      disabled={unavailable}
      error={error}
      helperText={helperText}
      label={label}
      loading={loading}
      messageId={messageId}
      optional={optional}
      readOnly={readOnly}
      required={required}
      success={success}
      warning={warning}
    >
      <Inline className={styles.controlFrame} data-readonly={readOnly || undefined} data-status={status}>
        <select
          {...props}
          aria-describedby={joinIds(ariaDescribedBy, descriptionId, messageId)}
          aria-invalid={Boolean(error) || undefined}
          aria-readonly={readOnly || undefined}
          className={cx(styles.selectControl, props.className)}
          disabled={unavailable || readOnly}
          id={controlId}
          required={required}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => <option disabled={option.disabled} key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <Box aria-hidden className={styles.controlIcon}><Icon size="sm"><ChevronDown /></Icon></Box>
      </Inline>
    </FieldGroup>
  );
}
