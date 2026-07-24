# Order Lifecycle

## Commercial transitions

```text
DRAFT → SUBMITTED → PENDING → APPROVED → FULFILLED → COMPLETED
  └───────────────→ CANCELLED
```

Sprint 10 visitor submission enters at `PENDING`; Draft and Submitted are retained for future checkout/draft workflows.

Allowed transitions:

- Draft → Submitted or Cancelled
- Submitted → Pending or Cancelled
- Pending → Approved or Cancelled
- Approved → Fulfilled
- Fulfilled → Completed
- Completed: terminal
- Cancelled: terminal

Every transition is checked explicitly. Repository conditional updates protect against concurrent state changes.

## Fulfillment transitions

```text
NOT_STARTED
  → CUSTOMER_CREATED
  → CARD_CREATED
  → ACCESS_CODE_ISSUED
  → PRINTING
  → DELIVERED
  → COMPLETED
```

Approval performs the first three fulfillment steps atomically. `CompleteOrder` advances one remaining operational step per invocation, making Printing and Delivered real observable states instead of skipped labels.

## Payment lifecycle

Payment starts at Pending. Paid, Refunded, and Failed are modeled but Sprint 10 intentionally adds no provider or payment mutation use case. Payment status does not silently change during approval.

## Cancellation

Cancellation is allowed only before approval. Once customer/card/access-code fulfillment commits, cancellation requires a future explicit return/revocation workflow and is not represented by `CancelOrder`.
