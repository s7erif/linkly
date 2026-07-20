# Sprint 4 Architecture Addendum

## Canonical rendering

The canonical public renderer is `DefaultTheme`. It accepts only `PublicCardDTO` and validated `AppearanceSettings`. Data retrieval belongs to the public-card feature client; persistence belongs to the `UpdateCardAppearance` application use case. Theme configuration remains stored in `Card.themeConfig` and is converted to a typed appearance model at the application boundary.

The Sprint 3 JSON resource remains `GET /card/[slug]`. Next.js does not allow a page and route handler to own the same segment, so the browser experience is exposed at `/c/[slug]` and consumes that JSON resource. The appearance editor is `/appearance/[slug]`; `PUT /cards/[id]/appearance` persists validated settings for a matching active editor session.

## Security boundary

Appearance writes require the opaque editor-session token created by the existing editor-session use case. Only its SHA-256 hash is queried. The use case rejects missing, revoked, expired, or cross-card sessions and performs the lookup and update within one Unit of Work transaction.
