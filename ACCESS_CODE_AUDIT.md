# Access Code Audit — `john-doe`

Audit date: 2026-07-20  
Scope: development PostgreSQL database, read-only

## Executive result

The OI card with slug `john-doe` exists and is not soft-deleted, but it has no `AccessCode` record. Consequently, no access code can currently create an editor session for this card.

No database rows were created, updated, revoked, rotated, or deleted during this audit. No hashes, environment secrets, or plaintext credentials were read or displayed.

## Findings

### 1. Does an AccessCode record exist?

**No.**

The card was found with ID `0a089f8f-da5d-40e0-bbed-64265d2e7cc7`, slug `john-doe`, `accessVersion` 1, and `deletedAt = null`. A left join against `AccessCode` returned no matching record.

Related state:

- Access-code records: 0
- Access-code usage events: 0
- Editor sessions tied to an access code: 0

### 2. Is it active?

**No active code exists.**

This is not an expired, revoked, or rotated-code condition. There is no record with any status.

### 3. Was the plaintext code ever generated?

**There is no evidence that initial issuance ever completed for this OI card.**

The production `GenerateInitialAccessCode` flow generates plaintext, hashes it, and creates version 1 in one application operation. A successfully completed issuance would leave an `AccessCode` record. None exists.

Strictly, a random value could have existed transiently in process memory if an attempted operation failed before persistence, but that would not constitute an issued/recoverable code and cannot be proven from persisted state. The database confirms that no access code was successfully issued.

### 4. Can the original plaintext be recovered?

**No.**

There is no access-code record for this card. Even when a record exists, the schema stores only `codeHash`; the HMAC-SHA-256 output is intentionally non-reversible. The plaintext is returned only in the one-time result of issuance and is not retained by the repository.

The plaintext must not be reconstructed, bypassed, or replaced by comparing unhashed values.

### 5. Correct existing use case for development issuance

Use **`GenerateInitialAccessCode`**, composed as:

`getAccessCodeUseCases().generateInitialAccessCode`

with the existing card ID and an optional expiry. This is the correct use case because `john-doe` has no prior access-code version. It will:

1. validate the card ID and expiry input;
2. cryptographically generate a new plaintext code;
3. HMAC it with `ACCESS_CODE_HMAC_KEY`;
4. verify the card exists;
5. reject issuance if any earlier version already exists;
6. persist only version 1 and its hash inside the existing Unit of Work;
7. return the formatted plaintext exactly once.

`AccessCodeService.issue` is the rotation/re-issuance service and is not the preferred initial path when no code has ever existed. `VerifyAccessCode` and `CreateEditorSession` cannot manufacture a missing code; they require plaintext corresponding to an existing hash.

## Operational note

There is currently no transport route exposing `GenerateInitialAccessCode`. For development, it should be invoked through an approved one-time development command or existing application composition—not by direct Prisma access and not by inserting a hash manually. Any future invocation would modify data and was intentionally not performed in this audit.

The newly configured development `ACCESS_CODE_HMAC_KEY` must remain stable after issuance. Changing it would make the generated code fail verification against its stored HMAC.

## Evidence method

A parameterized, read-only PostgreSQL query selected the card by exact slug and left-joined its access codes. The query selected only identifiers and lifecycle metadata such as version, status, dates, usage count, hash byte length, usage-event count, and editor-session count. It did not select `codeHash` or any plaintext value.
