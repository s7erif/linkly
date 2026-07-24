# Admin Dashboard Overview V2 Pilot Migration

## Scope

Sprint 9 migrates only the exact `/admin` Overview route to the OI Platform V2 Design System. Every child route under `/admin/*` continues to use the legacy AdminShell and legacy page presentation.

Authentication, authorization, dashboard data fetching, repository queries, APIs, mutations, and business rules are unchanged.

## Route isolation

The authenticated Server layout continues to own `getServerSession` and redirect behavior. It now delegates visual shell selection to `AdminShellBoundary`:

| Path | Shell |
|---|---|
| Exact `/admin` | V2 AppShell |
| Any `/admin/*` child route | Existing legacy AdminShell |

The shared loading and error boundaries use the same exact-path decision. This prevents the pilot from changing loading or failure presentation on other Admin pages.

## Legacy to V2 mapping

| Legacy Overview implementation | V2 pilot implementation |
|---|---|
| AdminShell | AppShell through the exact-route boundary |
| Legacy topbar | Header |
| Legacy Breadcrumbs | Breadcrumb supplied through AppShell |
| AdminPageHeader | Heading, Text, Inline, Stack, and Button |
| AdminStatCard | Card, Stack, Inline, Text, and tokenized icon slot |
| Legacy StatusBadge | Badge |
| Legacy EmptyState | EmptyState |
| Legacy action links | Button anchors |
| Legacy overview grid | Grid and Stack with route-local responsive composition |
| Legacy table scroll wrapper | Semantic table inside a tokenized overflow region |
| Legacy loading blocks | Skeleton variants |
| Legacy route error panel | EmptyState and Button |
| Admin shell CSS selectors | V2 tokens, surfaces, primitives, components, navigation, and Overview CSS Module |

The Overview page no longer imports AdminDesignSystem, AdminReadUI, or admin-shell.module.css.

## Data and functionality parity

The Server Component still performs exactly one `adminReadService.dashboard()` call.

The migrated page preserves:

- Customers and active-customer totals.
- Published and total-card totals.
- Active subscription total.
- Captured revenue.
- Pending-order work queue.
- Payment review shortcut.
- Recent orders and their detail links.
- Recent customer and order activity.
- System status presentation.
- Analytics link.
- Existing quick-action destinations.
- Empty order and clear-queue states.

Status text formatting moved into the page as a presentation-only formatter so the page does not import the legacy visual module.

## Component usage

### Component Library

- Badge
- Button
- Card
- EmptyState
- Skeleton

### Primitive Library

- Box
- Grid
- Heading
- Inline
- Stack
- Text

### Navigation System

- AppShell
- Sidebar
- Header
- Breadcrumb
- ThemeSwitcher
- NotificationButton
- UserMenu
- MobileDrawer

### Surface System and Design Tokens

Card and AppShell composition resolve through the Surface System. Page CSS contains no hardcoded colors, shadows, radii, typography values, or spacing values.

The Overview directly imports the canonical `src/design/index.css` entry. Rendered verification found that the older nested import through globals.css did not emit Design Token definitions. The route-local direct import resolves tokens for the pilot without activating V2 global styles on legacy Admin routes.

## Responsive behavior

Desktop uses:

- Expanded or collapsible Sidebar.
- Four KPI cards.
- A 70/30 main content grid.
- Full Header search and user context.
- A three-column quick-action grid.

Tablet uses:

- Two KPI columns.
- One-column main content flow.
- Two quick-action columns.
- Compact Header actions.

Mobile uses:

- One content flow.
- One KPI and quick-action column.
- Hidden desktop Sidebar.
- Modal MobileDrawer.
- Horizontally scrollable semantic orders table.
- Reduced content gutters.

No alternate or duplicated dashboard JSX exists for breakpoints.

## Theme verification

Rendered verification covered:

- Light selection and persistence.
- Dark selection and persistence.
- System selection and resolved operating-system preference.
- Semantic surfaces, text, borders, status badges, and actions in Light and Dark.
- No undefined Design Tokens.
- No missing generated class names.

The ThemeSwitcher System tooltip was made hydration-stable by removing server/client-dependent resolved-theme text. Theme behavior and API usage are unchanged.

## Accessibility

- One main landmark.
- Named Sidebar and breadcrumb navigation.
- Hierarchical page and section headings.
- KPI region has an accessible label.
- Tables use semantic headers and scoped columns.
- Active navigation uses `aria-current`.
- MobileDrawer moves focus inside, traps Tab, closes with Escape, and restores trigger focus.
- Theme options expose `aria-pressed`.
- Empty and error states provide readable recovery content.
- Loading uses `aria-busy`, status semantics, and decorative Skeletons.
- Logical CSS supports RTL.
- Reduced-motion removes Skeleton and transition motion through existing tokens.
- Forced-colors status indicators remain visible.

## Performance

