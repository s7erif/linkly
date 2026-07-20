# OI Platform Foundation Architecture Review

**Review date:** 2026-07-20  
**Scope:** Sprint 1 foundation layers and active application call sites  
**Decision:** **Not approved for Sprint 2**

## Executive Summary

The foundation compiles and its dependency direction is partially established, but it does not yet satisfy all architectural invariants. UI-framework isolation passes. Service return contracts mostly pass. However, Prisma input types cross repository interfaces, services directly use the Prisma transaction client, repositories contain business policy, and feature barrels publicly export concrete Prisma repositories. The active legacy application also continues to access Prisma directly.

Sprint 2 should not begin until the Critical and High findings are corrected and guarded by automated architecture tests.

## Verification Matrix

| Invariant | Result | Evidence |
|---|---|---|
| No Prisma models or persistence types leak outside repositories | **Fail** | Repository interfaces expose Prisma create/update input types. AccessCodeService receives an inferred Prisma transaction client and directly executes Prisma writes. Legacy application modules access Prisma directly. |
| All business logic lives in services | **Fail** | Repository implementations decide publication visibility, code activity/expiration, archive state, rotation status defaults, and next-version behavior. |
| Writes use transaction boundaries where appropriate | **Partial** | All current new-service write workflows use withTransaction. Repository constructors also accept the root Prisma client and concrete repositories are publicly exported, so writes are not structurally forced into transactions. |
| DTOs are the only objects returned to callers | **Pass with qualifications** | New service object results are DTOs; revoke returns void. Repository results are DTOs or scalar values. Card repository uses unchecked casts for richer DTOs, weakening proof that returned shapes match contracts. |
| No React/UI imports inside services | **Pass** | No React, JSX, component, or UI imports were found in src/services. |
| Repositories do not import React, NextResponse, cookies, or request objects | **Pass** | No forbidden web/UI imports or request-context APIs were found in src/repositories. |

## Architectural Violations

### FR-001 — Prisma types leak through repository contracts

**Severity:** High  
**Files:**

- src/repositories/customer.repository.ts
- src/repositories/card.repository.ts
- src/repositories/access-code.repository.ts

CustomerRepository and CardRepository accept Prisma.CustomerCreateInput, Prisma.CustomerUpdateInput, Prisma.CardCreateInput, and Prisma.CardUpdateInput. AccessCodeRepository accepts Prisma.AccessCodeCreateInput.

This makes repository interfaces persistence-specific. Services must understand Prisma nested-write syntax such as connect, create, and update. A future repository implementation cannot satisfy these contracts without emulating Prisma.

**Required correction:** Define persistence-independent repository command types. Keep Prisma input and payload types private to Prisma repository implementations.

### FR-002 — AccessCodeService bypasses repositories

**Severity:** High  
**File:** src/services/access-code.service.ts

The service calls transaction-client members directly:

- tx.card.update
- tx.editorSession.updateMany

The service therefore depends on the DAL implementation and performs persistence operations outside repository interfaces. It also means DTO-only and Prisma-isolation guarantees cannot be enforced at compile time.

**Required correction:** Add repository operations for card access-version increments and editor-session revocation. The service should orchestrate repository interfaces only.

### FR-003 — Business policy exists in repositories

**Severity:** High  
**Files:**

- src/repositories/card.repository.ts
- src/repositories/access-code.repository.ts
- src/repositories/customer.repository.ts

Examples include:

- Public-card eligibility requires PUBLISHED status and PUBLIC or UNLISTED visibility.
- Active access-code lookup decides expiration using the current time.
- Access-code revocation supplies a default business status.
- Access-code version calculation implements version policy.
- Archive methods decide terminal status and soft-delete behavior.

Repositories should execute caller-supplied query/write intent. They should not decide lifecycle, publication, or authorization policy.

**Required correction:** Move lifecycle and eligibility decisions into services. Repositories may expose narrowly named persistence queries, but policy inputs such as evaluation time, target status, and update data must come from the service.

### FR-004 — Concrete Prisma repositories are exported as feature APIs

**Severity:** High  
**Files:**

- src/features/customers/index.ts
- src/features/cards/index.ts
- src/features/access-codes/index.ts
- src/repositories/index.ts

Feature barrels export PrismaCustomerRepository, PrismaCardRepository, and PrismaAccessCodeRepository. Callers can bypass services and transaction rules.

