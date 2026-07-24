"use client";

import { useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { FileUp } from "lucide-react";
import { Badge, Skeleton } from "../components";
import { Icon, Inline, Stack, Surface, Text } from "../primitives";
import { ErrorMessage } from "./ErrorMessage";
import { HelperText } from "./HelperText";
import { Label } from "./Label";
import type { FieldPresentationProps, UploadState } from "./types";
import styles from "./forms.module.css";

export type FileUploadProps = FieldPresentationProps & {
  accept?: string;
  currentFile?: ReactNode;
  id?: string;
  multiple?: boolean;
  onFilesSelected?: (files: readonly File[]) => void;
  state?: UploadState;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "color" | "type" | "accept" | "multiple" | "onChange">;

const stateLabels: Record<UploadState, string> = {
  idle: "Ready",
  uploading: "Uploading",
  uploaded: "Uploaded",
  error: "Upload failed",
};

export function FileUpload({
  accept,
  currentFile,
  description,
  disabled,
  error,
  helperText,
  id,
  label = "Choose file",
  loading,
  multiple,
  onFilesSelected,
  optional,
  readOnly,
  required,
  state = "idle",
  success,
  warning,
  ...props
}: FileUploadProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const unavailable = disabled || loading || state === "uploading";
  const stateVariant = state === "error" ? "danger" : state === "uploaded" ? "success" : state === "uploading" ? "primary" : "neutral";

  return (
    <Stack aria-busy={state === "uploading" || loading || undefined} className={styles.uploadField} gap="xs">
      <Label htmlFor={controlId} optional={optional} required={required}>{label}</Label>
      {description ? <Text tone="muted" variant="small">{description}</Text> : null}
      <Surface className={styles.uploadSurface} data-disabled={unavailable || undefined} radius="lg" variant="standard">
        <Stack align="center" gap="sm">
          <Icon size="lg" tone="accent"><FileUp /></Icon>
          <input
            {...props}
            accept={accept}
            aria-describedby={controlId + "-status"}
            aria-invalid={Boolean(error) || state === "error" || undefined}
            className={styles.fileInput}
            disabled={unavailable || readOnly}
            id={controlId}
            multiple={multiple}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onFilesSelected?.(Array.from(event.currentTarget.files ?? []))}
            required={required}
            type="file"
          />
          <Inline gap="sm" wrap>
            <Badge variant={stateVariant}>{stateLabels[state]}</Badge>
            {currentFile ? <Text variant="small">{currentFile}</Text> : null}
          </Inline>
          {state === "uploading" ? <Skeleton className={styles.uploadProgress} variant="text" /> : null}
        </Stack>
      </Surface>
      <span id={controlId + "-status"}>
        {error || state === "error" ? <ErrorMessage>{error ?? "The selected file could not be uploaded."}</ErrorMessage> : success ? <HelperText tone="success">{success}</HelperText> : warning ? <HelperText tone="warning">{warning}</HelperText> : helperText ? <HelperText>{helperText}</HelperText> : null}
      </span>
    </Stack>
  );
}
