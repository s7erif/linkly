# Activation Flow Audit

Date: 2026-07-20
Status: Fixed and verified

## Executive finding

Access-code verification, EditorSession creation, Order approval, Card creation, and slug generation were correct. The failure occurred after navigation: `AppearanceEditor` loaded `/workspace?slug=...` through the public-card transport. That transport intentionally queries only Published cards with Public or Unlisted visibility. Order approval correctly creates a new Card as Draft and Private, so the public query returned null and `ReadPublicCard` raised `Card not found`.

The Workspace now retains the slug URL but resolves the card ID associated with the browser's card-scoped EditorSession and performs a session-authorized editor read. The public read path remains unchanged.

## Verified chain

### 1. VerifyAccessCode

PASS. `VerifyAccessCode` hashes the normalized code, reads `AccessCode` by hash, validates Active/expiration state, records usage, and returns the AccessCode's `cardId`. It does not derive a card from a slug.

### 2. CreateEditorSession

PASS. `CreateEditorSession` reads the same AccessCode by hash and writes `EditorSession.cardId = AccessCode.cardId`. It returns the plaintext session token exactly once while storing only its hash.

### 3. Order approval and Card creation

PASS. `ApproveOrder` creates the Customer, creates the Card with `orderId`, then issues the initial AccessCode for that newly created Card. All writes occur in the existing Unit of Work. The Card is intentionally created as `DRAFT / PRIVATE`.

### 4. Card slug

PASS. The audited database Card has the valid unique slug `sherif-osman-49486b01`. Order-number entropy is included in the generated slug.

### 5. Workspace slug handoff

PASS upstream. `createCustomerWorkspaceSession` resolves the Editor Card by `issued.session.cardId` and returns that exact Card's slug. `AccessCodeEntry` navigates to `/workspace?slug=sherif-osman-49486b01`. The slug matches the persisted Card.

### 6. Workspace resolution

FAILED before hotfix. `AppearanceEditor` discarded the trusted Card ID after navigation and called `fetchPublicCard(slug)`. It did not resolve the active EditorSession when choosing its read model.

PASS after hotfix. Activation stores a session-tab mapping from slug to Card ID alongside the existing card-scoped token. Workspace resolves that mapping, validates the token through `ReadWorkspaceCard`, verifies that `EditorSession.cardId` matches, reads the editor Card by ID, and checks the returned slug against the URL.

### 7. Legacy loading logic

The stale logic was the `fetchPublicCard(slug)` call inside `AppearanceEditor`. This was inherited from the public-preview implementation and was inappropriate for a private editor. No legacy BusinessCard repository was involved in this failure.

### 8. Read-model mismatch

Confirmed.

- Order and activation flow: Card/EditorCard by `cardId`, independent of publication state.
- Old Workspace flow: PublicCard by `slug`, restricted to Published plus Public/Unlisted.

The DTO rendered by the Workspace remains `PublicCardDTO`; only the authorized source selection differs. A shared mapper ensures the public and editor sources produce the same renderer-safe DTO without exposing customer IDs, access versions, hidden actions, or theme storage internals.

### 9. Exact `Card not found` source

The exception originated in `ReadPublicCard.execute`. `PrismaCardReadRepository.findRenderSourceBySlug` applied the conditions:

- matching slug
- `status IN (PUBLISHED)`
- `visibility IN (PUBLIC, UNLISTED)`
- `deletedAt IS NULL`

For the valid Order Card (`DRAFT / PRIVATE`), the repository correctly returned null. `ReadPublicCard` then raised `NotFoundError("Card", slug)`, which the `/card/[slug]` handler returned to `fetchPublicCard`, and `AppearanceEditor` displayed it.

## Database evidence

A read-only PostgreSQL audit found:

- Order: `OI-20260720-49486B01`
- Order status: `FULFILLED`
- Fulfillment: `ACCESS_CODE_ISSUED`
- Card ID: `0915a8e0-60eb-4cfc-b6dc-adcb01dd249a`
- Card slug: `sherif-osman-49486b01`
- Card state: `DRAFT / PRIVATE`
- AccessCode: Active and attached to the same Card ID
- EditorSession: database status `ACTIVE` and attached to the same Card ID. Its audited `expiresAt` was already past current time, so that old browser token must be replaced; this is handled by the existing access-code gate and is separate from the `Card not found` root cause

No data correction or schema migration was required.
