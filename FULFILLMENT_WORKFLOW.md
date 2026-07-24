# Order Fulfillment Workflow

## Atomic approval

`ApproveOrder` opens one existing UnitOfWork transaction and composes transaction-scoped methods from the approved `CreateCustomer`, `CreateCard`, and `GenerateInitialAccessCode` use cases.

1. Load Order by ID.
2. Validate Pending → Approved.
3. Conditionally transition to Approved; concurrent approvals lose the compare-and-set.
4. Create one Customer from order contact data.
5. Checkpoint Customer Created on Order.
6. Create `quantity` Cards with collision-resistant order-derived slugs and `orderId` provenance.
7. Checkpoint Card Created.
8. Generate and persist one initial HMAC-protected AccessCode per Card.
9. Transition fulfillment to Access Code Issued and status to Fulfilled.
10. Commit the transaction.
11. Return formatted plaintext codes exactly once to the authenticated administrator.

Any failure before commit rolls back the Order transition, Customer, Cards, and AccessCodes together. Existing business validation remains in the reused use cases.

## Delivery

The administrator advances Fulfilled orders through Printing, Delivered, and Completed. The customer receives the physical/digital card and one-time access code out of band, then uses `/access` to create an EditorSession and enter `/workspace`.

## Security

- Public submission can create only an Order.
- Admin mutations re-check NextAuth server-side.
- Access-code plaintext exists only in approval result memory.
- HMAC hash remains the only persisted credential representation.
- UI never imports Prisma or repositories.
