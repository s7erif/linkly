# Sprint 15 Report — Admin Management & Subscription Platform

## Outcome

Sprint 15 adds a transaction-scoped subscription platform, application-layer RBAC, admin card operations, secure access-code rotation, plan-aware checkout and fulfillment, an admin-authorized support Workspace, and customer entitlement visibility. The Card Block model, renderer, notification service, customer EditorSession authentication, and existing DTO fields remain intact.

## Architecture verification

- Presentation calls application use cases/composed services; no Prisma import was added to pages, components, Server Actions, or use cases.
- `PrismaPlatformManagementRepository` is the only new Prisma boundary. Transactional instances are exposed additively through `TransactionRepositories.platform`.
- All plan, subscription, card-management, access-code rotation, bootstrap-role, and admin Workspace writes execute inside `UnitOfWork` transactions.
- Existing repository exposure is backward compatible: `platform` is optional on the public transaction contract so existing alternate adapters and test doubles continue to compile.
- `WorkspaceCardDTO.plan` and Order plan fields are optional additive fields. Existing consumers remain valid.
- Architecture checker: PASS.

## RBAC verification

Roles seeded: `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `VIEWER`.

Application permissions:

- Super Admin/Admin: card management, support editing, access-code management, plan management, subscription management, order approval, audit read.
- Support: support editing, access-code management, audit read.
- Viewer: audit read only.

`requireAdmin` resolves the active AdminUser and persisted role keys inside the application transaction. Card, plan, subscription, access-code, support Workspace, and order-admin entry points invoke this guard. The compatibility admin identity receives `SUPER_ADMIN` only when it has no role, preserving explicit later assignments.

## Subscription lifecycle

Dynamic plans support name, description, monthly/quarterly/yearly prices, active state, sort order, and relational feature flags. Feature keys are extensible; `MAX_CARDS` supports an integer limit.

Supported application operations are activate, suspend, resume, cancel, renew, change plan (upgrade/downgrade), and extend expiration. Invalid status transitions are rejected with domain conflicts. Changes are audited with previous/new status and plan identifiers.

Checkout now reads active plans and requires a plan and billing interval in the public form. The selected values are stored on Order. Approval creates Customer, Subscription, Card(s), and Access Codes inside the same transaction; the existing post-commit welcome notification remains unchanged.

## Access-code regeneration flow

1. Resolve and authorize the admin with `ACCESS_CODE_MANAGE`.
2. Confirm the card exists.
3. Generate cryptographically secure plaintext and HMAC it.
4. Mark the previous active record `ROTATED`.
5. Revoke active customer editor sessions and increment card access version.
6. Persist only the new hash/version and rotation link.
7. Audit `ACCESS_CODE_REGENERATED`.
8. Return plaintext once to the existing copy/print/download panel.

Old plaintext is never queried or stored. Optional resend of a regenerated code is not exposed in this sprint because the frozen Notification Platform's welcome idempotency key intentionally permits one delivery per card/order; bypassing it would violate exactly-once delivery. A future approved notification template (for example `ACCESS_CODE_REGENERATED`) is required.

## Admin Workspace mode

`/admin/cards/[cardId]/workspace` is protected by NextAuth and application permission `CARD_SUPPORT_EDIT`. It displays the permanent `ADMIN EDIT MODE` banner with customer, card, current plan, status, slug, and timestamps. Saves are audited as `ADMIN_WORKSPACE_EDIT`. It creates no AccessCode or EditorSession and does not impersonate a customer.

## Backward compatibility

- Existing Plan columns remain populated; the legacy price fields are retained.
- Existing Orders may have null plan/billing values and continue to read and fulfill using the prior behavior.
- Existing Subscriptions receive `MONTHLY` by default.
- Existing DTO fields and routes are unchanged.
- Customer plan metadata is optional.
- Migration is retry-safe after a PostgreSQL partial-DDL recovery and preserves all existing rows.

## New entities and enums

- `BillingInterval`: MONTHLY, QUARTERLY, YEARLY.
- `PlanFeature`: relational, extensible feature entitlement with optional integer limit.
- Additive Order plan/billing association.
- Additive Subscription billing, suspension, and renewal timestamps.

## New use cases

- EnsureBootstrapAdmin
- AuthorizeAdminAction
- ListActivePlans
- ManagePlan
- ListSubscriptions
- CreateOrderSubscription
- ManageSubscription
- AdminManageCard
- AdminWorkspace
- RegenerateAccessCode

## Files added

- `prisma/migrations/20260720150000_sprint15_admin_subscriptions/migration.sql`
- `src/dto/subscription.dto.ts`
- `src/repositories/platform-management.repository.ts`
- `src/use-cases/subscription-platform.ts`
- `src/use-cases/authorize-admin-action.ts`
- `src/use-cases/admin-card-management.ts`
- `src/use-cases/admin-workspace.ts`
- `src/use-cases/regenerate-access-code.ts`
- `src/features/admin/subscription-actions.ts`
- `src/features/admin/card-actions.ts`
- `src/features/admin/admin-workspace-actions.ts`
- `src/app/admin/plans/page.tsx`
- `src/app/admin/subscriptions/page.tsx`
- `src/app/admin/cards/[cardId]/workspace/page.tsx`

## Files modified

- Prisma schema/client and repository/UoW barrels.
- Order DTO, validation, repository, creation, approval, checkout action and flow.
- Composition root and admin authentication bootstrap.
- Admin shell/card detail/order actions/access-code issuance panel.
- Workspace authorized read DTO and AppearanceEditor entitlement summary.

## Quality results

- Prisma schema validation: PASS.
- Prisma migration deploy: PASS (11 migrations current).
- TypeScript strict check: PASS.
- ESLint: PASS with 48 pre-existing warnings and zero errors.
- Tests: PASS, 11 files / 47 tests.
- Production build: PASS, including new admin routes and plan-aware `/create-card`.
- Architecture checker: PASS.

## Remaining risks

- Regenerated-code email needs a separately approved, idempotent notification template; the existing welcome template must not be reused.
- Fine-grained permissions are currently derived from versioned role policy rather than persisted permission rows. This is deliberate for a stable V1 permission vocabulary but should be revisited if custom roles are introduced.
- Existing legacy orders without a plan remain compatible; operations should assign a plan before commercial renewal.
- Admin plan UI currently creates plans; the application service supports update, but a dedicated edit form is still needed for full operator ergonomics.
