# Sprint 11 Report — Admin Read Platform

## Outcome

Sprint 11 is complete. The Admin Platform now uses persisted read models for dashboard metrics, Orders, Customers, Cards, and the requested analytics totals. No page imports Prisma or a concrete repository. The existing Admin shell, write workflows, activation flow, Workspace, public renderer, DefaultTheme, DTO contracts, repository architecture, and Unit of Work remain intact.

## Architecture

The implemented read path is:

Admin Server Component → `AdminReadService` → `AdminReadRepository` → Prisma

`AdminReadService` validates untrusted search parameters, defines UTC date boundaries, maps missing records to domain errors, and produces renderer-safe Card previews. `PrismaAdminReadRepository` owns explicit selects, filters, counts, sorting, pagination, and relational mapping. It has no write methods and is not included in transaction-scoped repositories. Admin-specific read models live separately from the frozen DTO contracts.

## Delivered capabilities

### Dashboard

- Pending Orders
- Approved Orders, defined as orders that reached Approved, Fulfilled, or Completed
- Completed Orders
- Total Customers
- Total Cards
- Active Cards, defined as Published and not deleted
- Cards Created Today, using a UTC day boundary
- Total Visits from persisted Visit events
- Cards Published
- Active Customers
- Recent Orders and Recent Customers

### Orders

- Case-insensitive search across order number, customer name, email, and company
- Status, payment, and inclusive date filters
- URL-persisted pagination and sorting
- Real detail view with customer, order, payment, fulfillment, cards, safe AccessCode metadata, and AuditLog-backed approval history
- Existing approval/cancel/fulfillment actions remain unchanged

### Customers

- Search, pagination, sorting, card counts, status, and creation date
- Detail view with profile, cards, published active card, and Order history

### Cards

- Search, pagination, sorting, owner, status, visibility, and creation date
- Detail view with existing DefaultTheme preview, owner, profile and appearance summaries, public URL, Order provenance, safe active-code metadata, and an admin-visible Workspace link
- Workspace link does not bypass customer EditorSession authorization

### UX

- Breadcrumbs
- Responsive horizontal table containment
- Filter forms that work without client-side state
- Contextual empty states
- Shared loading skeletons and error recovery
- Consistent status badges and spacing inside the existing Admin shell

## Files added

- `src/types/admin-read.ts`
- `src/validation/admin-read.ts`
- `src/repositories/admin-read.repository.ts`
- `src/services/admin-read.service.ts`
- `src/features/admin/AdminReadUI.tsx`
- `src/features/admin/admin-query.ts`
- `src/app/admin/loading.tsx`
- `src/app/admin/error.tsx`
- `tests/sprint-11-admin-read.test.ts`
- `SPRINT11_REPORT.md`

## Files modified

- `src/app/admin/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/orders/[orderId]/page.tsx`
- `src/app/admin/customers/page.tsx`
- `src/app/admin/customers/[customerId]/page.tsx`
- `src/app/admin/cards/page.tsx`
- `src/app/admin/cards/[cardId]/page.tsx`
- `src/app/admin/analytics/page.tsx`
- `src/features/admin/admin-shell.module.css`
- `src/lib/composition-root.ts`
- `src/repositories/index.ts`
- `src/services/index.ts`
- `src/types/index.ts`
- `scripts/check-architecture.mjs`
- `docs/ARCHITECTURE.md`
- `docs/UI_SPEC.md`
- `TASK_REPORT.md`

## Architecture verification

- Prisma imports remain restricted to repositories and database infrastructure.
- Admin pages import only the composed read service and presentation components.
- The read repository exposes no writes and does not use Unit of Work.
- Existing DTO interfaces were not modified.
- Repository contracts and transaction repository composition were not modified.
- The architecture checker now correctly executes its route-handler rules; a misplaced brace discovered during the sprint was repaired.
- Exactly one DefaultTheme remains.

## Performance considerations

- Every list query uses database pagination, explicit projection, deterministic secondary ID sorting, and concurrent count/data queries.
- Dashboard count queries execute concurrently and recent lists are capped at five records.
- Detail queries select only required scalar and relational fields.
- Existing status, creation-time, customer, and Card indexes support primary operational filters.
- Date filtering uses a half-open UTC interval, avoiding end-of-day precision defects.
- Public and Workspace caching behavior is untouched; Admin reads remain fresh per request.

## Technical debt discovered

- Approval history is correctly AuditLog-backed, but current approval writes do not create AuditLog entries. The UI shows an honest empty state rather than inferred history. Adding write-side auditing requires a separately approved sprint.
- Case-insensitive `contains` search can become expensive at high volume. PostgreSQL trigram or full-text indexes require future schema approval.
- Offset pagination is appropriate for the current Admin volume but should move to cursor pagination for very deep result sets.
- Total Visits currently counts append-only Visit events. At large event volume, a guaranteed global analytics aggregate should replace the raw count.
- Approved is a transient Order state because successful approval immediately completes issuance. The dashboard therefore counts Approved, Fulfilled, and Completed as orders that passed approval.
- The admin-visible Workspace link intentionally does not grant support-edit authorization; the frozen activation architecture still requires a customer EditorSession.

## Verification

- TypeScript: PASS
- ESLint: PASS with zero errors and 43 existing non-blocking warnings
- Tests: PASS — 8 files, 37 tests
- Production build: PASS on Next.js 16.2.6
- Architecture check: PASS
- Read-only development database audit: 3 Orders, 4 Customers, 4 Cards, 0 Visit events at verification time
