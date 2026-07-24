import { Menu } from "lucide-react";
import { Button } from "../components";
import { Inline, Surface } from "../primitives";
import { Breadcrumb } from "./Breadcrumb";
import { HeaderActions } from "./HeaderActions";
import { NotificationButton } from "./NotificationButton";
import { SearchTrigger } from "./SearchTrigger";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { UserMenu } from "./UserMenu";
import type { BreadcrumbItemModel, UserMenuModel } from "./types";
import styles from "./navigation.module.css";

export type HeaderProps = {
  breadcrumbs?: readonly BreadcrumbItemModel[];
  notificationCount?: number;
  onMobileMenuOpen?: () => void;
  onNotifications?: () => void;
  onSearch?: () => void;
  searchLabel?: string;
  user?: UserMenuModel;
};

export function Header({
  breadcrumbs = [],
  notificationCount = 0,
  onMobileMenuOpen,
  onNotifications,
  onSearch,
  searchLabel,
  user,
}: HeaderProps) {
  return (
    <Surface as="header" className={styles.header} radius="none" variant="glass">
      <Inline className={styles.headerInner} gap="md" justify="between">
        <Inline className={styles.headerContext} gap="sm">
          <Button
            aria-label="Open navigation"
            className={styles.mobileMenuButton}
            iconOnly
            leftIcon={<Menu />}
            onClick={onMobileMenuOpen}
            size="sm"
            variant="ghost"
          />
          {breadcrumbs.length ? <Breadcrumb items={breadcrumbs} /> : null}
        </Inline>
        {onSearch ? <SearchTrigger label={searchLabel} onTrigger={onSearch} /> : null}
        <HeaderActions>
          <ThemeSwitcher />
          {onNotifications || notificationCount > 0 ? <NotificationButton count={notificationCount} onTrigger={onNotifications} /> : null}
          {user ? <UserMenu user={user} /> : null}
        </HeaderActions>
      </Inline>
    </Surface>
  );
}
