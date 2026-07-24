"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { Button } from "../components";
import { Inline, Stack, Surface, Text } from "../primitives";
import type { NavigationGroupModel } from "./types";
import { SidebarSection } from "./SidebarSection";
import styles from "./navigation.module.css";

export type SidebarProps = {
  brand?: ReactNode;
  collapsed?: boolean;
  groups: readonly NavigationGroupModel[];
  label?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
  footer?: ReactNode;
  platformName?: string;
};

function focusableNavigationItems(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a:not([aria-disabled="true"]), summary, button:not(:disabled)',
    ),
  );
}

export function Sidebar({
  brand,
  collapsed = false,
  footer,
  groups,
  label = "Primary navigation",
  onCollapsedChange,
  platformName = "Platform",
}: SidebarProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = focusableNavigationItems(event.currentTarget);
    if (!items.length) return;

    const activeIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex = activeIndex;

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (event.key === "ArrowDown") nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
    if (event.key === "ArrowUp") nextIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;

    event.preventDefault();
    items[nextIndex]?.focus();
  };

  return (
    <Surface
      as="aside"
      className={styles.sidebar}
      data-collapsed={collapsed || undefined}
      radius="none"
      variant="glass"
    >
      <Inline className={styles.sidebarHeader} gap="sm" justify="between">
        <Inline className={styles.sidebarBrand} gap="sm">
          {brand}
          {!brand ? (
            <>
              <Surface className={styles.brandMark} radius="md" variant="elevated">
                <Text as="span" variant="small">OI</Text>
              </Surface>
              {!collapsed ? <Text as="strong" variant="title">{platformName}</Text> : null}
            </>
          ) : null}
        </Inline>
        {onCollapsedChange ? (
          <Button
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            iconOnly
            leftIcon={collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            onClick={() => onCollapsedChange(!collapsed)}
            size="sm"
            variant="ghost"
          />
        ) : null}
      </Inline>
      <Stack
        as="nav"
        aria-label={label}
        className={styles.sidebarNavigation}
        gap="lg"
        onKeyDown={handleKeyDown}
      >
        {groups.map((group) => (
          <SidebarSection collapsed={collapsed} group={group} key={group.id} />
        ))}
      </Stack>
      {footer ? <div className={styles.sidebarFooter}>{footer}</div> : null}
    </Surface>
  );
}
