import type { ReactElement, ReactNode } from "react";
import { Box, Heading, Icon, Inline, Stack, Surface, Text } from "../primitives";
import styles from "./components.module.css";

export type EmptyStateProps = {
  actions?: ReactNode;
  description?: ReactNode;
  icon?: ReactElement;
  illustration?: ReactNode;
  title: ReactNode;
};

export function EmptyState({
  actions,
  description,
  icon,
  illustration,
  title,
}: EmptyStateProps) {
  return (
    <Surface className={styles.emptyState} variant="standard">
      <Stack align="center" gap="md">
        {illustration ? (
          <Box className={styles.emptyIllustration}>{illustration}</Box>
        ) : icon ? (
          <Icon size="xl" tone="accent">{icon}</Icon>
        ) : null}
        <Stack align="center" gap="xs">
          <Heading level={3} variant="title">{title}</Heading>
          {description ? <Text tone="muted">{description}</Text> : null}
        </Stack>
        {actions ? <Inline className={styles.emptyActions} gap="sm" wrap>{actions}</Inline> : null}
      </Stack>
    </Surface>
  );
}
