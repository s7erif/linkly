import type { ReactNode } from "react";
import { Inline, Stack, Surface, Text } from "../primitives";
import styles from "./data-grid.module.css";

export type DataTableToolbarProps = {
  actions?: ReactNode;
  children?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
};

export function DataTableToolbar({
  actions,
  children,
  description,
  title,
}: DataTableToolbarProps) {
  return (
    <Surface className={styles.toolbar} radius="lg" variant="standard">
      <Inline align="end" gap="md" justify="between" wrap>
        {title || description ? (
          <Stack gap="xs">
            {title ? <Text as="strong" variant="title">{title}</Text> : null}
            {description ? <Text tone="muted" variant="small">{description}</Text> : null}
          </Stack>
        ) : null}
        {children ? <Inline className={styles.toolbarControls} gap="sm" wrap>{children}</Inline> : null}
        {actions ? <Inline gap="sm" justify="end" wrap>{actions}</Inline> : null}
      </Inline>
    </Surface>
  );
}
