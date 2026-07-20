# OI Platform Sprint 3 Transport Review

**Review date:** 2026-07-20  
**Scope:** HTTP transport layer only  
**Decision:** **PASS**

## Route Inventory

| Method | Route | Application use case | Success |
|---|---|---|---|
| POST | /customers | CreateCustomer | 201 |
| POST | /cards | CreateCard | 201 |
| POST | /access/verify | VerifyAccessCode | 200 |
| POST | /editor/session | CreateEditorSession | 201 |
| GET | /card/[slug] | ReadPublicCard | 200 |

Each route validates transport input with Zod before calling its composed application use case. No route imports repositories, Prisma, database infrastructure, React, pages, or UI components.

## Response Envelope

Successful responses:

{
  "success": true,
  "data": {}
}

Error responses:

{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Safe public message",
    "details": {}
  }
}

The request identifier is carried in the x-request-id response header instead of the body. This keeps successful public-card response bodies stable and cache-friendly.

## Error Mapping

| Domain/transport error | HTTP status | Public code |
|---|---:|---|
| ValidationError, malformed JSON, invalid route parameter | 400 | VALIDATION_ERROR |
| InvalidAccessCodeError / UnauthorizedError | 401 | UNAUTHORIZED |
| ForbiddenError | 403 | FORBIDDEN |
| NotFoundError | 404 | NOT_FOUND |
| ConflictError / InitialAccessCodeExistsError | 409 | CONFLICT |
| Other AppError with server status | configured 5xx | INTERNAL_ERROR |
| Unknown exception | 500 | INTERNAL_ERROR |

Server-error messages and details are not exposed. Every error response uses Cache-Control: no-store.

## Request ID Propagation

- A valid incoming x-request-id containing 1-128 safe characters is preserved.
- Missing or malformed IDs are replaced with crypto.randomUUID().
- The ID is returned in the x-request-id response header.
- Structured start, completion, rejection, and failure logs include request ID, method, path, status, and duration.
- Request bodies, access codes, authorization values, cookies, and session tokens are never logged.

## Caching Strategy for GET /card/[slug]

Successful public-card responses set:

- Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=86400
- CDN-Cache-Control: public, max-age=300, stale-while-revalidate=86400
- Cloudflare-CDN-Cache-Control: public, max-age=300, stale-while-revalidate=86400

This permits a short browser cache, a five-minute shared/CDN freshness window, and stale serving during background revalidation. The JSON body contains only the standard envelope and PublicCardDTO; it has no request-specific metadata.

Route-handler execution is dynamic at the Next.js layer because data comes from PostgreSQL. Shared caching is controlled explicitly by HTTP/CDN headers.

## Architectural Compliance

| Requirement | Result |
|---|---|
| Transport layer only | PASS |
| No React UI or pages implemented | PASS |
| No dashboard/editor pages implemented | PASS |
| Routes call composed application use cases only | PASS |
| No Prisma or repository access in routes | PASS |
| No business rules in route handlers | PASS |
| Every body and path parameter validated with Zod | PASS |
| Standard JSON envelope | PASS |
| Central domain-error conversion | PASS |
| Request ID propagation | PASS |
| Structured request logging | PASS |
| Public-card caching headers | PASS |
| No analytics ingestion | PASS |
| No authentication middleware | PASS |
| Architecture rules cover route handlers | PASS |

The legacy React handler occupying /card/[slug] was removed because Next.js 16 forbids page.tsx and route.ts at the same segment. No replacement UI was introduced.

## Test Coverage

Six transport tests cover:

- POST /customers success, validation failure, envelope, status, request ID, and structured logging.
- POST /cards use-case delegation and 201 response.
- POST /access/verify delegation and normalized input.
- POST /editor/session delegation and 201 response.
- GET /card/[slug] delegation, envelope, and all caching headers.
- Domain NotFoundError mapping, no-store error caching, and generated request IDs.

The combined suite contains 16 passing tests across Sprint 2 and Sprint 3.

Verification:

- npm run architecture:check: passed.
- npm run typecheck: passed.
- npm run test: 16/16 passed.
- npm run lint: passed with zero errors.
- npm run build: passed and lists all five requested routes.
- npm run verify:sprint3: passed.

## Remaining Risks

- CDN configuration must honor CDN-Cache-Control and Cloudflare-CDN-Cache-Control in production.
- A CDN-cached response may replay an origin-generated x-request-id. Edge infrastructure should overwrite or append its own per-request trace identifier on cache hits.
- No explicit tag-based invalidation exists yet. Published-card changes may remain stale for up to the configured shared-cache window.
- Rate limiting, authentication/authorization, CSRF policy, and request metadata hashing remain intentionally deferred.
- Structured logs currently target console output; production log shipping and retention policy remain deployment concerns.
- Existing legacy /api routes remain outside this Sprint 3 route inventory and should be retired through their own migration task.
- Existing warning-only ESLint findings concern legacy image elements and generated Prisma directives; there are no lint errors.

## Final Decision

**Sprint 3 transport layer: APPROVED.**

All requested routes and cross-cutting transport requirements are implemented and verified without introducing UI, analytics, or authentication middleware.
