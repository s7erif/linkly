# Manual Subscription Lifecycle

Sprint 3.3 defines the runtime subscription model. Commercial plans, gateway billing, pricing, and feature entitlements are not part of subscription operations. Existing catalog relations remain compatibility data only.

## Lifecycle

Operational states are PENDING_PAYMENT, ACTIVE, EXPIRED, SUSPENDED, and CANCELED. Platform Admin is the only actor that activates, renews, suspends, or cancels. Activation accepts MONTHLY or YEARLY duration, sets startsAt, activatedAt, and expiresAt, and mirrors the dates to legacy currentPeriod fields. Renewal updates the existing row, sets renewedAt, and never creates another subscription.

The daily service atomically claims ACTIVE subscriptions whose expiresAt is at or before the current time, marks them EXPIRED, sets expiredAt, and records a SYSTEM audit entry scoped to the Workspace. Workspace, Customer, Card, Order, and public profiles are retained.

## Access

Customer editor mutations require an ACTIVE, unexpired subscription when a subscription exists. EXPIRED, SUSPENDED, and CANCELED customers see a renewal warning and cannot use management controls. Platform Admin support access is separately authorized and audited. Public NFC and username profile reads do not consult subscription status.

## Notifications

The scheduler prepares EMAIL reminders 7, 3, and 1 day before expiration, plus expired notifications. Admin renewal sends a renewed confirmation. SubscriptionReminder stores one record per subscription, reminder type, and expiration period; its unique idempotency key and atomic first-attempt claim prevent duplicates. Delivery uses the existing EmailProvider/Resend adapter and shared email layout.

## Scheduler

Invoke POST /api/internal/subscriptions/daily once per day with Authorization: Bearer <SUBSCRIPTION_CRON_SECRET>. The secret must contain at least 32 characters. The endpoint returns expiration and delivery counts. Repeated and concurrent executions are safe.

## Admin workflow

/admin/subscriptions supports status, expiration range, and Workspace filters. Pending subscriptions can be activated monthly or yearly. Active/expired subscriptions can be renewed. Active subscriptions can be suspended; non-terminal subscriptions can be cancelled. Every mutation records actor, Workspace, timestamp, previous status, resulting status, duration, and expiration.
