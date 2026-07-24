import { useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Inline } from "../primitives";
import { cx } from "../primitives/utils";
import { Field, type FieldSize } from "./Field";
import styles from "./components.module.css";

export type TextareaProps = {
  error?: ReactNode;
  helperText?: ReactNode;
  label?: ReactNode;
  size?: FieldSize;
  success?: ReactNode;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style" | "color">;

const sizeClasses: Record<FieldSize, string> = {
  sm: styles.fieldSm,
  md: styles.fieldMd,
  lg: styles.fieldLg,
};

export function Textarea({
  "aria-describedby": ariaDescribedBy,
  className,
  disabled,
  error,
  helperText,
  id,
  label,
  readOnly,
  size = "md",
  success,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const message = error ?? success ?? helperText;
  const messageId = message ? `${textareaId}-message` : undefined;
  const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined;

  return (
    <Field
      disabled={disabled}
      helperText={helperText}
      inputId={textareaId}
      label={label}
      message={error ?? success}
      messageId={messageId}
      messageRole={error ? "alert" : success ? "status" : undefined}
      messageTone={error ? "danger" : success ? "success" : "muted"}
    >
      <Inline
        align="stretch"
        className={cx(
          styles.fieldFrame,
          sizeClasses[size],
          Boolean(error) && styles.fieldError,
          Boolean(success) && styles.fieldSuccess,
          readOnly && styles.fieldReadOnly,
        )}
      >
        <textarea
          {...props}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error) || undefined}
          className={cx(styles.fieldControl, styles.fieldTextarea, className)}
          disabled={disabled}
          id={textareaId}
          readOnly={readOnly}
        />
      </Inline>
    </Field>
  );
}
