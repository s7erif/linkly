# Editor Session Debug Audit

## Executive finding

Saving fails because the editor-session establishment step is completely absent from the production UI flow.

Gallery sends the browser directly to `/?slug=<card-slug>`. The root page mounts `AppearanceEditor`, which fetches the public card and allows editing without calling `POST /editor/session`. On save, `AppearanceEditor` reads `sessionStorage["oi_editor_session_token"]`. No production component writes that key, so the component raises “Create an editor session before saving” and returns before either update request is sent.

The editor session is therefore not lost inside an API, repository, or use case. It is never created or handed to the Workspace.

## Verification matrix

| Question | Result | Evidence |
|---|---|---|
| How does Workspace obtain an editor session? | It does not. It only attempts to read a pre-existing global browser storage value. | `AppearanceEditor.tsx:38` calls `sessionStorage.getItem("oi_editor_session_token")`. |
| Is `CreateEditorSession` ever called? | The use case is composed and exposed by `POST /editor/session`, and route tests call it. No production client calls that route or use case. | `src/app/editor/session/route.ts:4-8`; repository-wide search finds no frontend `fetch("/editor/session")`. |
| Is a token stored after creation? | No production creation occurs and no production code calls `sessionStorage.setItem` for the token. | The only non-generated storage reference is the `getItem` in `AppearanceEditor.tsx:38`. |
| Does UpdateCardProfile receive credentials? | Only if the storage key already exists. In the reported flow it receives nothing because the client returns first. | Guard at `AppearanceEditor.tsx:38-39`; intended request body at `:44`. |
| Does UpdateCardAppearance receive credentials? | Only if the same storage key already exists. In the reported flow it also receives nothing. | Guard at `AppearanceEditor.tsx:38-39`; intended request body at `:45`. |
| Does `?slug=` establish a session? | No. It selects and publicly loads a card only. | `src/app/page.tsx:4-7`; `AppearanceEditor.tsx:30`. |
| Does Gallery skip session creation? | Yes. Edit Card is a direct link to `/?slug=${c.slug}` with no session handshake. | `src/app/gallery/page.js:222-227`. |

## Expected flow

1. The user chooses a card to edit.
2. The editor obtains the card's access code through the approved customer-access interaction.
3. The client calls `POST /editor/session` with the access code and optional lifetime.
4. `CreateEditorSession` validates and hashes the access code, finds the active code, generates a cryptographically secure session token, stores only its hash, records access-code usage, and returns `{ session, token }` once.
5. The transport wraps this as `{ success: true, data: { session, token } }` with HTTP 201.
6. The client verifies `data.session.cardId` is the selected OI card and keeps the plaintext token in browser session scope.
7. Profile save sends `{ sessionToken, profile }` to `PUT /cards/[id]/profile`.
8. Appearance save sends `{ sessionToken, appearance }` to `PUT /cards/[id]/appearance`.
9. Each use case hashes the supplied token, resolves the active unexpired editor session, verifies card ownership, and performs the update.

`POST /access/verify` alone is not enough: it verifies a code but does not issue the editor-session token required by the update use cases. `POST /editor/session` is the required credential-issuing step and already performs access-code validation.

## Actual flow

1. Gallery is protected by legacy NextAuth and lists legacy-shaped card data.
2. Edit Card navigates directly to `/?slug=<slug>`.
3. The root page mounts `AppearanceEditor` using only the slug.
4. `AppearanceEditor` calls the public-card read path and creates an editable local draft.
5. No access-code prompt, editor-session request, response parsing, token handoff, or token storage occurs.
6. Save reads `oi_editor_session_token` from `sessionStorage`.
7. The value is absent, so save sets the local error and exits.
8. Neither update endpoint receives a request.

## Failing component

### Primary failure: Gallery-to-Workspace handoff

`src/app/gallery/page.js:222-227` treats selection by slug as sufficient authorization. The link carries card identity but no established editor capability and does not initiate the existing `CreateEditorSession` flow.

### Secondary failure: Workspace session acquisition

`src/features/appearance/AppearanceEditor.tsx:30-39` loads editable data without an editor-session gate. It assumes another component has populated `oi_editor_session_token`, but that component does not exist.

The global, card-agnostic storage key is also unsafe for switching cards: if a token were manually present for card A and the user opened card B, both update APIs would correctly reject it with 403 because the session's `cardId` would not match. Session state must be associated with its card.

## Failing API

There is no defective update API demonstrated by this error.

- `PUT /cards/[id]/profile` accepts the token in its body and delegates to `UpdateCardProfile`.
- `PUT /cards/[id]/appearance` accepts the token in its body and delegates to `UpdateCardAppearance`.
- Both use cases correctly hash the token, require an ACTIVE unexpired session, and enforce `session.cardId === command.cardId`.

In the reported path, these APIs are never called. The missing transport call is `POST /editor/session`: the endpoint exists and is covered by route tests, but has no production caller.

## Exact loss point

The lifecycle is disconnected between Gallery navigation and Workspace mounting:

`Gallery Edit Card link` → `/?slug=` → `public card fetch` → **missing access-code/session establishment** → `sessionStorage.getItem(...)` → local failure.

There is no point after session creation where the token is accidentally dropped; creation never happens.

## Minimal architecture-preserving fix

Add a session-establishment gate to the existing Workspace entry flow, without changing routes, use cases, repositories, DTOs, or authentication architecture:

1. When the selected card has no valid session credential in browser session scope, request its existing access code from the editor user.
2. Call the existing `POST /editor/session` route with that code.
3. Parse the standard response envelope and verify the returned `session.cardId` equals the loaded card's ID.
4. Store the returned plaintext token only in `sessionStorage`, scoped by card ID (for example, `oi_editor_session_token:<cardId>`), never in persistent storage or a URL.
5. Make both existing update calls read that card-scoped token.
6. On an expired/revoked-session 401, remove the scoped token and return to the session-establishment gate.
7. Gallery may continue navigating by slug, but the Workspace must establish or recover the session before presenting a save-capable state.

This reuses the finalized `CreateEditorSession`, update use cases, route handlers, hashing, Unit of Work, and DTO contracts. It adds only the missing client orchestration. It must not derive an editor session from the Gallery's legacy NextAuth session because admin/gallery authentication and customer editor access are intentionally separate actor models.

## Audit scope

This was a read-only runtime audit. No application, route, repository, use-case, DTO, database, or UI implementation file was changed.
