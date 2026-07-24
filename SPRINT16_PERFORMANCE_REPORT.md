# Sprint 16 — Stability, Performance & Admin Workspace Hotfix

## Executive summary

Sprint 16 repaired the Admin authentication/bootstrap regression, verified the complete Admin Workspace aggregate, reduced its warm development response time from 1.77 seconds to 0.49 seconds, added scalable PostgreSQL indexes for all Admin substring-search fields, and completed the project verification suite.

No business feature, renderer behavior, notification behavior, customer authentication behavior, DTO contract, repository pattern, or UnitOfWork write boundary was redesigned.

## Admin Workspace root cause

### Expected path

`/admin/cards/[cardId]/workspace`

1. Admin layout resolves the NextAuth session.
2. Admin Workspace page calls `AdminWorkspace.read(email, cardId)`.
3. The use case authorizes the Admin actor through `PlatformManagementRepository`.
4. `CardReadRepository.findEditorById` reads profile, appearance source, sections, buttons, social links, blocks, and block media references.
5. `PlatformManagementRepository.findActiveSubscriptionByCard` reads the optional active subscription, required Plan, and Plan features.
6. The use case maps the editor aggregate with the canonical `toWorkspaceCardDTO` mapper.
7. DefaultTheme renders the Workspace preview.

### Exact exception

Local authentication reproduced this response:

```text
HTTP 401 Unauthorized
AdminUser was not found
```

The exception originated in `EnsureBootstrapAdmin`: NextAuth first ensured a `LegacyUser`, then attempted to find an unrelated `AdminUser` record and threw `NotFoundError("AdminUser", email)` when it did not exist. The page never reached Card, Block, or Subscription reads.

### Fix

`EnsureBootstrapAdmin` now transactionally ensures the existing `AdminUser` actor through `PlatformManagementRepository.ensureAdminUser` before assigning its bootstrap role. The legacy compatibility user remains unchanged. Authentication, RBAC, and persistence still use their existing layers.

A focused regression test confirms a missing AdminUser is created before role assignment.

## Prisma select and relation audit

Every project occurrence of `findUnique`, `findFirst`, `include`, and `select` was inventoried. Prisma validation, generation, and strict TypeScript compilation confirm all fields against Prisma 7 generated types.

### Admin Workspace card aggregate

The Card repository selects only:

- Card identifiers, slug, name, status, visibility, timestamps, access version, publication and SEO fields.
- Optional `profile` scalar fields.
- `themeConfig` as the existing Appearance source.
- Non-deleted `sections`, `buttons`, `socialLinks`, and `blocks` ordered by position.
- Block `media` relation selecting only `mediaAssetId`.

Block loading was verified with both persisted blocks and an empty block collection. Invalid block configuration continues to be filtered by the canonical mapper.

### Subscription aggregate

The optimized card-derived lookup selects the latest active/trialing/paused Subscription, its required Plan, and Plan features. No subscription is valid and maps to `subscription: null` with empty enabled/disabled features.

### Notification and access-code verification

Admin Workspace does not request Notifications or AccessCodes; neither is necessary to render or edit the Workspace. This avoids unnecessary payload and security exposure.

- Notification selections remain confined to Admin Order Detail and select delivery metadata only.
- AccessCode selections remain confined to Card/Order administration and omit `codeHash`.
- No plaintext, notification body, access-code hash, or usage-history collection is loaded by Admin Workspace.

### Optional relations

Safely handled optional relations include Card profile/theme/order, Order plan/billing selection for legacy rows, empty Card blocks/media, absent customer subscriptions, and empty Plan features.

## Performance measurements

Measurements were authenticated HTTP requests against the local app and configured PostgreSQL database. Each route used five requests; warm averages exclude the first request.

### Baseline development server

| Route | Cold | Warm average |
|---|---:|---:|
| Dashboard | 1.053s | 0.261s |
| Orders | 0.218s | 0.186s |
| Customers | 0.516s | 0.199s |
| Cards | 0.295s | 0.298s |
| Admin Workspace | 2.020s | 1.765s |

### Admin Workspace after parallel read optimization, same development server

| Route | Cold | Warm average | Improvement |
|---|---:|---:|---:|
| Admin Workspace | 2.000s | 0.493s | 72.1% lower warm latency |

The cold development request includes Next compilation and is intentionally not treated as production latency.

### Final production build

| Route | Cold | Warm average |
|---|---:|---:|
| Dashboard | 0.710s | 0.293s |
| Orders | 0.207s | 0.195s |
| Customers | 0.197s | 0.194s |
| Cards | 0.408s | 0.244s |
| Admin Workspace | 0.399s | 0.376s |

Admin Workspace returned HTTP 200, downloaded approximately 40 KB of rendered HTML in the development verification, and contained the permanent `ADMIN EDIT MODE` banner.

