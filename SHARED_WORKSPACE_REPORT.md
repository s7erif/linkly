# Shared Workspace Report

## Outcome

Sprint 17 establishes `/workspace` as the only editor. Customer and administrator flows now render the same `AppearanceEditor`, `BlockEditor`, `PreviewPanel`, `SharePanel`, `DefaultTheme`, and client save adapter.

## Authorization Resolution

- Customer: `/workspace?slug=<slug>` resolves the existing card mapping and card-scoped EditorSession. Existing token hashing, expiry, status, and card ownership checks remain unchanged.
- Admin: `/workspace?adminCardId=<uuid>` resolves NextAuth on the server, loads through `AdminWorkspace.read`, and enforces `CARD_SUPPORT_EDIT` in the application layer. No Access Code or EditorSession is created.
- Transport handlers derive Admin identity from the server session. Admin identity is never accepted from JSON or browser storage.
- Every mutation uses the existing application use case and UnitOfWork. Admin writes additionally append `ADMIN_WORKSPACE_EDIT` audit records.

## Shared Component and Save Pipeline

Both modes use:

1. `AppearanceEditor` for all editing state and save orchestration.
2. `BlockEditor` for rich content operations.
3. `workspace-session-client` for profile, appearance, section, block, button, social, slug, SEO, and visibility mutations.
4. Existing `/cards/[id]/*` transport handlers.
5. Existing update/builder/block use cases and repositories.
6. Existing `PreviewPanel`, `SharePanel`, renderer, and `DefaultTheme`.

The browser stores only a card-scoped Admin-mode marker so the shared adapter chooses the Admin server read branch. This marker is not a credential. Every read and write revalidates the server-side Admin session and permission.

## Removed Duplication

- Removed `src/app/admin/cards/[cardId]/workspace/page.tsx`, the separate profile-only Admin editor.
- Removed `src/features/admin/admin-workspace-actions.ts`, the separate Admin profile save action.
- Removed `AdminWorkspace.update`; `AdminWorkspace` is read-only again.
- Replaced Admin Card links with `/workspace?adminCardId=<cardId>`.

No editor, preview, renderer, block, appearance, or save component was duplicated.

## Admin Banner

Admin Mode adds one banner above the unchanged Workspace. It displays customer identifier, card, plan, and status, with actions to open the public card, regenerate an access code, suspend a subscription, transfer ownership, and delete the card. These controls call existing Admin application actions.

## Verification

- TypeScript: PASS.
- ESLint: PASS with pre-existing warnings only (no errors).
- Tests: PASS — 12 files, 50 tests.
- Architecture enforcement: PASS.
- Prisma validate/generate: PASS (Prisma 7.8.0).
- Production build: PASS on Next.js 16.2.6.
- Route inventory: `/workspace` exists; `/admin/cards/[cardId]/workspace` does not.

## Risks

- The Admin-mode browser marker is intentionally non-authoritative; if the Admin session expires, subsequent reads/writes fail with 401/403. UI recovery is currently the existing Workspace failure state.
- Transfer ownership accepts an explicit customer UUID. A future search/picker may improve operator usability, but was not added because this sprint forbids new features.
- Existing ESLint warnings in renderer images, generated Prisma files, and the pre-existing BlockEditor effect remain outside this scoped architecture change.
