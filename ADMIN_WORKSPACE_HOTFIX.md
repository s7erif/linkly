# Admin Workspace Hotfix

## Root cause

Sprint 15 generated the Admin Workspace link as:

`/admin/cards//workspace`

The `${card.id}` interpolation was accidentally omitted in `src/app/admin/cards/[cardId]/page.tsx`.

Browsers/Next normalized the double slash and resolved `/admin/cards/workspace` against the existing dynamic route `/admin/cards/[cardId]`. Consequently, Next supplied `cardId = "workspace"` to the card-detail page instead of entering `/admin/cards/[cardId]/workspace`.

The Admin Workspace page itself was not failing. The malformed URL entered the Admin Card Detail read path.

## Actual failing request chain

1. Admin card detail emits `/admin/cards//workspace`.
2. Navigation resolves to `/admin/cards/workspace`.
3. Next matches `/admin/cards/[cardId]` with `cardId = "workspace"`.
4. `AdminCardDetail` calls `AdminReadService.getCard("workspace")`.
5. `adminRecordIdSchema` rejects `workspace` because it is not a UUID.
6. `AdminReadService` throws `ValidationError`.
7. The `/admin` error boundary displays `Unable to load Admin data`.
8. `AdminReadRepository.getCard` and Prisma are never called for this malformed request.

The correct Admin Workspace chain remains:

`/admin/cards/[cardId]/workspace` → `AdminWorkspace.read` → transaction-scoped Card and Platform repositories → Prisma.

## Exact exception and stack trace

```text
ValidationError: Admin query validation failed
    at parse (.../src/services/admin-read.service.ts:8:118)
    at AdminReadService.getCard (.../src/services/admin-read.service.ts:18:64)
```

This was reproduced directly with `AdminReadService.getCard("workspace")`. It is an application validation exception, not a Prisma exception.

## Invalid Prisma fields

None.

A project-wide inventory found 110 occurrences of `findUnique(`, `findFirst(`, `include:`, and `select:`. Repository selects were checked against the generated Prisma 7 client and current schema through TypeScript compilation and `prisma generate`.

The Admin read repository selects only valid fields and relations:

- Card scalar fields, `profile`, `customer`, optional `order`, and `accessCodes`.
- Profile scalar fields.
- Active AccessCode metadata only; no hash is selected.
- Order `notifications`, cards, and their access-code metadata.
- Customer cards and orders.
- Editor blocks, block media references, sections, buttons, and social links.
- Subscription's required `plan` relation and Plan's `features` collection.

No invalid Notification, AccessCode, Subscription, PlanFeature, or CardBlock relation was found.

## Optionality verification

- `Card.orderId` and `Card.order` remain optional.
- `Order.planId`, `Order.billingInterval`, and `Order.plan` remain optional for legacy orders.
- Customer subscriptions are a collection and may be empty.
- `findActiveSubscriptionByCustomer` returns `null` when no active subscription exists.
- Plan features are a collection and may be empty.
- Card profile and theme remain optional where modeled.

The Admin Workspace read model correctly returns `AdminWorkspaceDTO`, containing the authorized `WorkspaceCardDTO`, customer ID, and optional subscription-derived plan summary. It does not use the Admin Card Detail read model.

## Fix

Changed the generated link from:

`/admin/cards//workspace`

to:

`/admin/cards/${card.id}/workspace`

No query, schema, relation, DTO, repository, authentication, renderer, notification, or UnitOfWork code was changed.

## Files modified

- `src/app/admin/cards/[cardId]/page.tsx` — restored the missing card ID in the Admin Workspace link.
- `ADMIN_WORKSPACE_HOTFIX.md` — this diagnostic and verification report.
- `TASK_REPORT.md` — required task handoff.

## Why the fix is backward compatible

The canonical route already existed as `/admin/cards/[cardId]/workspace`. The fix only makes the existing link target that route with the required UUID. No public route, API contract, DTO, database query, or persistence behavior changed.

## Verification

- `prisma validate`: PASS.
- `prisma generate`: PASS.
- TypeScript strict check: PASS.
- ESLint: PASS with zero errors; 48 existing warnings remain.
- Tests: PASS — 11 files, 47 tests.
- Production build: PASS.
- Architecture boundary check: PASS.
