# OI Platform Sprint 2 Review

**Review date:** 2026-07-20  
**Scope:** Application use cases only  
**Decision:** **PASS**

## Use Cases Implemented

### CreateCustomer

- Validates input with Zod.
- Converts validation failures to ValidationError.
- Creates the customer through CustomerWriteRepository inside UnitOfWork.
- Returns CustomerDTO.

### CreateCard

- Validates customer ID, slug, card name, and profile name with Zod.
- Verifies the active customer through CustomerReadRepository.
- Creates Card and CardProfile atomically through UnitOfWork.
- Raises NotFoundError for an unknown customer.
- Returns CardDTO.

### GenerateInitialAccessCode

- Validates card ID and optional future expiration with Zod.
- Confirms the card exists.
- Prevents generation when any access-code version already exists.
- Generates 26 unbiased Crockford Base32 symbols using Web Crypto: 130 bits of entropy.
- Hashes the normalized code with HMAC-SHA-256 before persistence.
- Persists only codeHash and returns plaintext exactly once in IssuedAccessCodeDTO.
- Executes the complete write workflow through UnitOfWork.
- Raises InitialAccessCodeExistsError or NotFoundError explicitly.

### VerifyAccessCode

- Normalizes and validates the submitted code with Zod.
- Immediately HMAC-hashes the ephemeral plaintext.
- Loads the code by hash through AccessCodeRepository.
- Applies active/revoked/expired policy in the use case.
- Atomically updates last-used time and usage count.
- Appends an AccessCodeEventDTO-backed AccessCodeUsage record for successful verification and identifiable rejected attempts.
- Commits known-code rejection events before raising InvalidAccessCodeError.
- Returns VerifiedAccessCodeDTO without hashes or plaintext.

### CreateEditorSession

- Validates access code, session lifetime, occurrence time, and optional pre-hashed request metadata with Zod.
- Re-verifies the access code inside the session-creation transaction.
- Generates a 256-bit session token using Web Crypto.
- Stores only the SHA-256 token hash.
- Creates EditorSession, marks code usage, and appends the access-code event atomically through UnitOfWork.
- Returns IssuedEditorSessionDTO; the session token is returned once and never persisted.
- Raises InvalidAccessCodeError for unknown, expired, rotated, or revoked codes.

### ReadPublicCard

- Validates slug with Zod.
- Reads through CardReadRepository without opening a transaction.
- Restricts cards to published and public/unlisted states.
- Filters hidden buttons and social links in the use case.
- Removes customer ID, access version, editor visibility flags, and theme configuration.
- Returns PublicCardDTO only.
- Raises NotFoundError when the card is not publicly readable.

## Architectural Compliance

| Requirement | Result |
|---|---|
| Existing repository architecture used | PASS |
| All writes use UnitOfWork | PASS |
| No Prisma outside repositories/database infrastructure | PASS |
| All database queries remain in repositories | PASS |
| DTO-only object results | PASS |
| Every input validated with Zod | PASS |
| Zod failures converted to explicit ValidationError | PASS |
| Explicit not-found, conflict, and invalid-code errors | PASS |
| No React, UI, NextResponse, cookies, headers, or request objects | PASS |
| No UI, pages, API routes, middleware, or analytics implemented | PASS |
| ReadPublicCard returns PublicCardDTO only | PASS |
| Architecture enforcement includes src/use-cases | PASS |

## Access-Code Event Storage

The approved schema names the append-only access-code event table AccessCodeUsage. The application exposes rows as AccessCodeEventDTO and writes them exclusively through AccessCodeRepository.recordEvent. No counter-only event mechanism was introduced.

A failed attempt can be recorded only when its hash identifies an existing code because AccessCodeUsage requires accessCodeId. Completely unknown submissions are intentionally not persisted, preventing storage of submitted plaintext or hashes without an owning code.

## Test Coverage

Automated Vitest coverage contains 10 passing tests:

- CreateCustomer success and validation failure.
- CreateCard success and missing-customer rejection.
- GenerateInitialAccessCode hash-only persistence and duplicate prevention.
- VerifyAccessCode successful usage/event recording and expired-code rejection event.
- CreateEditorSession token-hash persistence, event recording, and one-time token return.
- ReadPublicCard public-only projection and hidden-action filtering.

Additional gates:

- npm run architecture:check: passed.
- npm run typecheck: passed.
- npm run lint: passed with zero errors.
- npm run build: passed.
- npm run verify:sprint2: passed.

No live-database integration test was added; repository correctness remains covered by strict Prisma-generated types, explicit mappings, migration drift checks from Sprint 1, and production compilation.

## Remaining Risks

- API-layer rate limiting, request metadata hashing, and transport security are intentionally deferred because Sprint 2 excludes APIs and middleware.
- Completely unknown access-code attempts cannot create AccessCodeUsage rows because the approved relational model requires an accessCodeId. Rate-limit telemetry should handle those attempts later without retaining plaintext.
- Session validation, renewal, logout, and cleanup use cases are outside this sprint.
- Callers receiving initial codes or session tokens must deliver them over a secure channel and must not log or persist plaintext.
- Concurrent unique conflicts are mapped to ConflictError by PrismaUnitOfWork; callers may later add bounded retry behavior where appropriate.
- npm continues to report the previously documented dependency audit findings; forced upgrades remain outside this sprint.

## Final Decision

**Sprint 2 application use cases: APPROVED.**

All six required use cases are implemented, tested, and compliant with the approved foundation boundaries.
