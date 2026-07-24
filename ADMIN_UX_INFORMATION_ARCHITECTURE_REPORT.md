# Admin UX Information Architecture Redesign

## New top-level workflow sections

1. Workspace — Overview
2. Sell & bill — Orders, Payments, Invoices, Subscriptions
3. Manage — Customers, Cards, Plans, Access Codes
4. Experience — Website, Media
5. Operations — Analytics, Notifications, Activations
6. Settings — System Settings, Audit Logs, Integrations, Email Templates

All existing routes remain available; low-frequency operational tools are grouped under Settings and no feature was removed.

## UX improvements

- Removed duplicated Media and Platform navigation groups.
- Replaced database-model navigation with workflow language.
- Reduced the sidebar to six top-level groups.
- Added a scrollable navigation region for long settings/operations lists.
- Preserved responsive shell behavior and added a max-width content rail.
- Improved active navigation density, hover affordances, labels, and hierarchy.
- Kept Overview as the operational command center with KPIs, activity, orders, and subscription context.

## Backend preservation

No repositories, application services, DTOs, authorization, data models, or business logic were changed.

## Verification

- TypeScript: passed.
- Existing backend architecture preserved.
