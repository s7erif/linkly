"use client";

import { ContactRound, KeyRound, LayoutDashboard, LogOut, RadioTower, Settings, ShoppingBag, Tags, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import { AppShell, type NavigationGroupModel } from "@/design/navigation";
import { Text } from "@/design/primitives";

type Props = { adminName: string; platformName: string; children: ReactNode };

const navigation: readonly NavigationGroupModel[] = [
  { id: "workspace", label: "Workspace", items: [
    { id: "overview", label: "Command center", href: "/admin", icon: <LayoutDashboard /> },
  ] },
  { id: "commerce", label: "Commerce", items: [
    { id: "orders", label: "Digital Orders", href: "/admin/orders", icon: <ShoppingBag /> },
    { id: "plans", label: "Plans", href: "/admin/plans", icon: <Tags /> },
    { id: "customers", label: "Customers", href: "/admin/customers", icon: <ContactRound /> },
    { id: "cards", label: "NFC Cards", href: "/admin/cards", icon: <RadioTower /> },
    { id: "activations", label: "Activation Center", href: "/admin/subscription-activations", icon: <KeyRound /> },
  ] },
  { id: "settings", label: "Settings", items: [
    { id: "system-settings", label: "Platform Settings", href: "/admin/settings", icon: <Settings /> },
  ] },
];

function matchesPath(href: string, pathname: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
}

function pathLabel(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "admin";
  return segment
    .split("-")
    .map((part) => part ? part[0].toUpperCase() + part.slice(1) : part)
    .join(" ");
}

export function AdminShellBoundary({ adminName, platformName, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const activeNavigation = navigation.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive: matchesPath(item.href, pathname),
    })),
  }));
  const activeItem = activeNavigation
    .flatMap((group) => group.items)
    .find((item) => item.isActive);
  const currentLabel = activeItem?.label ?? pathLabel(pathname);

  return (
    <AppShell
      header={{
        breadcrumbs: [
          pathname === "/admin"
            ? { id: "admin", label: "Admin" }
            : { id: "admin", label: "Admin", href: "/admin" },
          { id: "current", label: currentLabel, current: true },
        ],
        notificationCount: 0,
        user: {
          name: adminName,
          description: "Administrator",
          actions: [
            { id: "settings", label: "Account settings", href: "/admin/settings", icon: <UserRound /> },
            { id: "sign-out", label: "Sign out", onSelect: () => void signOut({ redirect: false }).then(() => { router.replace("/admin/login"); router.refresh(); }), icon: <LogOut /> },
          ],
        },
      }}
      navigation={activeNavigation}
      platformName={platformName}
      sidebarFooter={<Text variant="caption" tone="muted">All systems operational</Text>}
    >
      {children}
    </AppShell>
  );
}
