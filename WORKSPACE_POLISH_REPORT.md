# Workspace Polish Report

## Result

The Content Blocks route validation regression is fixed for both Customer and Admin Workspace modes. Add, initialize, update, duplicate, delete, and reorder operations continue through the existing client adapter, transport handlers, application use cases, UnitOfWork, and Card repository.

## Root Cause

Two validation defects occurred before the block use case:

1. Next.js 16 exposes dynamic route `context.params` as a Promise. The centralized `parseRouteParams` helper synchronously passed that Promise to Zod. Zod therefore received no `id` or `blockId` field and returned `Route parameter validation failed`.
2. After resolving params, Create Block encountered a latent Zod 4 incompatibility: the route called `.omit({ cardId: true })` on `createCardBlockSchema`, which contains `superRefine`. Zod 4 rejects `.omit()` on refined object schemas at runtime.

The Admin client also used the text `admin-session` to preserve the existing request DTO shape. That value could not pass the unchanged 64-hex token format. It is now a format-compatible zero value that is never treated as authorization evidence; Admin identity and permission still come exclusively from the server-side NextAuth session.

## Correct Card Context

- Block routes expect `cardId`, represented by the `[id]` URL segment.
- Item routes additionally expect persisted `blockId`.
- They do not expect `slug` or `adminCardId`.
- `slug` selects the Customer Workspace entry; `adminCardId` selects the Admin Workspace entry.
- Both modes load `WorkspaceCardDTO` and all `BlockEditor` actions pass `card.id` to the same `workspace-session-client` functions.
- The route combines `[id]` with the validated body into the same application command for either actor. Only the server-derived authorization context differs.

## Validation Consolidation

- `parseRouteParams` now awaits params centrally.
- `cardRouteParamsSchema` and `cardBlockRouteParamsSchema` are shared by all block routes.
- Reusable block request schemas validate session, create, update, and reorder bodies directly.
- Full application schemas compose those body shapes with `cardId`/`blockId` and preserve independent block-configuration validation.
- Runtime route-level `.omit()` schema derivation was removed.

## Unchanged Execution Path

`BlockEditor → workspace-session-client → /cards/[id]/blocks* → card-block use case → UnitOfWork → Card repository`

No repository, Prisma schema, DTO, renderer, Workspace architecture, or save pipeline was changed.

## UX Improvements

- Preview scale: mobile preview widened from 430px to 460px; Fit increased from 94% to 98%; canvas padding was reduced so the card remains the visual focus.
- Sidebar spacing: increased sidebar padding, accordion rhythm, and section spacing without changing layout or controls.
- Sticky save indicator: converted to a raised, bordered, rounded sticky surface with stronger separation and a safe bottom offset.
- Publish status: the editor header and Share panel now display accurate Published, Draft, or Private state rather than an unconditional “Live” label.
- QR layout: constrained and centered the QR image, improved padding, and added a status badge that fits the narrow Share column.

## Verification

- TypeScript: PASS.
- ESLint: PASS with zero errors; existing warnings remain.
- Tests: PASS — 13 files, 52 tests.
- Customer Add Block regression: PASS.
- Admin Add Block regression: PASS with identical `cardId` and command.
- Architecture enforcement: PASS.
- Production build: PASS on Next.js 16.2.6.

## Remaining Existing Warnings

ESLint continues to report pre-existing `no-img-element` warnings in renderer components, generated Prisma eslint-disable warnings, and the existing BlockEditor effect dependency warning. They are unrelated to this hotfix.
