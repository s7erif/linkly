import type { InputHTMLAttributes, ReactNode } from "react";
import { Calendar } from "lucide-react";
import { Input } from "../components";
import type { FieldPresentationProps } from "./types";

export type DatePickerPlaceholderProps = FieldPresentationProps & {
  id?: string;
  value?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "color" | "type" | "value" | "size">;

export function DatePickerPlaceholder({
  description,
  error,
  helperText,
  label,
  loading,
  optional,
  readOnly,
  required,
  success,
  warning,
  ...props
}: DatePickerPlaceholderProps) {
  const support = error ?? warning ?? success ?? helperText ?? description;
  return (
    <Input
      {...props}
      disabled={props.disabled || loading}
      error={error}
      helperText={!error && !success ? support : undefined}
      label={label ? <>{label}{optional && !required ? " (Optional)" : ""}</> : undefined}
      readOnly={readOnly}
      required={required}
      success={success}
      suffix={<Calendar />}
      type="date"
    />
  );
}
