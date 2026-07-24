# Sprint 19 — Website CMS Report

## CMS modules implemented

- Added a Website group to the Admin navigation.
- Added Website Overview and section routes for Pages, Hero, Features, How It Works, Pricing, FAQ, Testimonials, Partners, Navigation, Footer, and SEO.
- Added typed Website document persistence through the existing scoped `Setting` repository path.
- Added a Website application service with draft read, draft save, and publish operations.
- Added Hero quick editing plus a shared draft editor on every section route; repeatable collection controls and media pickers remain intentionally deferred to the next CMS increment.

## Website architecture

Public and admin pages do not access Prisma. The flow is:

`Admin UI → Website actions → WebsiteContentService → PlatformManagementRepository → Setting`

The public homepage reads the published Website document through the composition root and falls back to the existing default content when no published document exists. Subscription pricing remains owned by the existing Plan read model; the CMS stores only pricing-section presentation metadata.

## Cache strategy

Saving a draft revalidates the Admin Website route only. Publishing revalidates the public homepage and Admin Website route. Card cache tags and unrelated platform caches are untouched.

## Draft / Publish workflow

- Save creates or updates the `DRAFT` Website document.
- Preview/admin reads use the draft document.
- Publish copies the draft state to the `PUBLISHED` document and records publication time.
- Public rendering reads only `PUBLISHED` content.
- No destructive schema migration was required; the existing Setting model is reused.

## Pricing synchronization

Pricing presentation metadata includes section title, visibility, ordering, and featured plan ID. Prices, billing intervals, currencies, and feature entitlements continue to come from Subscription Plans and are not duplicated in CMS content.

## Public rendering integration

The homepage now resolves published hero badge, title, description, and CTA labels through the Website service while preserving the existing fallback experience and public routes.

## Future extensibility

The versioned section map supports additional page types and section-specific editors without changing the renderer contract or commerce domain. The next increment should add structured CRUD editors for repeatable Features, Steps, FAQs, Testimonials, Partners, Navigation, Footer, and SEO fields, plus desktop/tablet/mobile preview panes and simple media selection.

## Verification

- TypeScript: passed.
- ESLint: passed with existing warnings only (image elements, BlockEditor dependency, generated Prisma files).
- Tests: 16 files / 60 tests passed.
- Architecture boundary check: passed.
- Production build: passed; `/admin/website` and `/admin/website/[section]` compile and are server-rendered.

## Files added or modified

- Added `src/services/website-content.service.ts`.
- Added `src/features/admin/website-actions.ts`.
- Added `src/app/admin/website/page.tsx`.
- Added `src/app/admin/website/[section]/page.tsx`.
- Added this report.
- Modified `src/repositories/platform-management.repository.ts`.
- Modified `src/lib/composition-root.ts`.
- Modified `src/features/admin/AdminShell.tsx`.
- Modified `src/app/page.tsx`.

No changes were made to Workspace, Public Card, Renderer, RBAC, card repositories, or application card use cases.

## Scope note

Advanced Media Library, Blog, Page Builder, visual drag-and-drop, email templates, analytics, audit logs, and payment gateways were intentionally not implemented.