**Required correction:** Feature public barrels should export services, DTOs, and application input types only. Concrete repositories should remain internal to the composition root/DAL.

### FR-005 — Transaction use is conventional, not enforced

**Severity:** High  
**Files:**

- src/lib/database/prisma.ts
- all three repository implementations
- feature barrel files

DatabaseClient is a union of PrismaClient and Prisma.TransactionClient. Every write repository can therefore be constructed with the root client and execute outside a service-owned transaction. Public exports make this easy.

Current services do wrap writes correctly, including compound access-code rotation/revocation. The violation is structural: the architecture permits future code to bypass the guarantee.

**Required correction:** Separate read and transactional write ports, or require Prisma.TransactionClient for write repository construction. Keep the root client and transaction helper in the composition root.

### FR-006 — Card DTO mapping relies on unchecked assertions

**Severity:** Medium  
**File:** src/repositories/card.repository.ts

findEditorById and findPublicBySlug cast Prisma query promises directly to DTO promises. These assertions suppress compile-time evidence that database-selected shapes match DTO contracts, especially the Json themeConfig field.

**Required correction:** Add explicit mapping functions for CardDTO, PublicCardDTO, and EditorCardDTO. Normalize JSON into an intentional DTO type instead of asserting compatibility.

### FR-007 — Read operations unnecessarily open transactions

**Severity:** Medium  
**Files:**

- src/services/customer.service.ts
- src/services/card.service.ts
- src/services/access-code.service.ts

Several single-query reads use withTransaction when no consistency boundary spans multiple statements. This adds transaction overhead and couples read composition to the write unit-of-work mechanism.

**Required correction:** Inject read repositories backed by the root/read client. Reserve transactions for multi-write workflows or reads that require a documented isolation guarantee.

### FR-008 — Legacy code bypasses the foundation

**Severity:** High for Sprint 2 integration; accepted only as temporary migration debt  
**Examples:**

- src/app/card/[hash]/page.tsx
- src/lib/auth.js
- src/lib/hash.ts
- src/lib/slug.ts
- src/lib/services/business-card.service.ts
- src/lib/services/social-link.service.ts
- src/lib/prisma.js

These modules access Prisma directly, expose or consume legacy persistence models, and implement business logic outside the new service layer. The old API route imports the legacy service rather than the new feature boundary.

This does not invalidate the isolated Sprint 1 service return types, but it means the repository-wide invariants requested by this review are not true.

**Required correction:** Maintain an explicit legacy allowlist during migration. No Sprint 2 code may add to it. Migrate each call site through new services before removing the legacy DAL.

### FR-009 — No automated boundary enforcement

**Severity:** Medium

The reviewed rules are not encoded in lint rules or architecture tests. Regressions will compile.

**Required correction:** Add checks that prohibit:

- generated Prisma imports outside database/repository implementation paths;
- repository imports from React, Next server APIs, or request-context modules;
- direct Prisma access from services and feature consumers;
- concrete repository exports from feature public entry points;
- service imports from React or Next response/request APIs.

## Confirmed Strengths

- New services contain no React or UI dependencies.
- New repositories contain no React, NextResponse, cookies, headers, NextRequest, or Request dependencies.
- Repository queries use explicit select clauses for entity-returning operations.
- New service methods accept Zod-derived typed inputs.
- New service object results are declared as DTOs.
- Multi-step access-code issuance and revocation execute inside a single transaction.
- Customer and card writes currently execute inside service-owned transactions.
- DTOs do not import Prisma.
- Access-code generation, HMAC hashing, rotation orchestration, and session invalidation intent reside in the service.

## Required Gate Before Sprint 2

1. Replace all Prisma input types in repository interfaces with application-owned command types.
2. Remove direct transaction-client calls from AccessCodeService.
3. Move lifecycle/publication/access-code policy from repositories into services.
4. Stop exporting concrete repositories from feature barrels.
5. Enforce transactional write construction at the type/module boundary.
6. Replace Card DTO assertions with explicit mappers.
7. Add automated import-boundary tests and a temporary legacy allowlist.
8. Re-run this review and require every matrix item to pass.

## Final Decision

**Foundation status: Changes required.**

The project should not continue to Sprint 2 while FR-001 through FR-005 remain open. FR-008 must either be migrated before Sprint 2 integration or formally isolated through an enforced legacy allowlist.
