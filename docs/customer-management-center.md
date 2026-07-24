# Customer Management Center

## Sprint 13A scope

Sprint 13A migrates only the list route at `/admin/customers`. Customer details, drawers, creation, import, export, workspace actions, subscription actions, activation actions, and mutations remain outside scope.

## Rendering and data boundary

The page remains a Server Component. It preserves the existing search parameters, strict query contract, one `adminReadService.listCustomers` call, sorting fields, sort direction, pagination, and customer-detail destinations.

The existing list model provides customer ID, display name, email, phone, lifecycle status, card count, and creation date. It does not provide subscription type or status, workspace URL, card IDs, renewal date, activation code, purchase type, activity, or revenue. The interface therefore renders explicit unavailable states for those fields. No values are inferred and no additional reads are performed.

`CustomerDataGrid` is a narrow Client adapter for the canonical Data Grid keyboard model and pagination callback. It receives serializable presentation rows, builds no business state, performs no fetching, and preserves the existing query string when changing pages.

## Page hierarchy

1. Premium Customer Management hero with disabled future Add and Export actions.
2. Exactly four KPI cards. Total Customers is live; the three unsupported metrics are clearly marked pending data.
3. Search and sort toolbar preserving the existing query names.
4. Visible segmented filter foundation. Unsupported subscription, lifecycle, renewal, activity, and revenue filters are disabled placeholders; Newest and Oldest use the existing sort-direction contract.
5. Canonical responsive Data Grid with Customer, Subscription, Workspace, Card, Renewal, Status, and Actions columns.

## Interaction status

- Search, existing sort field, sort direction, pagination, and existing customer-detail navigation are functional.
- The Filters toolbar action uses an in-page anchor and requires no hydration.
- Add Customer, Export, Import, workspace copy/open, and unsupported filters remain visibly unavailable until future approved sprints.
- The overflow menu retains the existing customer-detail link and does not add mutations.

## Accessibility and responsive behavior

The page has a single H1, named KPI and filter regions, a labelled search field, fieldset/legend filter groups, semantic table markup, keyboard Data Grid navigation, named overflow controls, visible token focus states, forced-colors borders, and reduced-motion behavior.

The canonical Data Grid uses one table markup. It remains tabular on desktop and tablet and changes to stacked records on mobile. No duplicate business markup is introduced.


## Sprint 13A.1 layout optimization

The management center now prioritizes the directory over dashboard decoration. The introduction uses a compact title surface, the four large KPI cards are replaced by one responsive summary strip, and the previous Card-within-Card hierarchy is flattened into one workspace surface containing toolbar, filters, directory heading, and Data Grid.

Search, sort, actions, and filters are denser without changing control names or behavior. Unsupported filters remain visible disabled chips. On narrow screens the summary and chip collections scroll within their own bands rather than increasing document width or duplicating markup. Data rows receive additional vertical breathing room and a clearer token-backed hover marker.

No rendering boundary, query, data mapping, route, repository, API, service, permission, or action behavior changed.

## Sprint 13B.1 CRUD foundation

The existing hierarchy supports authenticated create, edit, soft delete, debounced name/email/phone search, Active/Suspended filtering, preserved sorting and pagination, and complete filtered CSV export. Create and edit share one accessible right drawer. Mutations update the visible grid only after server confirmation and then refresh the authoritative Server Component read.

Customer Notes and subscription, card, activation, workspace, order, billing, and analytics behavior remain outside this module. No database schema or migration changed.

## Sprint 13C management drawer

Customer selection remains inside `/admin/customers`. Row pointer activation, grid-cell Enter, the customer name, and overflow View all open the same route-scoped management drawer; no detail navigation or additional fetch is introduced. The server list projection supplies existing creation and update timestamps so Overview and Activity can render immediately from the authoritative page read.

The drawer provides a customer identity header, lifecycle status, Overview and Activity tabs, inline editing through the existing authenticated update action, the existing archive action, and clipboard actions for email and customer ID. Activity is intentionally limited to facts available without an event table: account creation and a last-edited event when `updatedAt` differs from `createdAt`. Archived customers leave the active directory after the existing soft-delete succeeds.

The dialog traps focus, closes on Escape, restores focus to the originating grid cell or action, exposes labelled tab and panel relationships, and supports arrow-key tab movement. Subscriptions, cards, activation codes, orders, workspace, billing, analytics, notifications, schema changes, and new API contracts remain outside scope.
