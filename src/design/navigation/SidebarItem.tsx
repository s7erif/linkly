import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Badge } from "../components";
import { Icon, Inline, Stack, Text } from "../primitives";
import { cx } from "../primitives/utils";
import type { NavigationItemModel } from "./types";
import styles from "./navigation.module.css";

export type SidebarItemProps = {
  collapsed?: boolean;
  item: NavigationItemModel;
  level?: number;
};

function ItemLink({
  collapsed = false,
  item,
  level = 0,
}: SidebarItemProps) {
  const label = collapsed ? item.label : undefined;

  return (
    <Link
      aria-current={item.isActive ? "page" : undefined}
      aria-disabled={item.disabled || undefined}
      aria-label={label}
      className={cx(
        styles.sidebarItem,
        item.isActive && styles.sidebarItemActive,
        item.disabled && styles.sidebarItemDisabled,
        collapsed && styles.sidebarItemCollapsed,
        level > 0 && styles.sidebarItemNested,
      )}
      href={item.href}
      onClick={item.disabled ? (event) => event.preventDefault() : undefined}
      tabIndex={item.disabled ? -1 : undefined}
    >
      {item.icon ? <Icon size="sm">{item.icon}</Icon> : null}
      <Inline className={styles.sidebarItemContent} gap="sm" justify="between">
        <Text as="span" className={styles.sidebarItemLabel} variant="small">
          {item.label}
        </Text>
        {!collapsed && item.badge ? (
          <Badge size="sm" variant={item.badge.tone ?? "neutral"}>
            {item.badge.label}
          </Badge>
        ) : null}
      </Inline>
    </Link>
  );
}

export function SidebarItem(props: SidebarItemProps) {
  const { collapsed = false, item, level = 0 } = props;

  if (!item.children?.length || collapsed) return <ItemLink {...props} />;

  const containsActiveItem = item.isActive || item.children.some((child) =>
    child.isActive || child.children?.some((nested) => nested.isActive),
  );

  return (
    <details className={styles.sidebarGroup} open={containsActiveItem || undefined}>
      <summary className={styles.sidebarGroupSummary}>
        <Inline gap="sm">
          {item.icon ? <Icon size="sm">{item.icon}</Icon> : null}
          <Text as="span" variant="small">{item.label}</Text>
        </Inline>
        <Icon className={styles.sidebarGroupChevron} size="xs">
          <ChevronDown />
        </Icon>
      </summary>
      <Stack className={styles.sidebarNested} gap="xs">
        {item.children.map((child) => (
          <SidebarItem item={child} key={child.id} level={level + 1} />
        ))}
      </Stack>
    </details>
  );
}
