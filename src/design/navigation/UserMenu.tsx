import { ChevronDown, UserRound } from "lucide-react";
import Link from "next/link";
import { Icon, Inline, Stack, Surface, Text } from "../primitives";
import type { UserMenuModel } from "./types";
import styles from "./navigation.module.css";

export type UserMenuProps = {
  user: UserMenuModel;
};

export function UserMenu({ user }: UserMenuProps) {
  return (
    <details className={styles.userMenu}>
      <summary className={styles.userMenuTrigger}>
        <Inline gap="sm">
          <Surface className={styles.userAvatar} radius="full" variant="elevated">
            {user.avatar ?? <Icon size="sm"><UserRound /></Icon>}
          </Surface>
          <Text as="span" className={styles.userMenuName} variant="small">{user.name}</Text>
          <Icon size="xs"><ChevronDown /></Icon>
        </Inline>
      </summary>
      <Surface className={styles.userMenuPopover} radius="lg" variant="floating">
        <Stack gap="sm">
          <Stack gap="none">
            <Text as="strong" variant="small">{user.name}</Text>
            {user.description ? <Text variant="caption" tone="muted">{user.description}</Text> : null}
          </Stack>
          {user.actions?.length ? (
            <Stack as="nav" aria-label="User menu" gap="xs">
              {user.actions.map((action) => action.onSelect ? (
                <button className={styles.userMenuAction} key={action.id} onClick={action.onSelect} type="button">
                  {action.icon ? <Icon size="sm">{action.icon}</Icon> : null}
                  <Text as="span" variant="small">{action.label}</Text>
                </button>
              ) : action.href ? (
                <Link className={styles.userMenuAction} href={action.href} key={action.id}>
                  {action.icon ? <Icon size="sm">{action.icon}</Icon> : null}
                  <Text as="span" variant="small">{action.label}</Text>
                </Link>
              ) : null)}
            </Stack>
          ) : (
            <Text variant="caption" tone="muted">User actions are not connected yet.</Text>
          )}
        </Stack>
      </Surface>
    </details>
  );
}
