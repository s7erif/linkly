"use client";

import { useState, type ReactNode } from "react";
import { Box } from "../primitives";
import { Header, type HeaderProps } from "./Header";
import { MobileDrawer } from "./MobileDrawer";
import { Sidebar } from "./Sidebar";
import type { NavigationGroupModel } from "./types";
import styles from "./navigation.module.css";

export type AppShellProps = {
  brand?: ReactNode;
  children: ReactNode;
  header?: Omit<HeaderProps, "onMobileMenuOpen">;
  navigation: readonly NavigationGroupModel[];
  platformName?: string;
  sidebarFooter?: ReactNode;
};

export function AppShell({
  brand,
  children,
  header,
  navigation,
  platformName,
  sidebarFooter,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box className={styles.appShell}>
      <div className={styles.desktopSidebar}>
        <Sidebar
          brand={brand}
          collapsed={collapsed}
          footer={sidebarFooter}
          groups={navigation}
          platformName={platformName}
          onCollapsedChange={setCollapsed}
        />
      </div>
      <Box className={styles.appMain}>
        <Header {...header} onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className={styles.appContent}>{children}</main>
      </Box>
      <MobileDrawer
        brand={brand}
        groups={navigation}
        platformName={platformName}
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
      />
    </Box>
  );
}
