import type { ReactNode } from "react";

export type FormStatus = "default" | "error" | "success" | "warning";
export type FormLayout = "single" | "two-columns" | "auto-grid" | "inline";
export type UploadState = "idle" | "uploading" | "uploaded" | "error";

export type ChoiceOption = {
  description?: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

export type FieldPresentationProps = {
  description?: ReactNode;
  disabled?: boolean;
  error?: ReactNode;
  helperText?: ReactNode;
  label?: ReactNode;
  loading?: boolean;
  optional?: boolean;
  readOnly?: boolean;
  required?: boolean;
  success?: ReactNode;
  warning?: ReactNode;
};

export function fieldStatus(props: Pick<FieldPresentationProps, "error" | "success" | "warning">): FormStatus {
  if (props.error) return "error";
  if (props.warning) return "warning";
  if (props.success) return "success";
  return "default";
}

export function fieldMessage(props: Pick<FieldPresentationProps, "error" | "success" | "warning" | "helperText">) {
  return props.error ?? props.warning ?? props.success ?? props.helperText;
}

export function joinIds(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(" ") || undefined;
}
