import type { ReactElement, ReactNode } from "react";

export type NavigationPermission = string;

export type NavigationBadge = {
  label: string;
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
};

export type NavigationItemModel = {
  id: string;
  label: string;
  href: string;
  icon?: ReactElement;
  badge?: NavigationBadge;
  isActive?: boolean;
  disabled?: boolean;
  permissions?: readonly NavigationPermission[];
  children?: readonly NavigationItemModel[];
};

export type NavigationGroupModel = {
  id: string;
  label: string;
  items: readonly NavigationItemModel[];
  permissions?: readonly NavigationPermission[];
};

export type BreadcrumbItemModel = {
  id: string;
  label: string;
  href?: string;
  current?: boolean;
};

export type UserMenuAction = {
  id: string;
  label: string;
  href?: string;
  icon?: ReactElement;
  onSelect?: () => void;
};

export type UserMenuModel = {
  name: string;
  description?: string;
  avatar?: ReactNode;
  actions?: readonly UserMenuAction[];
};

export type WorkspaceOption = {
  id: string;
  label: string;
};

export type WorkspaceSwitcherModel = {
  current: WorkspaceOption;
  options?: readonly WorkspaceOption[];
};
