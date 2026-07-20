# Sprint 4 Review

## Rendering flow

`/c/[slug]` → `PublicCardExperience` → `GET /card/[slug]` → `ReadPublicCard` → card repository → `PublicCardDTO` → `DefaultTheme`.

Appearance JSON is validated and normalized to `AppearanceSettings` before entering `PublicCardDTO`. Invalid or legacy configuration falls back to safe defaults. The editor holds a draft in React state, so every control change immediately re-renders the same `DefaultTheme`. Save calls `PUT /cards/[id]/appearance`, which invokes `UpdateCardAppearance` and a transaction-scoped repository.

## Component tree

- `PublicCardPage` (server route shell)
  - `PublicCardExperience` (fetch/loading/error boundary)
    - `DefaultTheme`
- `AppearancePage` (server route shell)
  - `AppearanceEditor` (controls, draft state, save orchestration)
    - `DefaultTheme` (live preview)

## Theme isolation verification

PASS. The canonical theme directory contains exactly one theme component: `DefaultTheme`. Its only props are `PublicCardDTO` and `AppearanceSettings`; it imports no repository, service, use case, composition root, request API, or fetching mechanism. `ARCH014`–`ARCH016` permanently enforce count, dependencies, and prop contract. The older prototype renderer remains outside the canonical directory and is not used by either Sprint 4 route.

## Architectural compliance

- PASS — public data is obtained from the existing Sprint 3 GET endpoint.
- PASS — appearance is strongly typed and Zod validated.
- PASS — writes use `UpdateCardAppearance` and `UnitOfWork`.
- PASS — Prisma remains restricted to repositories.
- PASS — the editor-session token is matched by hash; it is never persisted in plaintext.
- PASS — theme has no fetching or business logic.
- PASS — no analytics, drag-and-drop, theme builder, or dashboard work was added.

## Verification

Strict TypeScript, architecture checks, 16 existing tests, ESLint, Prisma generation, and the Next.js production build pass. ESLint reports 42 pre-existing warnings and zero errors.

## Remaining UI risks

- The public browser route is `/c/[slug]`, because Next.js cannot colocate a page with the required JSON handler at `/card/[slug]`. A later contract decision could move the JSON route under `/api` and reclaim the canonical public URL.
- Public rendering currently begins with a client fetch, which is cache-friendly at the resource layer but weaker for SEO and first render than server-side DTO retrieval.
- The editor assumes a prior flow stores the issued token in session storage under `oi_editor_session_token`; Sprint 4 intentionally does not add authentication or access-code UI.
- The current DTO has no resolved media URLs, so the default theme uses an initial avatar.
- The legacy prototype renderer still exists outside the canonical renderer and should be removed only in its planned migration task.
