# Order Domain Specification

Status: Approved Sprint 10 foundation

## Aggregate purpose

Order is the canonical commercial entry point for new OI Cards. It captures purchase intent before any Customer, Card, or AccessCode is created. Visitor submission creates only an Order. Administrator approval performs fulfillment.

## Aggregate fields

- `id`: UUID identity.
- `orderNumber`: public operator/customer reference, unique and non-secret.
- `customerName`: requested customer display name.
- `company`: optional company context retained on the order.
- `email`: fulfillment contact email.
- `phone`: fulfillment contact phone.
- `package`: `DIGITAL` or `DIGITAL_NFC`.
- `quantity`: number of cards requested, constrained by application validation.
- `notes`: optional fulfillment instructions.
- `status`: commercial lifecycle state.
- `paymentStatus`: payment lifecycle state only; no provider integration.
- `fulfillmentStatus`: operational progress.
- `customerId`: nullable until approval creates the Customer.
- `createdAt` / `updatedAt`: lifecycle timestamps.
- `cards`: cards created from this order. Card carries nullable `orderId` for legacy compatibility.

No plaintext access code is stored on Order. Issued codes are related indirectly through fulfilled Cards and are returned once from approval.

## Status enums

OrderStatus: `DRAFT`, `SUBMITTED`, `PENDING`, `APPROVED`, `FULFILLED`, `COMPLETED`, `CANCELLED`.

PaymentStatus: `PENDING`, `PAID`, `REFUNDED`, `FAILED`.

FulfillmentStatus: `NOT_STARTED`, `CUSTOMER_CREATED`, `CARD_CREATED`, `ACCESS_CODE_ISSUED`, `PRINTING`, `DELIVERED`, `COMPLETED`.

OrderPackage: `DIGITAL`, `DIGITAL_NFC`.

## Invariants

- Visitor creation persists `PENDING`, `PENDING`, and `NOT_STARTED`.
- Only `PENDING` can be approved.
- Only pre-approval states can be cancelled.
- Approval creates exactly one Customer and `quantity` Cards and initial codes atomically.
- Every Card created by approval records the originating Order.
- An approved order becomes `FULFILLED` with `ACCESS_CODE_ISSUED` before plaintext is returned.
- Completion advances fulfillment explicitly: access issued → printing → delivered → completed.
- Completed and cancelled orders are terminal.
- Repeated or concurrent approval cannot create duplicate fulfillment.

## Persistence boundaries

OrderRepository contains only explicit-select persistence operations. State-transition validity lives in the domain/application layers. All writes use the existing UnitOfWork implementation and transaction-scoped repositories.
