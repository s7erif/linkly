import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Box, Inline } from "../primitives";
import { cx } from "../primitives/utils";
import { Field, type FieldSize } from "./Field";
import styles from "./components.module.css";

export type InputProps = {
  error?: ReactNode;
  helperText?: ReactNode;
  label?: ReactNode;
  prefix?: ReactNode;
  size?: FieldSize;
  success?: ReactNode;
  suffix?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "style" | "color" | "prefix">;

const sizeClasses: Record<FieldSize, string> = {
  sm: styles.fieldSm,
  md: styles.fieldMd,
  lg: styles.fieldLg,
};

export function Input({
  "aria-describedby": ariaDescribedBy,
  className,
  disabled,
  error,
  helperText,
  id,
  label,
  prefix,
  readOnly,
  size = "md",
  success,
  suffix,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const message = error ?? success ?? helperText;
  const messageId = message ? `${inputId}-message` : undefined;
  const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined;

  return (
    <Field
      disabled={disabled}
      helperText={helperText}
      inputId={inputId}
      label={label}
      message={error ?? success}
      messageId={messageId}
      messageRole={error ? "alert" : success ? "status" : undefined}
      messageTone={error ? "danger" : success ? "success" : "muted"}
    >
      <Inline
        className={cx(
          styles.fieldFrame,
          sizeClasses[size],
          Boolean(error) && styles.fieldError,
          Boolean(success) && styles.fieldSuccess,
          readOnly && styles.fieldReadOnly,
        )}
        gap="sm"
      >
        {prefix ? <Box className={styles.fieldAffix}>{prefix}</Box> : null}
        <input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error) || undefined}
          className={cx(styles.fieldControl, className)}
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
        />
        {suffix ? <Box className={styles.fieldAffix}>{suffix}</Box> : null}
      </Inline>
    </Field>
  );
}
