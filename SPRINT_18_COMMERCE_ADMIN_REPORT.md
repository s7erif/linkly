# Sprint 18 — Commerce Admin Platform Report

## Outcome

The Admin Platform now exposes the existing commerce application layer as an operational console. No Prisma access was added to UI components, no domain model migration was required, and existing Order, Card, Plan, Subscription, Access Code, RBAC, and Unit of Work contracts remain in place.

## Delivered

### Dashboard

- Existing KPI dashboard retained and extended with active subscriptions and monthly recurring revenue derived from active plan prices.
- Orders, customers, cards, visits, published cards, and active customers remain live read metrics.
- Recent orders/customers are presented as a recent activity stream.

### Orders

- Existing searchable, filterable, sortable, paginated list retained.
- Existing details view shows customer, payment, fulfillment, cards, access-code metadata, notification delivery status, and approval audit history.
- Existing Approve, Cancel, and fulfillment progression actions continue to use application use cases and permission checks.

### Customers

- Existing search, pagination, card count, status, profile, cards, active-card, and order-history views retained.
- Customer details remain informational and do not embed Workspace editing.

### Cards

- Existing card list/detail views retained with public preview, public URL, owner, Workspace shortcut, issuance, publish/unpublish/archive/restore/duplicate/delete actions.
- Management continues through `AdminManageCard` and shared publication use cases.

### Plans

- Plan management now reads active and inactive plans.
- Existing `ManagePlan` use case powers create and edit forms.
- Pricing, currency, billing amounts, ordering, active/inactive state, and feature flags are editable.

### Subscriptions

- Existing lifecycle controls retained and expanded with plan change and extension controls.
- Renew, activate, suspend, resume, cancel, change plan, and extend all call `ManageSubscription`.
- Status transitions and audit logging remain application-layer responsibilities.

### Access Codes

- Replaced the placeholder page with a repository-backed list.
- Search by card, slug, or customer.
- Filter by Active, Rotated, Revoked, or Expired.
- Pagination and last-used/expiration/version metadata included.
- Disable uses authorized access-code revocation and revokes related editor sessions.
- “Issue new” links to the existing one-time issuance flow.
- Historical plaintext is never displayed or recoverable; Copy is available only in the one-time issuance result.

## Architecture Verification

- Prisma remains confined to repositories.
- Admin pages use `AdminReadService`, `PlatformManagementRepository`, and existing application use cases.
- Server Actions perform authentication/permission checks and call application services.
- No business rules were added to React components.
- No new API or database migration was necessary.
- Destructive actions remain explicit button/form actions; existing confirmation behavior is preserved.

## Files Added

- `src/features/admin/AccessCodeActions.tsx`
- `SPRINT_18_COMMERCE_ADMIN_REPORT.md`

## Files Modified

- `src/types/admin-read.ts`
- `src/validation/admin-read.ts`
- `src/repositories/admin-read.repository.ts`
- `src/services/admin-read.service.ts`
- `src/app/admin/access-codes/page.tsx`
- `src/features/admin/actions.ts`
- `src/lib/composition-root.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/plans/page.tsx`
- `src/features/admin/subscription-actions.ts`
- `src/app/admin/subscriptions/page.tsx`

## Verification

- TypeScript: PASS.
- Tests: PASS, 59/59.
- Architecture check: PASS.
- Production build: PASS.
- ESLint: PASS with existing warnings only (image optimization, one pre-existing Hook dependency warning, and generated Prisma warnings).

## Remaining Technical Debt

- Orders do not currently persist a monetary total; dashboard revenue is monthly recurring revenue derived from active plan monthly prices, not historical collected revenue.
- Audit activity is currently represented by persisted order approval history plus recent operational records; a cross-resource activity feed can be added through the existing AuditLog read model later.
- Existing image and generated-code lint warnings remain outside Sprint 18 scope.
