# Sprint 14 Report — Card Blocks & Rich Content

## Outcome

Sprint 14 is complete. OI cards now support modular, ordered, independently enabled blocks while preserving legacy profile/appearance cards and all existing APIs.

## New block model

`CardBlock` contains UUID identity, card ownership, type, position, enabled state, type-specific configuration, timestamps, and soft deletion. Supported types are Hero, About, Contact, Social Links, CTA Buttons, Gallery, Video, FAQ, Location Map, Divider, and Rich Text.

Configuration is validated per kind with Zod before persistence. Rich Text is stored and rendered as plain formatted text rather than unsafe HTML. Gallery/Video media references are UUIDs, validated against the card owner, and persisted through ordered `CardBlockMedia` relations. No Media Library UI or upload behavior was added.

## Backward compatibility strategy

- `blocks` and authorized `editorBlocks` are optional additive DTO fields. Existing DTO construction remains valid.
- Cards without persisted blocks automatically map CardSection order/visibility to Hero, About, Contact, CTA Buttons, and Social Links blocks.
- Compatibility blocks read existing Profile, Button, Social Link, Appearance, and CardSection values; legacy content is not copied or discarded.
- Opening the Content Blocks panel materializes compatibility blocks through an authorized use case, allowing safe CRUD with real UUIDs.
- Existing profile, appearance, section, public-card, Workspace, Admin, Order, Notification, and activation APIs are unchanged.
- At least one persisted block must remain, preventing an empty persisted collection from becoming indistinguishable from a legacy card requiring compatibility mapping.

## Application use cases

- InitializeCardBlocks
- CreateCardBlock
- UpdateCardBlock
- DeleteCardBlock
- DuplicateCardBlock
- ReorderCardBlocks

Every use case validates input, verifies the existing card-scoped EditorSession, owns a UnitOfWork transaction, uses repository ports only, validates media ownership, and returns Workspace DTOs.

## Repository additions

Optional backward-compatible card repository capabilities now cover block materialization, create, update, soft delete, duplicate, reorder, and tenant-scoped media reference checks. Prisma stays confined to repository implementations and all reads use explicit selects. Existing UnitOfWork exposure is unchanged: capabilities live on the current transaction-scoped `cards` repository.

## Renderer verification

DefaultTheme is fully block-driven: it receives PublicCardDTO and AppearanceSettings, sorts enabled blocks, and delegates each item to a block renderer registry. It no longer defines a fixed profile-section sequence. Legacy DTOs receive derived compatibility blocks. Gallery, Video, and Location renderers use React lazy loading and Suspense; lighter blocks remain in the main renderer chunk. No block fetches data or accesses application infrastructure.

## Workspace UX

The Content Blocks panel supports add, remove, duplicate, collapse, configuration editing, enable/disable, HTML drag-and-drop, and accessible/mobile up/down ordering without page reloads. Successful operations re-read the authorized Workspace card and update Preview. Each block kind presents scoped settings rather than a generic JSON editor.

## Files added

- `prisma/migrations/20260720140000_add_card_blocks/migration.sql`
- `src/dto/card-block.dto.ts`
- `src/validation/card-block.ts`
- `src/use-cases/card-blocks.ts`
- Block route handlers under `src/app/cards/[id]/blocks`
- `src/features/appearance/BlockEditor.tsx`
- `src/components/themes/blocks/BlockRenderer.tsx`
- Lazy Gallery, Video, and Location block components
- `tests/sprint-14-blocks.test.ts`
- `SPRINT14_REPORT.md`

## Files modified

- `prisma/schema.prisma`
- Card DTO exports and additive block fields
- Card repository ports, exports, selects, mapping, and transaction implementation
- Card application mappers and existing CardService public mapping
- Use-case exports and composition root
- Workspace session client, AppearanceEditor, and editor styles
- DefaultTheme and its styles
- Sprint 13 compatibility test
- Project, database, API, UI, and architecture specifications
- `TASK_REPORT.md`

## Performance

- Heavy media/map blocks are lazy-loaded.
- DefaultTheme, BlockRenderer, PreviewPanel, and BlockEditor are memoized.
- Preview uses local DTO state and does not fetch per keystroke.
- Block ordering uses indexed reads and atomic position shifting.
- Media references are selected explicitly and ordered relationally.

## Verification

- Prisma validation: PASS
- Migration status: PASS; 10 migrations, database current
- TypeScript strict mode: PASS
- Architecture enforcement: PASS
- Tests: PASS; 11 files / 47 tests
- ESLint zero-error check: PASS
- Production build: PASS

## Technical debt

- Media Library is intentionally absent. Gallery media displays prepared placeholders, and media selection/resolved URLs remain future work.
- Legacy CardSection and block models coexist during the compatibility period. A later explicit migration can retire section editing only after every card has persisted blocks.
- Block configuration is a polymorphic JSON value object. Zod is the canonical schema; future configuration-version fields may be needed when individual block contracts evolve.
- Video currently accepts direct HTTPS media URLs; provider-specific embeds and privacy controls remain future work.
- The pre-existing clean-shadow migration ordering issue remains documented and was not rewritten.
