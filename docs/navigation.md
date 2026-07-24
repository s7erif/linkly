# OI Platform V2 Application Shell and Navigation

## Status and scope

The V2 navigation framework lives at `src/design/navigation/` and is exported through `@/design/navigation`.

Sprint 8 creates an isolated shell only. It is not mounted by an application layout or page. Existing Admin, Customer Workspace, public navigation, routes, permissions, authentication, data access, and business behavior remain unchanged.

## Architecture

```text
AppShell
|-- Sidebar (desktop)
|   |-- SidebarSection / SidebarGroup
|   |   +-- SidebarItem
|   |       +-- nested SidebarItem records
|   +-- optional footer slot
|-- Header
|   |-- Breadcrumb
|   |-- SearchTrigger
|   +-- HeaderActions
|       |-- ThemeSwitcher
|       |-- NotificationButton
|       +-- UserMenu
|-- content slot
+-- MobileDrawer
    +-- Sidebar (mobile)
```

AppShell owns only temporary presentation state:

- Desktop Sidebar expanded or collapsed.
- Mobile Drawer open or closed.

ThemeSwitcher consumes the existing Theme Engine. Navigation, identity, breadcrumbs, badges, permissions, routes, notification counts, workspace data, and action callbacks are inputs. The shell contains no data fetching or product workflow.

## Dependency hierarchy

```text
Design Tokens and Theme Engine
          |
Surface System
          |
Primitive Library
          |
Component Library
          |
Navigation and AppShell
          |
Future approved page layouts
```

Navigation imports only the current Design System layers and Lucide icon elements. It does not import legacy components, feature modules, pages, application services, repositories, or route configuration.

## Typed navigation model

`NavigationGroupModel` contains stable ID, visible label, items, and optional future permission keys.

`NavigationItemModel` contains stable ID, label, required caller-supplied href, optional icon, semantic badge, active state, disabled state, future permission keys, and nested items.

Routes are never declared inside Sidebar, SidebarItem, or AppShell. The consuming product builds the model after applying routing and authorization policy.

Permission metadata is intentionally passive in Sprint 8. Navigation components do not decide authorization. A future integration layer must filter the model before rendering; server-side route authorization remains authoritative.

## Shell regions

### Sidebar

Desktop Sidebar supports expanded and collapsed presentation. Expanded mode shows section labels, item labels, nested groups, and badges. Collapsed mode retains icon controls with accessible labels.

Nested groups use native `details` and `summary` behavior. Active items use `aria-current="page"`.

### Header

Header composes the mobile trigger, Breadcrumb, SearchTrigger, ThemeSwitcher, NotificationButton, and optional UserMenu. Search and notification actions are callbacks only. No business integration is implemented.

### WorkspaceSwitcher

WorkspaceSwitcher is an exported placeholder backed by a typed model. It displays the current workspace and exposes a caller-supplied trigger. It does not select, persist, fetch, or authorize workspaces.

### UserMenu

UserMenu accepts caller-provided identity and action links. Without actions, it reports that integration is unavailable instead of fabricating behavior.

## Responsive behavior

| Range | Behavior |
|---|---|
| Wide desktop | Expandable Sidebar, full search trigger, breadcrumb, theme controls, notifications, and user identity |
| Compact desktop/tablet | Desktop Sidebar remains; search and user controls compact without losing accessible names |
| Mobile | Desktop Sidebar is hidden, menu trigger is shown, gutters reduce, and navigation opens in a modal Drawer |

The Drawer uses logical inset properties, so it opens from inline-start in LTR and RTL. Sidebar padding, nesting, badges, popovers, and content gutters also use logical properties.

Responsive thresholds are structural media-query boundaries. All layout dimensions, gaps, widths, surfaces, colors, borders, elevation, and motion resolve through Design or Surface tokens.

## Keyboard behavior

- Native Tab and Shift+Tab navigation is preserved.
- Sidebar supports Arrow Up, Arrow Down, Home, and End across enabled controls.
- Nested groups retain native Enter and Space behavior through `summary`.
- Mobile Drawer moves focus inside when opened.
- Tab focus is contained while the Drawer is open.
- Escape closes the Drawer.
- Closing restores focus to the previous trigger.
- UserMenu uses native `details` and `summary` behavior.
- Theme options expose state through `aria-pressed`.

## Accessibility

- Sidebar and breadcrumb use named navigation landmarks.
- Active navigation exposes `aria-current="page"`.
- Collapsed items retain accessible names.
- Disabled links expose unavailable semantics and leave the tab order.
- Mobile Drawer uses `role="dialog"` and `aria-modal="true"`.
- Icon-only controls require labels through Button.
- Notification count is included in the accessible name.
- Decorative icons are hidden by Icon.
- Focus appearance uses Component and Surface tokens.
- Reduced-motion mode removes shell transition duration.
- Forced-colors mode preserves selected-state borders.
- Components inherit document direction and theme.

## Theme integration

ThemeSwitcher calls only the existing `useTheme()` API with Light, Dark, or System. It reads `currentTheme` for pressed state and `resolvedTheme` for System context. It introduces no storage, media-query, root-attribute, or persistence logic. ThemeProvider remains the sole authority.

## Composition example

```tsx
import { LayoutDashboard, Settings } from "lucide-react";
import { AppShell, type NavigationGroupModel } from "@/design/navigation";

const navigation: NavigationGroupModel[] = [{
  id: "primary",
  label: "Platform",
  items: [
    {
      id: "overview",
      label: "Overview",
      href: destination.overview,
      icon: <LayoutDashboard />,
      isActive: true,
    },
    {
      id: "settings",
      label: "Settings",
      href: destination.settings,
      icon: <Settings />,
      permissions: ["settings:read"],
    },
  ],
}];

<AppShell navigation={navigation}>{children}</AppShell>;
```

This documents composition only. Sprint 8 does not mount it.

## Future extension points

- Server-side permission filtering.
- Next.js route-aware active-state adapter.
- Search and notification integrations.
- Authenticated user actions.
- Workspace selection and persistence.
- Controlled Sidebar collapse persistence.
- Product-specific Admin or Workspace composition.

Each requires a separately approved integration sprint. Authorization and business decisions must remain outside navigation components.

## Anti-patterns

- Hardcoding product routes in Design System components.
- Filtering authorization only in the browser.
- Importing legacy shell CSS or components.
- Fetching identity, notifications, or workspaces inside the shell.
- Duplicating desktop and mobile navigation models.
- Creating another theme store or root theme attribute.
- Mounting AppShell during this foundation sprint.
- Adding decorative motion.


## Sprint 8 validation

- Public navigation exports: 14 of 14.
- Navigation CSS token references: 52 resolved, zero missing.
- Theme API connection: Light, Dark, and System use the existing Theme Engine.
- Sidebar keyboard contract: Arrow Up, Arrow Down, Home, and End present.
- Drawer keyboard contract: Tab containment and Escape dismissal present.
- Drawer focus contract: entry focus and trigger restoration present.
- Responsive mobile Drawer rules: present.
- RTL logical properties: present.
- Reduced-motion handling: present.
- Hardcoded product routes: zero.
- Inline style attributes: zero.
- Existing application consumers: zero.
- Typecheck: pass.
- Production build: pass.
- Architecture checker: pass.
