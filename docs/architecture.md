# OI Platform Frontend Architecture

> Subscription and billing target boundaries are defined separately in [Subscription Architecture Foundation](./subscription-architecture.md). That document is architecture-only and does not describe implemented billing behavior.

**Status:** Architecture lock specification  
**Scope:** Frontend rendering, dependencies, styling, themes, and Design System integration  
**Change policy:** This document records current boundaries, detected risks, and recommendations. It does not authorize visual or implementation changes.

## Table of contents

1. [Project architecture](#project-architecture)
2. [Current architecture audit](#current-architecture-audit)
3. [Architecture rules](#architecture-rules)
4. [Dependency rules](#dependency-rules)
5. [Rendering rules](#rendering-rules)
6. [CSS and Design System ownership](#css-and-design-system-ownership)
7. [Duplicate detection](#duplicate-detection)
8. [Risks](#risks)
9. [Recommendations](#recommendations)
10. [Future Design System integration](#future-design-system-integration)

---

# Project architecture

## Folder structure

```text
src/
├── app/                  Next.js routes, layouts, loading/error boundaries, and transport handlers
├── components/           Cross-feature presentation and composed UI
├── design/               OI Platform V2 tokens, themes, compatibility, and mounted ThemeProvider
├── design-system/        Legacy primitive entry points backed by src/design compatibility aliases
├── domain/               Business entities, policies, and domain behavior
├── dto/                  Boundary-safe application data contracts
├── events/               Domain and application event definitions
├── features/             Feature-owned UI, actions, adapters, and local styling
├── generated/            Generated Prisma clients; never edited manually
├── lib/                  Composition, infrastructure helpers, auth, validation, and shared services
├── notifications/        Notification providers and templates
├── repositories/         Persistence contracts and implementations
├── services/             Application services
├── transport/            HTTP transport abstractions and schemas
├── types/                Shared TypeScript types
├── use-cases/            Application operations and orchestration
└── validation/           Shared input and use-case validation
```

## Rendering model

The application uses the Next.js App Router and React Server Components.

- Route pages and layouts are Server Components unless explicitly marked with `"use client"`.
- Server Components own authentication checks, redirects, data loading, and initial composition.
- Client Components own browser state, event handlers, browser APIs, and interactive transitions.
- Server Components may render Client Components, passing serializable props.
- Client boundaries must be narrow and located as close as practical to the interaction that requires them.
- CSS Module ownership is independent of the rendering boundary: every consuming module imports its stylesheet directly.

## Server Components

Server Components are the default for:

- Pages and layouts.
- Data reads and application-service calls.
- Metadata and routing decisions.
- Static presentation without browser interaction.
- Composition of server-safe shared components.
- Passing serializable data into interactive islands.

Server Components must not import browser-only helpers, hooks, client state, or non-component runtime values from Client Components.

## Client Components

Client Components are reserved for:

- Local interactive state.
- Event handlers.
- Browser APIs such as clipboard, storage, media queries, and object URLs.
- Interactive dialogs, drawers, menus, editors, and action controls.
- Context providers that require browser synchronization.

A Client Component may own its own styles. It must not provide a CSS Module object, configuration object, constants, or helper values to a Server Component.

## Shared layout responsibilities

Layout responsibilities are separated into three levels:

1. **Root layout:** document structure, fonts, global providers already approved for the application, and global navigation.
2. **Route-group or area layout:** authentication, area shell selection, and persistent area chrome.
3. **Page:** page-specific hierarchy, data, sections, and actions.

For Admin, `src/app/admin/layout.tsx` owns authentication and places content inside `AdminShell`. `AdminShell` owns the sidebar, topbar, shell state, and content viewport. Admin pages own only their page header, controls, data presentation, and page-specific sections.

Pages must not reproduce shell navigation, topbar structure, global content offsets, or authentication logic.

## Theme architecture

The V2 design foundation is owned by `src/design`:

- `tokens.css` defines primitive visual scales.
- `themes.css` maps semantic color roles for Light, Dark, and System.
- `surfaces.css` defines the canonical surface, elevation, Glass, border, and overlay contracts.
- `surface-utilities.css` exposes opt-in visual utility classes without page integration.
- `primitives/` contains the canonical product-neutral Box, layout, typography, Surface, Icon, Separator, and Spacer layer.
- `components/` contains the canonical V2 Button, field, Badge, Card, Skeleton, and Empty State foundation.
- `theme.ts` defines theme names and storage/attribute contracts.
- `ThemeProvider.tsx` provides the mounted Light, Dark, and System API.
- `ThemeScript.tsx` restores and resolves the persisted selection before hydration.
- `legacy-compat.css` preserves active and legacy variable contracts.
- `index.css` is the canonical CSS entry point.

The root layout mounts ThemeProvider around the existing application providers. A head script applies the resolved Light or Dark value to data-oi-theme before hydration; System follows prefers-color-scheme. The legacy data-theme contract remains separate.

## CSS architecture

Current CSS exists in several scopes:

- `src/app/globals.css`: imports the canonical design entry point and owns base rules and approved global utilities.
- Feature CSS Modules: Admin, appearance, marketing, public-card, and workspace-specific styles.
- Component CSS Modules: renderer and shared panel styles.
- `src/design`: the V2 token and theme foundation.
- `src/design-system`: legacy primitives whose token entry points alias `src/design`.

CSS Modules are local implementation dependencies. They are not application data and must never cross a Client/Server boundary through re-exports, props, context, or helper objects.

## Design System architecture

The intended V2 ownership model is:

```text
Design specification
        ↓
src/design tokens and semantic themes
        ↓
shared Design System primitives
        ↓
feature components
        ↓
pages and layouts
```

Tokens define values. Themes map semantic meaning. Primitives encode accessible interaction and visual contracts. Feature components compose primitives around product workflows. Pages compose features and data without inventing visual rules.

---

# Current architecture audit

## Audit status

| Requirement | Status | Evidence |
|---|---|---|
| Admin architecture audited | Complete | Pages, layout, shell, shared Admin UI, CSS Module imports, and Client boundaries inspected |
| Every Admin Server Component imports CSS Modules directly | Passed | All Admin Server Components with page-level styles import `admin-shell.module.css` directly |
| No CSS Module object is re-exported through a Client Component | Passed | Project-wide export scan found no CSS Module object re-exports |
| Client Components never act as CSS providers | Passed | Client Components import styles for their own markup only |
| Shared layout responsibilities are separated | Mostly compliant | Admin authentication is in the layout; shell chrome is in `AdminShell`; pages generally own page content |
| ThemeProvider mounted once at the root | Passed | Root layout mounts the provider; no page-level mounts exist |
| One source of truth for design tokens and themes | Passed | Canonical values and compatibility aliases are owned by `src/design`; legacy entry points contain aliases only |
| Duplicate styling patterns detected | Complete | Repeated primitives and hardcoded values identified across feature CSS |
| Duplicate utility components detected | Complete | Admin utilities and existing Design System primitives overlap |
| Duplicate layout logic detected | Complete | Shell logic is centralized, but repeated page headers, filters, panels, and table composition remain |

## CSS Module boundary finding

The project-wide cleanup audit found no remaining CSS Module object re-exports, CSS Module objects passed through props, or indirect CSS Module imports. Admin Settings now follows the same direct-import architecture as every other Admin Server Component.

## Client boundary finding

Server-to-Client imports are otherwise component imports: Admin shell, action controls, media controls, CMS editor, access entry, order flow, and appearance editor. These are valid interactive islands when their props remain serializable.

No other Server Component was found importing configuration, helper objects, or CSS Module mappings from a Client Component.

## Theme activation finding

The root layout mounts `ThemeProvider` once. `ThemeScript` restores the persisted selection before hydration, and `data-oi-theme` contains only the resolved Light or Dark mode. Full validation is recorded in `docs/theme-engine.md`.

## Source-of-truth finding

`src/design` is the single architectural owner of reusable tokens, semantic V2 themes, and legacy compatibility mappings. `src/design-system` exposes aliases only, while `src/app/globals.css` imports the canonical entry point. Feature-scoped hardcoded values remain migration candidates, not canonical definitions. The complete inventory is in `docs/token-migration.md`.

---

# Architecture rules

## Mandatory CSS rules

1. CSS Modules must always be imported directly by every file that reads their class map.
2. Never re-export a CSS Module object.
3. Never pass a CSS Module object through props, context, configuration, or helper return values.
4. Client Components must never own styling for Server Components.
5. A shared component owns its internal classes; a page imports its own page-level classes directly.
6. Global CSS is limited to resets, document defaults, token registration, theme registration, and explicitly approved global utilities.
7. Component and feature selectors belong in CSS Modules.
8. Generated CSS Module names must never be constructed manually.

## Mandatory Design System rules

1. Tokens are the only source of reusable colors.
2. Tokens are the only source of reusable spacing, typography, radius, shadow, blur, opacity, z-index, duration, and easing values.
3. Components never hardcode reusable design values.
4. Primitive tokens feed semantic tokens; components consume semantic tokens whenever available.
5. Themes change semantic values, not component behavior or business logic.
6. Components must support Light, Dark, System, RTL, LTR, keyboard navigation, and reduced motion where applicable.
7. Feature code must not define a competing token scale.

## Mandatory component rules

1. Reuse an existing primitive or shared component before introducing another equivalent.
2. Shared components remain presentation-focused and domain-neutral.
3. Feature components may encode workflow language and feature behavior.
4. Pages orchestrate data and composition; they do not become general-purpose component libraries.
5. Interactive behavior belongs in the smallest practical Client Component.
6. Server-safe constants, helpers, and types live in server-safe modules without `"use client"`.

---

# Dependency rules

## Allowed dependency direction

```text
Pages / Layouts
      ↓
Features and shared Components
      ↓
Design System primitives
      ↓
Design tokens and themes

Pages / Features
      ↓
Shared Utilities and application contracts
```

Dependencies must flow downward. Lower layers must not import pages, layouts, or feature-specific UI.

## Pages

May import:

- Layout-provided context through approved interfaces.
- Feature components and feature actions.
- Shared components.
- Design System components.
- CSS Modules directly.
- Server-safe services, use cases, DTOs, validation, and utilities.

Must not import:

- Non-component runtime values from Client Components.
- CSS Module objects through another TypeScript module.
- Another page as a reusable component.
- Concrete repository or database implementations.

## Layouts

May import:

- Area shells.
- Authentication and routing services.
- Global or area providers.
- Shared structural components.

Must not import:

- Page-specific data presentation.
- Feature workflows unrelated to shell responsibility.
- Page CSS through re-exports.

## Features

May import:

- Shared components.
- Design System primitives and design tokens.
- DTOs, validation, application actions, and utilities.
- Feature-local CSS Modules directly.

Must not import:

- App pages or layouts.
- Another feature's private implementation.
- Concrete persistence infrastructure.
- CSS Module objects from Client Components.

## Components

May import:

- Design System primitives.
- Design tokens.
- Shared types and presentation helpers.
- Component-local CSS Modules.

Must not import:

- Pages or layouts.
- Business repositories.
- Feature-specific actions unless the component belongs to that feature.

## Design

May import:

- React only where provider infrastructure requires it.
- Design-owned types and constants.

Must not import:

- Pages, layouts, features, application services, or product-specific components.

`src/design` owns tokens and theme contracts; it does not own product UI.

## Shared

Shared code must be domain-neutral within its layer. Shared UI may depend on Design System primitives. Shared application contracts may depend on domain types. A shared module must not become a shortcut around feature or rendering boundaries.

## Utilities

Utilities must be pure and environment-explicit. Browser utilities are marked and imported only by Client Components. Server utilities do not import React client entry points. Utilities never return CSS Module objects.

---

# Rendering rules

## Server-only

Use for:

- Authentication and authorization.
- Database-backed reads through approved application services.
- Secrets and protected configuration.
- Metadata generation.
- Redirects and not-found decisions.
- Server actions and transport composition.

Server-only modules must not be imported into Client Components.

## Client-only

Use for:

- Hooks and local state.
- Event handlers.
- `window`, `document`, `navigator`, local/session storage, media queries, and object URLs.
- Interactive focus management and browser observers.
- Theme preference synchronization.

Client-only modules must declare the boundary explicitly when exported directly to Server Components.

## Shared

Shared modules may contain:

- Serializable types.
- Pure formatting and validation helpers.
- Constants without browser or server-only dependencies.
- Presentation components that require neither hooks nor browser APIs.

Shared modules must not import from a Client Component merely to reuse a constant or helper.

## Interactive

Interactive components are Client Components. They receive the smallest serializable data contract required, own local interaction state, and report changes through approved actions or callbacks. Their Client boundary must not force an entire page or layout onto the client unnecessarily.

---

# CSS and Design System ownership

## Canonical ownership

The intended future authority is:

| Concern | Canonical owner |
|---|---|
| UI specification | `docs/design-system-v2.md` |
| Frontend architecture | `docs/architecture.md` |
| Primitive tokens | `src/design/tokens.css` |
| Semantic themes | `src/design/themes.css` |
| Theme contracts | `src/design/theme.ts` |
| Theme runtime | `src/design/ThemeProvider.tsx` |
| Surface system | `src/design/surfaces.css` and `src/design/surface-utilities.css` |
| Core primitives | `src/design/primitives` |
| Interactive components | `src/design/components` |
| Feature styling | Feature-local CSS Modules consuming canonical tokens |

## Current compatibility boundary

Canonical tokens, themes, and surface definitions are active under `src/design`. Existing feature CSS and legacy primitives remain compatibility consumers until separately approved component migrations. No existing screen is changed merely to adopt the canonical foundation.

---

# Duplicate detection

## Duplicated styling patterns

The audit found repeated definitions for:

- Primary, secondary, ghost, and destructive buttons.
- Inputs, selects, labels, focus states, and error messages.
- Cards, panels, elevated surfaces, and borders.
- Status badges and semantic colors.
- Empty-state containers.
- Skeleton animation and reduced-motion overrides.
- Page headers, section headers, and muted descriptions.
- Responsive grids and content containers.
- Spacing, radius, shadow, and motion scales.

These patterns occur across Admin CSS, marketing CSS, appearance CSS, workspace panels, global CSS, renderer styles, and the existing primitive CSS.

## Duplicated token systems

Three independent token/theme sources currently overlap:

1. Active variables in `src/app/globals.css`.
2. Older tokens in `src/design-system/tokens.css` and `tokens.ts`.
3. V2 foundation in `src/design/tokens.css` and `themes.css`.

Feature CSS also contains hardcoded values, creating additional local token systems.

## Duplicated utility components

Overlapping responsibilities include:

- `AdminSkeleton` and `OISkeleton`.
- Admin empty-state UI and `OIEmptyState`.
- Admin status badges and `OIBadge`.
- Admin action classes and `OIButton`.
- Raw Admin form controls and `OIInput` / `OIField`.
- `AdminCard`, CMS `WebsiteSectionCard`, and repeated panel markup.
- Multiple share, QR, and public-card action implementations in current and archived public-card areas.

Not every overlap is semantically interchangeable. The duplication is a review signal, not authorization to consolidate working code.

## Future primitive replacement priority

No replacement is authorized by this audit. Future work should be reviewed in this order:

| Priority | Primitive groups | Reason |
|---|---|---|
| P0 — interaction contract | Buttons, inputs | Highest reuse; keyboard, focus, loading, disabled, validation, and destructive behavior must be consistent first |
| P1 — semantic feedback | Badges, empty states, skeletons | Repeated status and system-state patterns need consistent semantics, announcements, and reduced-motion behavior |
| P2 — structural surfaces | Cards, headers | Establish shared hierarchy and spacing after interaction primitives are stable |
| P3 — data composition | Tables | Highest structural risk; depends on buttons, badges, empty states, headers, responsive rules, and accessibility contracts |

Current overlap inventory:

- **Buttons:** Admin action classes, raw feature buttons, `OIButton`, and `OIIconButton`.
- **Cards:** `AdminCard`, CMS `WebsiteSectionCard`, Admin panels/summary cards, marketing cards, and renderer containers.
- **Inputs:** raw Admin/marketing/appearance controls, `OIInput`, `OIField`, and `OISearchInput`.
- **Badges:** Admin `StatusBadge`, Admin badge classes, CMS visibility badges, and `OIBadge`.
- **Empty states:** Admin `EmptyState`, inline Admin empty markup, media empty controls, and `OIEmptyState`.
- **Skeletons:** Admin route loading UI, `AdminSkeleton`, feature skeleton classes, and `OISkeleton`.
- **Tables:** Admin table panels and repeated table markup across list/detail pages.
- **Headers:** `AdminPageHeader`, handwritten Admin page headers, section headings, panel headers, and marketing section headers.

## Duplicated layout logic

The Admin shell itself is centralized. Repeated page-level layout logic remains in:

- Handwritten page headers alongside `AdminPageHeader`.
- Repeated filter form structures.
- Repeated table panel, toolbar, empty state, and pagination composition.
- Repeated details grids and summary cards.
- Repeated responsive grid decisions across feature stylesheets.

Public-card rendering is owned by `components/card-renderer`. Workspace Preview and the canonical public profile use the same renderer; feature-specific modules are data and shell adapters only.

---

# Risks

## High

No unresolved high-risk Theme Engine architecture issues were found in Sprint 4.

## Medium

1. **Hardcoded design values:** feature CSS can drift independently across themes and responsive states.
2. **Overlapping primitives:** similar buttons, badges, inputs, empty states, and skeletons can diverge in accessibility and behavior.
3. **Admin stylesheet breadth:** one large Admin CSS Module contains shell, page, CMS, media, table, form, and loading concerns, increasing accidental coupling.
4. **Layout ownership ambiguity:** repeated page headers and panels make shared-versus-page responsibility inconsistent.
5. **Public-card composition:** resolved by the shared `CardRenderer`; legacy renderer implementations must not be reintroduced.

## Low

1. **Dynamic CSS key risk:** computed class names can silently produce `undefined` when a declared variant has no matching CSS key.
2. **Architecture enforcement gap:** the current architecture checker protects data and service boundaries but does not enforce frontend CSS, token, or Client/Server rules.

---

# Recommendations

Recommendations are ordered by dependency and do not authorize implementation.

1. Extend the architecture checker to reject CSS Module re-exports and Server imports of non-component Client exports.
2. Treat `src/design` as the future canonical V2 source for tokens, semantic themes, motion, spacing, and typography.
3. Establish an explicit retirement or compatibility plan for `src/design-system` before consuming V2 tokens in components.
4. Map existing global and feature variables to semantic V2 tokens incrementally; do not combine this with page redesign.
5. Review shared primitives by the documented priority and by behavior/accessibility contract before deciding which overlaps are equivalent.
6. Define ownership boundaries for shell, page header, filters, data table framing, empty states, and loading states.
7. Add static checks for hardcoded reusable colors, spacing, motion, and z-index values after token integration is approved.
8. Add a check that every dynamic CSS Module variant has a declared class.
9. Preserve Server Components as the default and keep interactive islands narrow during Design System adoption.
10. Validate each integration batch in both themes, RTL/LTR, desktop/mobile, keyboard operation, typecheck, and production build.

---

# Future Design System integration

The Design System should plug into the application in this order:

## 1. Confirm authority — complete

`docs/design-system-v2.md`, this architecture document, and `src/design` are the canonical specification and token source.

## 2. Activate tokens without visual migration — complete

The root style boundary loads canonical tokens while existing components retain their compatibility and feature styles.

## 3. Mount the ThemeProvider — complete

The root mounts one provider, restores preference before hydration, keeps theme state separate from business state, and exposes no UI.

## 4. Establish core primitives — complete

The product-neutral layout, typography, Surface, Icon, Separator, and Spacer layer lives in `src/design/primitives`. Interactive controls remain deferred to the future component library.

## 5. Establish interactive components — complete

The canonical Button, Input, Textarea, Badge, Card, Skeleton, and Empty State library lives in `src/design/components`; it remains unmounted pending approved migrations.

## 6. Integrate by isolated component family

Adopt primitives and tokens in small, reviewable batches. Each batch covers one component family and must preserve current layout, content, and behavior unless redesign is separately approved.

## 7. Integrate feature surfaces

Feature components consume approved primitives. Feature CSS remains local for composition and workflow-specific layout but does not define independent token scales.

## 8. Integrate pages and layouts

Pages continue to compose Server and Client components. Layouts continue to own authentication and persistent shell structure. Token adoption must not move data fetching or shell responsibility into Client Components.

## 9. Retire obsolete sources

Only after all consumers have migrated and verification is complete should obsolete token files, duplicate primitives, or compatibility mappings be considered for removal. Removal requires a separate inventory and approval.

## Required integration gates

Every future Design System batch must verify:

- No CSS Module object is re-exported.
- Every Server Component imports CSS Modules directly.
- No Client Component acts as a style provider for server-rendered markup.
- ThemeProvider remains the only theme-state runtime.
- Canonical tokens are the only new reusable visual values.
- No page-level layout or visual redesign is included unintentionally.
- Typecheck and production build pass.
- Relevant visual, responsive, RTL, theme, keyboard, and reduced-motion regressions are assessed.



## Sprint 8 navigation boundary

`src/design/navigation` is the canonical V2 application-shell and navigation presentation layer. It may depend on Design Tokens, Theme Engine, Surface System, Primitive Library, Component Library, and icon elements. It must not depend on pages, layouts, feature modules, services, repositories, authentication implementations, or legacy shell components.

The consuming application owns route construction, permission filtering, identity data, active-state derivation, and business callbacks. Navigation accepts these through typed models and props. AppShell owns only transient collapse and Drawer visibility state. ThemeSwitcher delegates exclusively to the existing Theme Engine.

The package remains unmounted until a separately approved product migration. Existing Admin, Workspace, and public shells remain authoritative.


## Canonical Admin shell and authentication boundary

Every `/admin` route is rendered by the same V2 `AppShell` mounted in the authenticated Admin layout. `AdminShellBoundary` owns route-derived active state and authentication callbacks; pages own only their content. Command Center has no alternate shell mode.

The Admin layout performs the authoritative server-side session check and redirects unauthenticated requests to `/login`. The login page also checks the existing NextAuth session on the server so authenticated users never receive login-form markup. The client login island owns credentials submission, remembered-username storage, password visibility, and the post-authentication transition. Sign-out clears the existing NextAuth session before client navigation to `/login`.

Authentication providers, authorization rules, session strategy, and protected API contracts remain unchanged. Theme bootstrap runs before paint, and authentication presentation consumes the same Theme Engine and shared controls as Admin.


## Sprint 10 data-grid boundary

`src/design/data-grid` is the canonical V2 data-presentation layer. It may depend on the Component Library, Primitive Library, Surface System, Theme Engine tokens, React, and icon elements. It must not depend on pages, layouts, feature modules, services, repositories, transports, authentication, or legacy UI.

Consumers own data fetching, authorization, query state, sorting, filtering, searching, pagination, selection effects, localization, and domain formatting. The package receives rows and controlled state through typed props and reports interactions only through callbacks.

One semantic table DOM adapts from desktop table to tablet overflow and mobile stacked records. This avoids duplicated business markup. Adoption by Orders, Customers, Products, Payments, or any other feature requires a separately approved migration.


## Sprint 11 form-system boundary

`src/design/forms` is the canonical V2 form composition and missing-control layer. It may depend on Design Tokens, Theme Engine semantic variables, Surface System, Primitive Library, Component Library, React, and icon elements. It must not depend on pages, layouts, feature modules, services, repositories, transports, authentication, validation schemas, or legacy UI.

The existing Component Library remains authoritative for Input, Textarea, Button, Badge, Skeleton, and other established components. The Form System composes those components and must not duplicate them. Consumers own values, validation, submission, authorization, persistence, options, localization, upload execution, and all business callbacks.

Structural components remain Server-compatible. Client boundaries are permitted only for callback normalization, composite-control state, keyboard focus management, and native indeterminate behavior. The package remains unmounted until a separately approved feature migration.


## Admin navigation and stylesheet continuity

The V2 AppShell is owned by the authenticated `/admin` layout and remains the single persistent shell for the Overview and all Admin child routes. Child pages may retain legacy page-level presentation during migration, but route selection must never replace the shell component.

Sidebar navigation must use Next.js `Link` so Admin transitions remain client-side. Plain anchors are reserved for external destinations or explicit document navigation.

Canonical Design System CSS is loaded once through `src/app/globals.css` from the root layout. Admin pages must not import `src/design/index.css` directly. CSS Modules remain statically imported by their owning components or pages, and Admin shell/navigation styling must not depend on dynamic imports.

The Admin `loading.tsx` and `error.tsx` files render inside the persistent layout shell. They own route-content fallback presentation only and must not instantiate or replace AppShell.


## Sprint 11.6 Admin runtime stability boundary

Admin list pages normalize transport-level absence before strict application validation. Missing, `null`, empty, and whitespace-only query values become `undefined`; valid arrays retain their first value. Strict schemas remain authoritative for non-empty enums, ISO dates, pagination limits, filters, and sorting.

Theme initialization has two distinct responsibilities:

- `ThemeScript` owns the resolved `data-oi-theme` value before first paint.
- `ThemeProvider` must render the same deterministic fallback state on the server and during the initial client render, then synchronize persisted selection and the pre-applied root theme after hydration.

Browser-only APIs remain inside event handlers or Effects. The persistent Admin AppShell must preserve its DOM identity and transient collapse state across client navigation, browser history traversal, loading, and error content changes.


## Sprint 12A Overview showcase boundary

The exact `/admin` page remains a Server Component and owns one existing dashboard read. It may map returned data into serializable presentation rows, but it must not move fetching, authorization, mutation, or domain decisions into the Design System.

`OverviewOrdersTable` is a narrow Client adapter for the canonical Data Grid. Its responsibility is limited to column presentation and navigation links; it receives serializable display data and owns no business or transport state. The rest of the Overview remains server-rendered.

Showcase navigation styling remains scoped by the exact-route `data-showcase` attribute. Child Admin routes retain the persistent AppShell without inheriting Overview-only visual treatment. Analytics placeholder geometry is presentation-only and must remain explicitly identified as illustrative until a separately approved data integration supplies live analytics.


## Sprint 13A Customers migration boundary

The exact `/admin/customers` list route is a V2 Design System consumer. Its page remains a Server Component and retains one existing `listCustomers` read with the unchanged Admin customer query contract.

`CustomerDataGrid` is the only route-specific Client adapter. It may own canonical Data Grid column rendering, keyboard interaction, native placeholder menus, and URL-preserving pagination. It must not fetch data, infer unavailable subscription or workspace state, own authorization, or mutate customer records.

Unsupported Customer Management fields render explicit unavailable states until a separately approved read-model expansion. Visual placeholders must not cause repository, service, API, schema, permission, or query-contract changes.

## Sprint 14 NFC inventory boundary

`NfcCard` is the physical inventory aggregate and remains separate from the customer-owned digital `Card` profile. The NFC repository owns Prisma access, the NFC service owns secure batch generation and lifecycle validation, and authenticated Server Actions own mutation transport. Pages and Client Components never receive activation-code hashes or plaintext secrets.

`/admin/cards` remains server-rendered for list and KPI reads. Its route-scoped Client Components own only drawer state, URL search/filter controls, canonical Data Grid presentation, focus management, and confirmed-result reconciliation. Assignment and activation transitions are reserved for future use cases; this foundation permits only generation, disable, restore, and soft delete.

## Sprint 17 Admin navigation boundary

`AdminShellBoundary` is the only Admin navigation source. Production navigation exposes Command Center; Digital Orders, Customers, NFC Cards, and Activation Center; and Platform Settings. Implemented but non-production or contextual routes remain directly addressable when required, but they are not advertised in the primary sidebar.

Digital Orders owns payment review, proof inspection, approval, rejection, and payment timeline presentation. `/admin/payments` is a compatibility URL that redirects to `/admin/orders`; it must not regain an independent payment workflow. The retired `AdminShell` implementation and its duplicate navigation model must not be restored.

## Sprint 13B.1 Customer CRUD boundary

`/admin/customers` remains server-rendered for authoritative reads. Route-scoped Client Components own only drawer state, toast feedback, URL controls, and post-success Data Grid reconciliation. Authenticated Server Actions call the existing `CustomerService`; validation, duplicate-email detection, unit-of-work writes, and soft deletion remain in the application/service boundary. Filtered CSV is the only Customer-specific HTTP endpoint and reuses `AdminReadService`.

## Retired prototype card ownership boundary

The current digital-card model is provisioned through Orders, NFC activation, Workspace EditorSessions, and authenticated Admin use cases. The removed prototype `User`/`SocialLink` ownership relationship must not be reconstructed in compatibility repositories or HTTP handlers.

`/api/cards` is a fail-closed compatibility endpoint and returns `410 GONE` without database access. The flattened `LegacyBusinessCard` reader remains migration-only and may read its embedded JSON payload; it is not an authorization source. Any future compatibility work must use an explicit current authorization port rather than importing Prisma into services or guessing ownership from legacy columns.

## Sprint 2.6 Admin Design System convergence

The authenticated `AppShell` remains the only Admin shell. `AdminPageHeader` is the canonical inner-page composition for breadcrumbs, eyebrow, title, description, and actions. All Admin surfaces consume the shared `src/design` tokens, primitives, components, forms, navigation, and Data Grid; the parallel `AdminDesignSystem` and hardcoded `admin-shell.module.css` implementations are retired.

Management routes remain Server Components for authoritative reads and pass serializable rows to narrow Client adapters only where interaction requires it. Customers, NFC Cards, Plans, and Digital Orders use the canonical Data Grid responsive table model. Plans and Platform Settings use the canonical Form system. Platform Settings keeps only interaction state—unsaved detection, section navigation, and submit feedback—inside its Client form boundary.

Admin loading and error presentation use shared components. Primary routes own skeletons matching their content shape, while the segment error boundary uses the shared recovery Empty State. Destructive UI uses the shared Confirmation Dialog. Glass remains restricted to the persistent shell, drawers, dialogs, and floating overlays.
## Sprint 2.7.1 Admin entity navigation

The authenticated Admin layout owns the canonical entity overlays. Orders open only through `OrderDetailsController`; customers open only through `CustomerManager`; physical NFC inventory continues to use `CardManager`. Entry points communicate through `data-order-detail` and `data-customer-detail` triggers, so pages do not duplicate drawer state or loader logic.

Order and customer drawers preserve same-page deep links with `orderId` and `customerId` query parameters using the native History API. Opening or closing an overlay does not trigger a Next.js route transition, remount the Admin page, or activate route-level loading UI. `popstate` restores the appropriate overlay for browser Back and Forward navigation. Loaded drawer records are cached for the lifetime of the mounted Admin layout.

The obsolete `/admin/orders/[orderId]` and `/admin/customers/[customerId]` pages were removed. `/admin/cards/[cardId]` remains because it represents digital-card and access-code management; it is not the physical NFC inventory drawer.

### Drawer reliability

Entity drawer loads are coalesced per record and cached for 60 seconds inside the mounted Admin layout. Table and activity triggers provide safe summary fields for immediate Order drawer identity while the complete read model loads. Successful Order mutations explicitly invalidate and refresh the affected cached record. Digital Orders constrain their list query to the Digital package, while the global Order drawer accepts any Order surfaced by another Admin operational view.