The Overview remains a Server Component and performs its existing server-side read. It introduces no client-side data fetching.

Hydration is limited to:

- Exact-route shell selection.
- Sidebar collapse state.
- MobileDrawer interaction.
- ThemeSwitcher.
- Existing user-menu and navigation interaction.
- Shared route-aware loading and error boundaries.

Dashboard sections and data rendering remain server-rendered.

## Verification results

- Typecheck: pass.
- Production build: pass.
- Architecture checker: pass.
- Authenticated production render: pass.
- Production browser runtime errors: zero.
- Light, Dark, and System: pass.
- RTL: pass.
- Desktop and mobile viewport overflow: none.
- Mobile Drawer focus and Escape behavior: pass.
- Orders route legacy-shell isolation: pass.
- Missing generated class names: zero.
- Legacy Overview visual imports: zero.
- Dashboard data calls: one, unchanged.

## Remaining migration work

No additional Admin page is migrated by Sprint 9. Orders, Customers, Cards, Billing, Analytics, CMS, Media, Settings, and all detail pages remain on the legacy visual system.

## Known limitations

- Search remains a placeholder trigger.
- Notifications remain an unintegrated zero-count affordance.
- Workspace switching is not mounted for the Admin pilot.
- Navigation permission metadata remains passive; server authorization stays authoritative.
- Navigation destinations intentionally match the existing six-item legacy shell.
- Loading and error behavior were structurally verified; their transient display depends on an actual delayed or failed read.


## Persistent shell correction

The V2 AppShell is now persistent for the complete authenticated Admin route segment. This corrects a navigation continuity defect in the pilot architecture: switching between the exact Overview and child routes previously replaced AppShell with the legacy AdminShell.

Only shell ownership changed. Child Admin pages remain on their existing legacy page presentation and business behavior until separately approved migrations. The canonical Design stylesheet is root-owned; the Overview no longer imports it as a route asset.


## Premium Overview showcase pass

The exact `/admin` route now opts into a presentation-only AppShell showcase state. The state is pathname-derived in `AdminShellBoundary`, is exposed through the product-neutral `AppShell.showcase` prop, and is absent from every child Admin route. It changes no navigation model, destination, permission, shell state, or business behavior.

The Overview presentation now differentiates KPI, primary work, tabular, revenue, activity, status, and action surfaces with canonical Design Tokens. Glass remains limited to the existing Sidebar, Header, search, theme control, and user control surfaces. Main dashboard cards remain opaque semantic surfaces.

Motion is limited to token-duration hover, press, focus, and elevation feedback. RTL reverses directional motion; reduced-motion resolves the new transitions to the instant duration. Forced-colors replaces decorative accents with system colors and explicit borders.

No data fetching, metrics, order rendering, links, empty states, APIs, repositories, or other Admin page was changed.


## Sprint 12A client-showcase composition

The exact `/admin` Overview now follows the approved showcase hierarchy: hero, four KPI cards, a primary Instant Orders region with a secondary activity/action/health rail, a full-width analytics preview, and the canonical Data Grid for Latest Orders. The page remains a Server Component and performs the same single dashboard read. Existing values, destinations, empty behavior, and authorization remain authoritative.

`OverviewOrdersTable` is the only new Client boundary. It adapts serializable order display rows to the existing callback-driven Data Grid because that canonical component owns keyboard interaction. It performs no fetching, mutation, query management, or domain logic.

The analytics visualization is explicitly labelled as an illustrative preview rather than live business data. Glass remains confined to the persistent shell and floating controls; all dashboard content uses opaque semantic surfaces. Responsive behavior changes the composition through CSS only, with one content hierarchy and one table markup across desktop, tablet, and mobile.

Production verification confirms exactly four KPI cards, a desktop 70/30 primary grid, single-column tablet and mobile adaptation, mobile stacked Data Grid rows, no document overflow, token-resolved Light/Dark/System themes, zero hydration or runtime errors, and reduced-motion transition removal.


## Sprint 12B premium visual polish

Sprint 12B retains the Sprint 12A information architecture and applies a presentation-only refinement. The hero now adds an operational insight derived from the existing pending-order metric. KPI cards retain exactly four canonical metrics while gaining stronger icon, trend, value, and hover hierarchy. Instant Orders, Recent Activity, Quick Actions, Business Health, analytics, and the Data Grid keep their existing data and destinations.

The health summary uses only the existing pending-order value plus presentation labels for monitoring and confidence; it does not claim live renewal counts or introduce a backend source. Analytics remains explicitly illustrative. Glass is still restricted to the exact-route Header and Sidebar, while content surfaces remain opaque.

The final production browser matrix confirms the desktop 70/30 layout, tablet and mobile single-column adaptation, four KPI cards, mobile stacked Data Grid, labelled controls, one main landmark, no document overflow, Light/Dark/System resolution, reduced-motion behavior, no hydration or runtime errors, and child-route showcase isolation.
