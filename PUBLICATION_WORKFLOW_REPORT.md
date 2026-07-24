# Publication Workflow Report

## Outcome

The Workspace now has an explicit publication lifecycle. Save remains an editing operation only. Publish, Unpublish, and Restore are separate commands shared by Customer and Admin Workspace modes.

## Save Workflow

`Save Changes` continues to execute the existing profile, appearance, section, metadata, button, social-link, and slug mutations. It does not write `Card.status`, `publishedAt`, or publication visibility policy.

A dirty Workspace must be saved before publication controls become available. This guarantees the sequence:

`Edit → Save Draft → Publish`

Saving a Draft leaves it `DRAFT / PRIVATE`; the Public URL, QR, Open, and Public View actions remain unavailable.

## Publish Workflow

`AppearanceEditor → workspace-session-client → PUT /cards/[id]/publication → UpdateCardPublication → UnitOfWork → Card repository`

For `PUBLISH`:

- Requires a saved `DRAFT` card. Legacy `UNPUBLISHED` is accepted as backward-compatible Draft input.
- Sets `status = PUBLISHED`.
- Sets `visibility = PUBLIC`.
- Sets `publishedAt` to the transaction clock.
- Refreshes the authorized Workspace DTO immediately.
- Displays Published and the publication date.

## Unpublish and Restore

- `UNPUBLISH` requires `PUBLISHED` and writes `DRAFT / PRIVATE / publishedAt = null`.
- `RESTORE` requires `ARCHIVED` and writes `DRAFT / PRIVATE / publishedAt = null`.
- Invalid transitions return an explicit conflict error.
- Existing Admin card-management transitions were aligned to the same canonical states.

## Shared Authorization

Customer and Admin call the same route and `UpdateCardPublication` use case:

- Customer: the application validates the card-scoped EditorSession.
- Admin: the server derives the NextAuth identity and the application validates `CARD_SUPPORT_EDIT`; no EditorSession is created.
- Admin publication operations use the existing Admin Workspace audit path.

Only authorization differs. The command, transaction, repository update, DTO refresh, UI, and public-reader behavior are identical.

## Public Reader Conditions

`ReadPublicCard` now queries only:

- `status = PUBLISHED`
- `visibility = PUBLIC`
- `deletedAt = null`

Draft, Archived, Private, Unlisted, deleted, and legacy Unpublished cards return Not Found.

Successful public-card responses now use `no-store`. This correctness-first policy prevents a previously cached Published response from remaining visible after Unpublish and makes state transitions observable immediately.

## Why Save and Publish Are Separate

Editing and distribution have different intent and risk. Save protects work-in-progress without exposing it. Publish is an explicit state transition that makes the card publicly discoverable. Keeping them separate prevents incomplete drafts, accidental visibility changes, and ordinary autosave/manual-save activity from changing distribution state.

## Files Added

- `src/use-cases/update-card-publication.ts`
- `src/validation/publication.ts`
- `src/app/cards/[id]/publication/route.ts`
- `tests/publication-workflow.test.ts`

## Key Files Modified

- Card update command port: added optional `publishedAt`.
- Workspace client/editor: separate publication command and state controls.
- Share and Preview panels: disable public actions until Published/Public.
- Public reader: exact Published/Public predicate.
- Public cache headers: immediate no-store visibility changes.
- Existing Admin card transitions: canonical Draft/Published/Archived behavior.

## Verification

- Draft + Save remains unavailable publicly: PASS by command separation and reader predicate.
- Publish produces Published/Public with timestamp: PASS.
- Unpublish produces Draft/Private and public reader excludes it: PASS.
- Archived restore produces Draft/Private: PASS.
- Customer EditorSession path: PASS.
- Admin session path without EditorSession: PASS.
- TypeScript: PASS.
- ESLint: PASS with zero errors; existing warnings remain.
- Tests: PASS — 14 files, 56 tests.
- Architecture enforcement: PASS.
- Production build: PASS on Next.js 16.2.6.
