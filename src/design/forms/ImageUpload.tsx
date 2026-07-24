"use client";

import type { ReactNode } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Icon, Stack, Surface, Text } from "../primitives";
import { FileUpload, type FileUploadProps } from "./FileUpload";
import styles from "./forms.module.css";

export type ImageUploadProps = Omit<FileUploadProps, "accept" | "currentFile"> & {
  accept?: string;
  preview?: ReactNode;
};

export function ImageUpload({ accept = "image/*", preview, ...props }: ImageUploadProps) {
  return (
    <Stack gap="sm">
      {preview ? (
        <Surface aria-label="Selected image preview" className={styles.imagePreview} radius="lg" variant="standard">
          {preview}
        </Surface>
      ) : (
        <Surface className={styles.imagePlaceholder} radius="lg" variant="standard">
          <Stack align="center" gap="xs">
            <Icon size="lg" tone="muted"><ImageIcon /></Icon>
            <Text tone="muted" variant="small">No image selected</Text>
          </Stack>
        </Surface>
      )}
      <FileUpload accept={accept} {...props} />
    </Stack>
  );
}
