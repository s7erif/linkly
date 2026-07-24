# Card Issuance Workflow

## Canonical workflow

1. An authenticated operator opens `/admin/cards/[cardId]`.
2. The Admin Platform loads the OI Card through the existing `CardService` ID lookup.
3. The operator selects **Issue card**.
4. An authenticated server action revalidates the NextAuth admin session.
5. The action calls the existing `GenerateInitialAccessCode` use case with the card ID.
6. The use case generates cryptographically secure plaintext, HMACs it with `ACCESS_CODE_HMAC_KEY`, verifies the card and absence of any previous version, and writes version 1 within the existing Unit of Work.
7. The database retains only the HMAC hash and lifecycle metadata.
8. The action returns the formatted plaintext once.
9. The Admin UI displays Copy, Print, and Download actions in transient client state.
10. Navigating away or refreshing removes the displayed plaintext; it cannot be queried again.

## Security invariants

- Admin authentication is checked server-side at execution time.
- Plaintext never enters a URL, repository model, log, database field, or browser storage.
- Existing plaintext is never revealed.
- A second initial issuance is rejected by `InitialAccessCodeExistsError`.
- HMAC validation is not bypassed.
- The HMAC key must remain stable.

## Regeneration and revocation

The existing `AccessCodeService.issue` and `revoke` own rotation and revocation semantics. Their platform-wide UI cannot be correctly attached until the frozen application layer exposes an approved access-code collection/read model. Sprint 8 does not invoke direct Prisma or infer state from legacy records.

## One-time handling guidance

The operator must transfer the code using an approved secure channel. Copy, browser print, and a local text download are available immediately. The downloaded artifact is the operator's responsibility and should not be retained beyond fulfillment.

## Failure behavior

- Unauthenticated action: no issuance; returns a safe authentication error.
- Unknown card: no issuance; existing domain error is displayed.
- Prior access-code version: no issuance; operator is told initial issuance already exists.
- Configuration/database failure: no plaintext is displayed as successfully issued.
