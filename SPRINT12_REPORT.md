# Sprint 12 Report — Notification & Communication Platform

## Outcome

Sprint 12 is complete. The platform now records and sends an idempotent Welcome email after successful order approval through a dedicated Notification Service and replaceable Email Provider. Notification delivery never participates in, or rolls back, the Order approval transaction.

## Architecture verification

The implemented flow is:

`ApproveOrder` → committed `ApprovedOrderDTO` → `OrderApprovalNotificationCoordinator` → `NotificationService` → `EmailProvider` → `ResendEmailProvider`

- Order fulfillment use cases remain unchanged. The coordinator decorates the existing approval entry point after its Unit of Work completes.
- Use cases do not send email and do not import provider infrastructure.
- `NotificationService` owns delivery orchestration, template selection, persistence state changes, failure handling, and provider delegation.
- `EmailProvider` contains no Resend-specific contract, so SES or Postmark can replace the adapter without changing callers.
- Prisma remains confined to repositories. Notification repository queries use explicit selects and return persistence-independent records.
- No Workspace, renderer, theme, public-card, activation-flow, repository-contract, DTO, or Unit-of-Work behavior was changed.
- Architecture enforcement: PASS.

## Email flow verification

1. `ApproveOrder` creates the Customer and Card(s), hashes each access code, and commits fulfillment.
2. The coordinator receives the plaintext access code in the existing approval result.
3. `NotificationService` creates or reads a deterministic `NotificationDelivery`.
4. An atomic first-attempt claim suppresses duplicate sends.
5. The Welcome template receives the plaintext only in memory and renders public `/c/[slug]` and `/workspace?slug=[slug]` links from `APP_URL`.
6. Resend receives the message with `Idempotency-Key: welcome/{orderId}/{cardId}`.
7. Success records `SENT`, provider message ID, and timestamp. Failure records `FAILED`, safe failure metadata, and the attempt timestamp.
8. Failure is logged and returned as delivery state; the approved Order still returns success.

Tests verify one-send behavior, duplicate suppression, failed-delivery persistence, plaintext presence only in the outgoing message, and the Resend idempotency header. No real email was sent by the test suite.

## Provider abstraction verification

`EmailProvider` accepts a provider-neutral message and idempotency option. `ResendEmailProvider` owns the Resend URL, bearer authorization, payload format, response parsing, and provider error normalization. Welcome, Order Approved, and Card Ready share a common escaped HTML/text layout. Only Welcome has a lifecycle trigger in this sprint.

## Reliability and security

- Delivery rows never contain an email body or access code.
- Access-code hashes and provider secrets never enter templates or admin read models.
- Admin Order Details expose Pending/Sent/Failed, recipient, channel, provider, last attempt, sent time, and safe failure code.
- Database and provider idempotency guard repeated approval delivery.
- Referential deletes are restrictive, preserving fulfillment communication history.

## Files added

- `prisma/migrations/20260720120000_add_notification_platform/migration.sql`
- `src/notifications/contracts.ts`
- `src/notifications/notification.service.ts`
- `src/notifications/order-approval-notification.coordinator.ts`
- `src/notifications/resend-email.provider.ts`
- `src/notifications/templates/layout.ts`
- `src/notifications/templates/welcome.ts`
- `src/notifications/templates/order-approved.ts`
- `src/notifications/templates/card-ready.ts`
- `src/notifications/templates/index.ts`
- `src/repositories/notification.repository.ts`
- `tests/sprint-12-notifications.test.ts`
- `SPRINT12_REPORT.md`

## Files modified

- `prisma/schema.prisma` — adds notification enums, delivery persistence, and explicit relations.
- `src/lib/composition-root.ts` — composes the existing approval use case with notification delivery.
- `src/lib/env.ts`, `.env.example` — validate and document Resend and canonical URL configuration.
- `src/types/admin-read.ts`, `src/repositories/admin-read.repository.ts` — add a read-only notification projection.
- `src/app/admin/orders/[orderId]/page.tsx` — displays persisted delivery state.
- `docs/ARCHITECTURE.md`, `docs/DATABASE_SPEC.md`, `docs/PROJECT_SPEC.md` — record the new communication boundary and persistence behavior.
- `TASK_REPORT.md` — sprint handoff.

## Verification

- Prisma schema validation: PASS
- Prisma client generation: PASS
- Migration deploy/status: PASS; 8 migrations applied and configured database current
- TypeScript strict check: PASS
- Architecture check: PASS
- Tests: PASS, 9 files / 40 tests
- ESLint: PASS with 0 errors; 44 pre-existing warnings (renderer `<img>` usage and generated Prisma disable directives)
- Production build: PASS; 23 routes generated

## Known risks / technical debt

- The pre-existing migration folder `20260720080204_add_order_domain` sorts before the foundation migration `20260720090000_oi_platform_foundation`. `prisma migrate dev` therefore cannot replay a clean shadow database even though the configured database and `migrate deploy` are current. Applied history was intentionally not rewritten in this sprint. Resolve with an approved migration-history baseline before provisioning a clean environment.
- A delivery is attempted once because the plaintext access code is intentionally not retained. A failed welcome cannot be reconstructed automatically; operational recovery must issue a new access code through the existing regeneration use case before a future resend workflow is introduced.
- `onboarding@resend.dev` is suitable only for Resend development behavior. Production must configure a verified `RESEND_FROM_EMAIL` and domain authentication.
