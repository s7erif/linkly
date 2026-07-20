# OI Platform Foundation Architecture Review V2

**Review date:** 2026-07-20  
**Scope:** Sprint 1 foundation, compatibility services, active routes, and enforcement tooling  
**Decision:** **APPROVED — all architecture gates pass**

## Executive Summary

Every violation recorded in FOUNDATION_REVIEW.md has been eliminated. Persistence types and operations are confined to repository implementations and database infrastructure. Services depend only on application-owned repository ports and a domain-level UnitOfWork. Write repositories require a Prisma transaction client and are created only inside PrismaUnitOfWork. Active legacy routes, authentication compatibility, public-card rendering, diagnostic scripts, and legacy services no longer query Prisma directly.

The automated architecture check, strict TypeScript, ESLint, and production build all pass.

## Verification Matrix

| Invariant | Result | Evidence |
|---|---|---|
| No Prisma models or persistence types leak outside repositories | **PASS** | Repository ports in src/repositories/contracts.ts use only DTOs, domain enums, primitives, and application commands. Generated Prisma imports are restricted by ARCH001 and ARCH007. |
| Domain commands replace Prisma inputs | **PASS** | Customer, Card, AccessCode, EditorSession, and legacy write contracts use application-owned command interfaces. |
| Services contain no direct Prisma usage | **PASS** | Both service directories contain no generated Prisma import, Prisma namespace, client, model query, or transaction-client access. ARCH002, ARCH003, and ARCH005 enforce this. |
| Every database query lives in a repository | **PASS** | Active routes, authentication, pages, helpers, services, and diagnostics call services or repository ports. Concrete model operations exist only in src/repositories. |
| Business policy lives in services | **PASS** | Publication eligibility, public link/button visibility, archive state, access-code validity time, rotation status, version increment policy, code generation, slug/hash uniqueness policy, and legacy normalization are service-owned. |
| Writes use transaction boundaries where appropriate | **PASS** | All writes execute through UnitOfWork. Write-capable repositories require Prisma.TransactionClient and are instantiated only by PrismaUnitOfWork. |
| DTOs are the only objects returned to callers | **PASS** | Service and repository object results are explicit DTOs. Commands return DTOs or void; count/version queries return scalars. |
| DTO mappings are explicit and safe | **PASS** | Customer, Card, EditorCard, AccessCode, LegacyCard, LegacyLink, and LegacyUser have field-by-field mapping functions. No DTO type assertions remain. |
| No React/UI imports exist inside services | **PASS** | Enforced by ARCH004 and verified across src/services and src/lib/services. |
| Repositories do not import React, NextResponse, cookies, headers, or request objects | **PASS** | Enforced by ARCH006 and verified across src/repositories. |
| Concrete repositories cannot be used as feature APIs | **PASS** | Feature barrels expose services, DTOs, service dependencies, and validated input types only. ARCH008 and ARCH011 prevent repository bypasses. |
| Read operations avoid unnecessary transactions | **PASS** | Read services use injected read repositories. UnitOfWork is reserved for write workflows and consistency-sensitive read/write sequences. |
| Legacy Prisma access is eliminated | **PASS** | The old singleton path was removed. Legacy services, API route, public page, auth compatibility, and diagnostics now use repository-backed services. |
| Architecture rules are automated | **PASS** | scripts/check-architecture.mjs is available through npm run architecture:check and included in npm run verify:foundation. |

## Resolution of Original Findings

### FR-001 — Prisma types in repository contracts: PASS

Prisma CreateInput and UpdateInput types were replaced by application commands in src/repositories/contracts.ts. The repository barrel exports type-only ports and commands.

### FR-002 — Direct Prisma writes in AccessCodeService: PASS

Card access-version updates and editor-session revocation are repository operations. AccessCodeService orchestrates transaction-scoped ports and never sees a transaction client.

### FR-003 — Business policy in repositories: PASS

Repositories accept explicit criteria and commands. Services now choose lifecycle states, timestamps, permitted publication states/visibility, code validity, next version, and archive behavior. Public DTO filtering is performed by CardService.

### FR-004 — Concrete repository exports: PASS

Feature entry points no longer export repository interfaces or implementations. Concrete implementations are imported only by the composition root or repository unit-of-work implementation.

### FR-005 — Transaction boundary not enforced: PASS

Read and transaction repositories are distinct. All write implementations require Prisma.TransactionClient. PrismaUnitOfWork is the only creator of write repositories and supplies one transaction-scoped repository set per callback.

### FR-006 — Unsafe Card DTO assertions: PASS

All Card, EditorCard, and nested profile/link/button results use explicit mapping functions. No cast to a DTO promise or DTO object remains.

### FR-007 — Read transactions: PASS

Customer, Card, AccessCode, and legacy reads use root read repositories. Transactions are opened only for writes or multi-operation consistency boundaries.

### FR-008 — Legacy bypasses: PASS

Direct Prisma calls were removed from the legacy card and social-link services, auth compatibility, public card page, slug/hash generation, API route, and diagnostic scripts. The old src/lib/prisma.js access path was removed.

### FR-009 — Missing enforcement: PASS

The architecture checker rejects:

- Prisma imports or direct model access outside repositories/database infrastructure;
- database infrastructure imports or transaction-client access in services;
- React, Next.js, cookies, headers, or request APIs in services/repositories;
- Prisma types in repository ports;
- repository exposure through feature entry points;
- DTO type assertions in repositories;
- legacy Prisma import paths;
- concrete repository use outside the DAL/composition root.

## Verification Results

- npm run architecture:check — passed.
- npm run typecheck — passed under strict TypeScript.
- npm run lint — passed with zero errors. Existing warning-only output concerns image optimization and generated Prisma eslint directives.
- npm run build — passed on Next.js 16.2.6.
- Prisma schema was not changed by this remediation.

## Final Decision

**Sprint 1 foundation architecture: APPROVED.**

Every violation from FOUNDATION_REVIEW.md is now PASS. The foundation may proceed to Sprint 2 after normal stakeholder confirmation.
