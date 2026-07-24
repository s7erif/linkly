# Workspace Session Fix

## Outcome

The Workspace now establishes the existing OI editor session before enabling editing. Saving no longer depends on an undocumented global storage key.

## Implemented behavior

- After the public card loads, the Workspace checks `sessionStorage` for `editor-session:<cardId>`.
- A stored entry is reused only when its structure is valid and its `expiresAt` is in the future.
- If no reusable entry exists, editing is replaced by a secure access-code gate.
- Submitting the card's access code calls the existing `POST /editor/session` endpoint with a one-hour lifetime.
- The standard success envelope is validated, including the 64-character token and returned session card ID.
- Only `{ token, expiresAt }` is stored. The access code is cleared after exchange and is never persisted.
- A returned session for another card is rejected and never stored.
- Profile and appearance update clients obtain the token internally from the same card-scoped key.
- A 401 or 403 update response removes the stale credential and returns the Workspace to the disabled access gate.
- Failed session creation leaves all editing disabled and presents the server's safe error message.

## Important security constraint

A first editor session cannot be created from `?slug=` alone. The existing `POST /editor/session` contract requires the plaintext card access code, while the database intentionally stores only its hash. Automatically bypassing that input would defeat the finalized customer-access architecture.

Accordingly, “automatic session establishment” means:

- unexpired card-scoped sessions are detected and reused automatically on open or refresh;
- when no session exists, entering the existing access code automatically exchanges it for an editor session before the editor is mounted.

No access code, editor token, or other credential is placed in the URL.

## Scope compliance

Unchanged:

- repositories;
- DTOs;
- use cases;
- database and Prisma schema;
- route handlers and endpoints;
- authorization model;
- renderer and `DefaultTheme`;
- Workspace route.

The fix is client orchestration around the already approved transport and application layers.

## Files

- `src/features/appearance/workspace-session-client.ts`: card-scoped session storage, issuance, reuse, invalidation, and authenticated update clients.
- `src/features/appearance/AppearanceEditor.tsx`: session readiness gate and access-code exchange; no direct token/storage handling remains in save.
- `src/features/appearance/appearance-editor.module.css`: styling for the disabled session gate.
- `tests/workspace-session-client.test.ts`: session lifecycle regression coverage.

## Verification

- TypeScript: PASS.
- Tests: PASS, 22/22.
- ESLint: PASS with zero errors; 42 pre-existing generated/legacy warnings remain.
- Architecture check: PASS.
- Production build: PASS.
