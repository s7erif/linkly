# Bootstrap Seed Report

## Seeded entities

- `AdminRole(SUPER_ADMIN)` — required by RBAC permission checks.
- `AdminUser(admin@oicards.local)` — the credentials provider resolves this compatibility identity.
- `AdminUserRole` assignment — makes the administrator active for all SUPER_ADMIN permissions.
- Legacy `User` compatibility row — required by the existing legacy admin service during login.
- Starter, Professional, and Business Plans — required by active-plan queries and checkout plan selection; prices and feature keys match the plan management UI.
- Plan features (`MAX_CARDS`, `GALLERY`, `VIDEO`, `ANALYTICS`, `SEO`, `CUSTOM_DOMAIN`, `NFC_SUPPORT`) — required by plan entitlements and workspace display.
- `default` and `medical` Themes — match the renderer registry and theme status expectations.
- Published and Draft Website CMS Setting documents — prevent homepage/CMS reads from falling back to missing data.
- Platform Settings — site name, URL, support email, maintenance mode, registration, and public website flags.

## Idempotency

All stable records use upsert or find-then-update/create behavior. Nullable scoped Settings use a safe lookup because PostgreSQL nullable compound uniques cannot be used as Prisma unique selectors. Running `npx prisma db seed` repeatedly does not create duplicates.

## Intentionally not seeded

Customers, Cards, Orders, PaymentSubmissions, Invoices, Subscriptions, AccessCodes, EditorSessions, MediaAssets, Folders, Usage, AnalyticsEvents, Notifications, AuditLogs, RetryTasks, TimelineEntries, and legacy cards are runtime/business records and must be created by their workflows. No fake customer or transaction data is inserted.

## Execution

Prisma 7 uses `prisma.config.ts` `migrations.seed = "tsx prisma/seed.ts"`. A Node-runtime Prisma seed client is generated alongside the application Cloudflare client so the seed executes reliably in Node.

## Verification

- `npx prisma db seed`: passed.
- Repeat seed: passed.
- TypeScript: passed.
- Prisma validation: passed.
