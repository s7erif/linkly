# Sprint 6 Workspace Migration

## Outcome

`/` is now the single canonical editor. It mounts the OI `AppearanceEditor` workspace with a shared Profile and Appearance draft, the preserved `PreviewPanel`, and the preserved `SharePanel`. The separate `/appearance/[slug]` editor route was removed rather than redirected.

## Canonical flow

Gallery edit → `/?slug=[slug]` → OI public-card DTO → shared workspace draft → `PreviewPanel` → `DefaultTheme`.

Save executes two established application writes using the same editor-session capability:

- Profile → `PUT /cards/[id]/profile` → `UpdateCardProfile` → UnitOfWork.
- Appearance → `PUT /cards/[id]/appearance` → `UpdateCardAppearance` → UnitOfWork.

Neither the workspace nor its panels access Prisma, repositories, legacy services, NextAuth, or legacy `/api/cards`.

## Removed legacy editor dependencies

- Removed `src/components/FormPanel.tsx` and all Identity/Contact/Social sidebar wiring.
- Replaced the root `Home` component’s legacy form state and `/api/cards` calls.
- Removed root dependencies on NextAuth, upload API, legacy card IDs, template IDs, generated HTML templates, iframe previews, and legacy create/update/delete handlers.
- Removed PreviewPanel dependencies on `ThemeRegistry`, `CardRenderer`, `generateCardDocument`, legacy `formData`, and iframe refs.
- Removed SharePanel dependencies on legacy form data, legacy session props, and parent-managed URL/QR state.
- Removed `/appearance/[slug]`; its editor is now mounted by `/`.
- Updated Gallery edit navigation from `/?id=[legacy-id]` to `/?slug=[slug]`.

## Preserved components

`PreviewPanel` and `SharePanel` remain named, reusable workspace components. Their contracts now accept OI values: PreviewPanel receives `PublicCardDTO` and `AppearanceSettings`; SharePanel receives the OI slug.

## Verification

Architecture checks, strict TypeScript, 18 tests, ESLint with zero errors, Prisma generation, and the production build pass. The build exposes `/` and no longer exposes `/appearance/[slug]`.
