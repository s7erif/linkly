# Sprint 25 — Platform Billing Foundation Report

## Implemented services

- `PrismaInvoiceRepository` — immutable invoice persistence, order/customer lookup, and PDF attachment.
- `InvoiceService` — invoice snapshot creation, duplicate-by-order protection, invoice numbering, and history.
- `InvoicePdfService` — provider-backed invoice artifact generation and storage-key return.
- `BillingNotificationService` — billing notification entry point over the existing NotificationService.
- `BillingTimelineService` — idempotent BillingTimelineEntry append operations.
- `BillingAuditService` — centralized billing audit writes.
- `BillingReadService` — customer invoice/payment read facade.
- `DashboardProjectionService` — projection refresh revision boundary.

## Dependency graph

`PaymentApproved → existing EventDispatcher → registered billing listener dependencies → InvoiceService / InvoicePdfService / SubscriptionService / AccessCodeService / BillingNotificationService / BillingTimelineService / BillingAuditService / DashboardProjectionService`

## Composition root

Invoice repository, InvoiceService, BillingReadService, PaymentRepository, and DashboardProjectionService are now instantiated in the existing composition root. No UI module imports Prisma or a repository.

## Production readiness

- Prisma schema validation: passed.
- Prisma client generation: passed.
- TypeScript: passed.
- Existing architecture boundaries remain intact.

## Remaining missing services

None of the requested service class boundaries are missing. Provider-specific email template expansion and production PDF formatting remain constrained by the existing provider contracts and should be validated with deployment credentials before launch.
