# Sprint 10 Review

## Outcome

Sprint 10 is complete. Order is now the canonical entry point for new business: public intake creates a persisted pending Order, authenticated approval atomically provisions the Customer, Card or Cards, and initial Access Codes, and the Admin Platform advances fulfillment using explicit domain transitions. No fake order rows or fake success states remain.

## Delivered architecture

- Domain: explicit Order and Fulfillment state machines reject invalid transitions.
- Application: CreateOrder, GetOrder, ListOrders, ApproveOrder, CancelOrder, and CompleteOrder validate inputs and return DTOs.
- Persistence: Order repository uses explicit selects and DTO mapping. Its conditional transition operation prevents concurrent status races.
- Transactions: approval executes in one Unit of Work. Existing creation rules are reused through transaction-scoped `executeIn` methods, avoiding nested transactions and duplicated business rules.
- Security: public intake cannot provision platform identities. Admin mutations authenticate inside each Server Action. Direct card creation transport is retired. Access code plaintext is returned only from approval and never written to Order or Card.
- Presentation: `/create-card` creates real orders; `/admin/orders` and `/admin/orders/[orderId]` render real read models and lifecycle actions.

## Lifecycle compliance

- Intake: `CreateOrder` creates `PENDING / PENDING / NOT_STARTED`.
- Approval: `PENDING → APPROVED → FULFILLED`, with fulfillment checkpoints `CUSTOMER_CREATED → CARD_CREATED → ACCESS_CODE_ISSUED`.
- Physical progress: each `CompleteOrder` call advances exactly one step: `PRINTING`, `DELIVERED`, then `COMPLETED`.
- Cancellation: allowed only from Draft, Submitted, or Pending.
- Concurrency: compare-and-set transitions return a conflict when state changed after reading.

## Verification

- Prisma format, validation, and client generation: PASS.
- PostgreSQL migration `20260720080204_add_order_domain`: APPLIED; database up to date.
- TypeScript strict check: PASS.
- ESLint: PASS with 43 pre-existing/non-blocking warnings, primarily generated Prisma directives and renderer `<img>` guidance; zero errors.
- Tests: PASS, 5 files and 28 tests. Sprint 10 adds five lifecycle tests and updates transport security expectations.
- Production build: PASS on Next.js 16.2.6.
- Architecture boundary check: PASS.

## Remaining risks

- Payment status is modeled but intentionally has no provider or administrative payment transition in this sprint.
- Approval returns plaintext access codes in one Server Action response. Operators must copy/print them before navigation; durable plaintext recovery is intentionally impossible.
- Card slug uniqueness is protected by the database. The order-number-derived suffix makes collisions highly unlikely, but a deliberately injected duplicate order number/slug will fail and roll back approval.
- Legacy Cards have nullable `orderId` by design. A future provenance report should distinguish migrated legacy records from Order-issued records.
- Order list pagination is bounded to 100 but cursor pagination is deferred until operational volume requires it.
