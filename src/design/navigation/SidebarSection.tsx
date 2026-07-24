import { Stack, Text } from "../primitives";
import { SidebarItem } from "./SidebarItem";
import type { NavigationGroupModel } from "./types";
import styles from "./navigation.module.css";

export type SidebarSectionProps = {
  collapsed?: boolean;
  group: NavigationGroupModel;
};

export function SidebarSection({ collapsed = false, group }: SidebarSectionProps) {
  const labelId = "oi-nav-group-" + group.id;

  return (
    <Stack as="section" aria-labelledby={collapsed ? undefined : labelId} gap="xs">
      {!collapsed ? (
        <Text as="h2" className={styles.sidebarSectionLabel} id={labelId} variant="caption">
          {group.label}
        </Text>
      ) : null}
      <Stack gap="xs">
        {group.items.map((item) => (
          <SidebarItem collapsed={collapsed} item={item} key={item.id} />
        ))}
      </Stack>
    </Stack>
  );
}
