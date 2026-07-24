# Sprint 13 Architecture Extension Report

## Outcome

Sprint 13 is complete. The Workspace is now a visual, section-based card builder with persisted order and visibility, full button/social-link CRUD, SEO, validated slug changes, richer appearance controls, responsive editing, dirty-state protection, and synchronized preview. Extensions are additive and retain the established layering.

## Extended interfaces

### DTOs and read models

- `CardDTO`: optional `seoTitle` and `seoDescription`. Optionality preserves construction by existing callers.
- `CardSectionKind` and `CardSectionDTO`: typed canonical section metadata.
- `EditorCardDTO`: optional `sections`; all existing properties are unchanged.
- `PublicCardDTO`: optional `sections`; visible button/social shapes are unchanged.
- `WorkspaceCardDTO`: new subtype adding optional `editorButtons` and `editorSocialLinks`, including hidden records for authorized editing. Public reads never receive these fields.

### Repository ports

`CardReadRepository` adds optional `slugExists`. `CardWriteRepository` adds optional capabilities for settings, section replacement, button CRUD/reorder, and social-link CRUD/reorder. New command types are persistence-independent. Capabilities are optional at the port boundary so existing implementations, consumers, and test doubles remain source-compatible; composed Prisma repositories implement every capability.

### Unit of Work

No new Unit-of-Work property was introduced. The existing transaction-scoped `cards` repository now supplies the optional builder capabilities. Every write still executes through `UnitOfWork.execute`.

### Appearance and renderer input

Existing `AppearanceSettings` fields remain unchanged because they already support colors, solid/gradient background, typography, button style, radius, shadow, and compatibility visibility flags. Persisted CardSection DTOs are additive renderer input.

## New use cases

- `UpdateCardSections`
- `CreateCardButton`
- `UpdateCardButton`
- `DeleteCardButton`
- `ReorderCardButtons`
- `CreateSocialLink`
- `UpdateSocialLink`
- `DeleteSocialLink`
- `ReorderSocialLinks`
- `ChangeCardSlug`
- `ValidateCardSlug`
- `UpdateCardMetadata`

Every use case validates with Zod, hashes and verifies the EditorSession token, checks card ownership, owns its transaction boundary, uses repository ports only, and returns DTO/read-model data. Slug availability is an application result rather than exposed repository validation.

## Repository additions

The card repository now explicitly selects and maps SEO fields and CardSection rows. It creates default section rows with new cards, supplies deterministic fallback sections for older compatible data, atomically shifts positions before reorder operations, preserves soft-deleted collection history, and uses scoped writes for child records. No Prisma model crosses the repository boundary.

## Database migration

Migration `20260720130000_add_visual_card_builder` adds nullable SEO columns, section indexes/uniqueness, and canonical section rows for active cards with no prior section data. It is additive; existing card, link, button, and appearance data remains intact. The configured database reports all nine migrations applied.

## Renderer behavior

DefaultTheme remains the single layout. It constructs presentation functions for known section kinds, sorts the DTO section collection by persisted position, filters hidden sections, and renders in that data order. Existing DTOs without sections use the canonical fallback order. Appearance compatibility flags continue to be respected.

## Existing API compatibility

Existing routes—including profile, appearance, activation, public-card, Order, Admin, and Notification endpoints—were not removed or renamed. New routes are additive under `/cards/[id]`. Existing PublicCardDTO button/social fields retain their prior shapes. Existing cards without SEO or caller-supplied section arrays continue to render.

## UX improvements

- Seven focused collapsible editor panels.
- Immediate local preview for profile, appearance, visibility, SEO, buttons, and links.
- Successful mutations re-read the authorized Workspace model without page reload.
- HTML drag-and-drop plus keyboard/touch up/down ordering controls.
- Sticky Saved/Saving/Unsaved/Error feedback.
- Browser warning for unsaved or in-flight edits.
- Native and Zod validation for email, phone, destination URLs, SEO lengths, and slug format.
- Server-side slug uniqueness validation before mutation.
- Responsive single-column mobile editing with sticky editor header/save bar.

## Performance considerations

- DefaultTheme and PreviewPanel are memoized.
- Derived editor collections and preview DTO are memoized.
- Preview changes are local; no network request occurs per keystroke.
- Persistence refresh happens after explicit successful mutations and uses the authorized card read model.
- Repository reads use explicit selects and indexed section ordering.
- Public metadata is rendered server-side from the existing public-card use case.

## Files added

- `prisma/migrations/20260720130000_add_visual_card_builder/migration.sql`
- `src/validation/card-builder.ts`
- `src/use-cases/card-builder.ts`
- Additive route handlers under `src/app/cards/[id]/sections`, `buttons`, `social-links`, `settings`, and `slug`
- `tests/sprint-13-card-builder.test.ts`
- `SPRINT13_EXTENSION_REPORT.md`

## Files modified

- `prisma/schema.prisma`
- `src/dto/card.dto.ts`, `src/dto/index.ts`
- `src/repositories/contracts.ts`, `src/repositories/index.ts`, `src/repositories/card.repository.ts`
- `src/use-cases/card-mappers.ts`, `src/use-cases/read-workspace-card.ts`, `src/use-cases/index.ts`
- `src/lib/composition-root.ts`
- `src/features/appearance/actions.ts`, `workspace-session-client.ts`, `AppearanceEditor.tsx`, and editor styles
- `src/components/PreviewPanel.tsx`, `src/components/themes/DefaultTheme.tsx`
- `src/validation/use-cases.ts`
- `src/app/c/[slug]/page.tsx`
- Project architecture, database, API, UI, and project specifications
- `TASK_REPORT.md`

## Verification

- Prisma validate/status: PASS; database current with 9 migrations
- Architecture enforcement: PASS
- TypeScript strict mode: PASS
- Tests: PASS, 10 files / 44 tests
- ESLint: PASS with zero errors; 44 pre-existing warnings only
- Production build: PASS

## Remaining technical debt

- HTML drag events have inconsistent touch behavior across older browsers; up/down controls provide the supported mobile fallback.
- Collection save currently persists changed rows individually through isolated authorized transactions. A future additive bulk application use case could reduce round trips for very large collections without changing UI contracts.
- Section `kind` remains a database string for compatibility. Application validation restricts it to the five canonical V1 kinds.
- The pre-existing migration-history timestamp ordering issue documented in Sprint 12 still affects clean shadow replay and was not rewritten.
