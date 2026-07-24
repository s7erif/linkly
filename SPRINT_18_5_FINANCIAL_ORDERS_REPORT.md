# Sprint 18.5 — Financial Orders & Revenue Foundation

## Outcome

Orders now capture immutable financial facts at creation time. A later Plan edit cannot change the plan name, description, price, currency, billing interval, discount, tax, subtotal, or total shown for an historical Order.

## Schema Changes

Added nullable fields to `Order`:

- `planNameSnapshot`
- `planDescriptionSnapshot`
- `billingIntervalSnapshot`
- `currency`
- `planPriceSnapshot`
- `subtotal`
- `discount`
- `tax`
- `total`

All monetary values are integer minor units (for example, cents). This avoids floating-point accounting errors and is compatible with Stripe, Paymob, Paddle, Lemon Squeezy, coupons, VAT, tax, refunds, invoices, and receipts.

The existing `planId` relation remains for operational reference and reporting. It is never used to recalculate historical financial values.

## Migration Summary

Migration: `prisma/migrations/20260721090000_add_order_financial_snapshots/migration.sql`

- Adds all snapshot columns as nullable.
- Preserves every existing Order and Plan.
- Performs no destructive changes and no data rewrite.
- Existing legacy Orders remain readable with null totals and snapshots.

Nullable migration fields are intentional: historical orders created before this release cannot be reconstructed reliably without a payment ledger.

## Order Creation

`CreateOrder` now:

1. Validates the request.
2. Reads the selected Plan inside the existing Unit of Work transaction.
3. Selects the requested billing interval price, with a documented fallback to the monthly price or zero when that interval has no configured price.
4. Copies plan identity and description into the Order.
5. Calculates `planPriceSnapshot`, `subtotal`, zero `discount`, zero `tax`, and `total` in minor units.
6. Persists the snapshot in the same Order write.

If a plan ID is supplied but no Plan exists, creation fails with an explicit NotFound error. Orders without a plan remain backward-compatible and receive null snapshot fields.

## Revenue Strategy

The Admin dashboard now calculates `revenueMinor` from paid Orders with non-null `total` values. It sums immutable Order totals and therefore remains stable after Plan changes.

For legacy datasets where no paid Orders have totals, the dashboard falls back to the existing active-subscription monthly recurring revenue calculation. This fallback is temporary compatibility behavior and never overwrites historical Orders.

## Order Details

Admin Order Details now displays:

- Plan purchased from `planNameSnapshot`
- Snapshot unit price
- Snapshot currency
- Snapshot billing interval
- Discount
- Tax
- Total paid

When legacy fields are null, the UI explicitly displays `Legacy / not captured` rather than deriving a value from the current Plan.

## Subscription Compatibility

Subscription renewals continue to use the current Subscription/Plan lifecycle and are not rewritten as Orders. This preserves current renewal behavior while ensuring each future payment-created Order can store its own immutable snapshot.

## Future Payment Gateway Readiness

The snapshot fields establish a gateway-neutral financial boundary. Future payment integrations can add provider references, payment intent IDs, invoices, refunds, coupon allocations, tax jurisdiction, and payment events without changing the meaning of existing Order totals.

## Architecture Verification

- Prisma changes are limited to the schema and migration.
- Plan lookup and snapshot calculation live in `CreateOrder`.
- Persistence remains in the Order repository.
- Admin reads use the existing Admin Read Service and repository.
- UI reads snapshot DTO fields only; no Plan recalculation occurs in components.
- Unit of Work transaction boundaries are preserved.
- Workspace, subscriptions, RBAC, renderer, and public-card architecture are unchanged.

## Verification

- Prisma validation: PASS.
- Prisma Client generation: PASS.
- TypeScript: PASS.
- Tests: PASS, 60/60.
- ESLint: PASS with existing unrelated warnings only.
- Architecture check: PASS.
- Production build: PASS.

Focused coverage verifies that a selected Plan is copied into the new Order and that totals are calculated from the snapshot price and quantity.

## Remaining Risks

- Existing Orders with null totals cannot be reconstructed without an external payment record; they intentionally use the MRR fallback.
- Discount and tax are currently zero because coupons and tax providers are future scope. Their columns are persisted now so introducing those systems does not redesign the Order aggregate.
- The current `PaymentStatus` is operational state only; a future payment-event ledger should become the source of truth for gateway reconciliation.
