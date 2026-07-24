# Workspace Editor Session Flow

## First entry

1. Gallery navigates to `/?slug=<slug>`.
2. The Workspace loads `PublicCardDTO` through the existing public-card route.
3. The session client derives `editor-session:<cardId>`.
4. If there is no unexpired stored credential, the Workspace does not mount editable controls.
5. The user supplies the access code issued for that card.
6. The client sends `POST /editor/session` with `{ code, lifetimeSeconds: 3600 }`.
7. `CreateEditorSession` hashes the access code, validates its active/expiry state, generates an opaque token, stores only its hash, creates the session, and records access-code usage.
8. The client validates `{ success: true, data: { session, token } }`.
9. The client requires `session.cardId` to match the loaded card.
10. The client stores `{ token, expiresAt }` in session storage under the card-scoped key and clears the access-code input.
11. The editable Workspace mounts.

## Reopen or refresh

1. The Workspace loads the same card.
2. The session client reads `editor-session:<cardId>`.
3. Malformed or locally expired values are removed.
4. An unexpired value is reused without calling `POST /editor/session`, preventing duplicate sessions.
5. Editing is enabled.

## Save

1. `AppearanceEditor` sends typed profile and appearance drafts to the client boundary.
2. `updateWorkspaceProfile` and `updateWorkspaceAppearance` independently resolve the token from `editor-session:<cardId>`.
3. They call the existing endpoints:
   - `PUT /cards/<cardId>/profile`
   - `PUT /cards/<cardId>/appearance`
4. Each existing use case hashes the supplied token, finds the active editor session, checks expiry, and verifies card ownership before writing.
5. The sticky bar changes to Saved after both calls succeed.

## Invalid or revoked session

1. An update responds with 401 or 403.
2. The session client removes the card-scoped stored credential.
3. The Workspace stops presenting editable controls and returns to the access-code gate.
4. No subsequent save is possible until the existing session endpoint issues a new credential.

## Session creation failure

- Invalid, revoked, rotated, or expired access codes are rejected by the existing use case.
- Network or validation failures are shown at the gate.
- Editing remains disabled.
- No plaintext access code is stored.

## Storage and isolation

- Key: `editor-session:<cardId>`.
- Value: JSON containing only the opaque token and expiry timestamp.
- Scope: browser `sessionStorage`.
- Card isolation: both the storage key and server-side `session.cardId` check bind the credential to one card.
- The legacy NextAuth Gallery session is not treated as an OI customer editor session.