## Slow and duplicate query findings

### Admin Workspace — fixed

Before: Admin authorization, Card aggregate, and Subscription aggregate ran sequentially inside an interactive transaction even though the read results are independent.

After: the existing non-transactional read repositories execute the three reads concurrently with `Promise.all`. Admin Workspace writes remain fully transaction-scoped and audited.

### Dashboard — acceptable

Dashboard performs eleven independent aggregate/recent-record queries concurrently. There is no N+1 pattern. Its query count is high but all metrics are required by the approved read model. Combining unrelated metrics into raw SQL was rejected because it would reduce maintainability for negligible current gain.

### List pages — acceptable

Orders, Customers, and Cards each run `count` and paginated `findMany` concurrently. List selects contain only displayed columns and required owner/card-count summaries. No per-row repository call or N+1 query was found.

### Payloads

- Admin list pages do not load blocks, subscriptions, notifications, or access-code collections.
- Admin Workspace loads the complete editable/renderable card aggregate because every selected field is consumed by its preview/read model.
- Admin Workspace does not load notification or access-code data.

## Database index audit

Existing indexes were verified for Order lifecycle states/times, Card slug/customer/status, Customer email/phone/status, Subscription customer/plan/status/expiration, AccessCode hash/card/status/expiration, CardBlock card/enabled/position, and ordered sections/buttons/social links.

### Missing indexes added

Admin search uses case-insensitive `contains`, which ordinary B-tree indexes cannot efficiently serve. Migration `20260720160000_add_admin_search_indexes` enables `pg_trgm` and adds GIN trigram indexes:

- Customer: `displayName`, `email`, `phone`.
- Order: `orderNumber`, `customerName`, `email`, `company`.
- Card: `name`, `slug`.

These indexes are declared in Prisma schema with `gin_trgm_ops`, deployed successfully, and are additive.

## UI performance audit

No UI code change was justified:

- Admin already has route-level skeleton loading through `src/app/admin/loading.tsx`.
- DefaultTheme and BlockRenderer are memoized.
- Gallery, Video, and Location blocks are already lazy-loaded behind Suspense.
- Admin pages are Server Components; client rerender scope is limited to mutation controls.
- No duplicate browser request was found in the page code.

Adding more Suspense boundaries around single database-backed Server Components would not improve the measured response and would increase visual churn.

## Lighthouse and browser audit

Lighthouse/Core Web Vitals could not be executed because the required Chrome DevTools MCP server is not configured in this environment. Per the `web-perf` audit procedure, no score was fabricated.

Required MCP configuration:

```json
"chrome-devtools": {
  "type": "local",
  "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
}
```

Once available, the remaining browser audit should capture authenticated traces for Dashboard and Workspace plus public `/` and `/c/[slug]`, including LCP, CLS, INP/TBT, network payloads, accessibility tree, Best Practices, and SEO.

## Files modified

- `src/lib/auth.js` — passes the Admin display name into bootstrap.
- `src/repositories/platform-management.repository.ts` — ensures AdminUser and adds the card-derived subscription read.
- `src/use-cases/subscription-platform.ts` — repairs bootstrap and exposes the canonical permission predicate.
- `src/use-cases/admin-workspace.ts` — parallel read repositories; transaction-scoped writes unchanged.
- `src/lib/composition-root.ts` — supplies existing read repositories to AdminWorkspace.
- `prisma/schema.prisma` — declares Admin search GIN indexes.
- `prisma/migrations/20260720160000_add_admin_search_indexes/migration.sql` — deploys pg_trgm indexes.
- `tests/sprint-16-stability.test.ts` — bootstrap and Workspace aggregate regressions.
- `docs/DATABASE_SPEC.md` — index documentation.
- `SPRINT16_PERFORMANCE_REPORT.md` and `TASK_REPORT.md` — sprint handoff.

## Verification

- Prisma validate: PASS.
- Prisma generate: PASS.
- Migration deploy/status: PASS; 12 migrations current.
- TypeScript strict check: PASS.
- ESLint: PASS with zero errors and 48 existing warnings.
- Tests: PASS — 12 files, 49 tests.
- Architecture boundary check: PASS.
- Production build: PASS.
- Authenticated Admin Workspace: PASS, HTTP 200 and banner verified.

## Remaining technical debt

- Browser Lighthouse/accessibility traces remain blocked on Chrome DevTools MCP availability.
- Four existing card renderer `<img>` lint warnings should be evaluated with the storage/image delivery strategy rather than changed blindly.
- BlockEditor has one existing exhaustive-deps warning that needs a dedicated behavioral test before adjustment.
- Dashboard uses eleven concurrent queries; introduce a materialized operational summary only if production telemetry shows database contention at scale.
- Trigram indexes increase write and storage cost; monitor index usage and bloat after representative production data volume.
