# API_SPEC.md

# OI Cards API Specification

Version: 1.0

Status: Planning

---

# API Principles

All APIs must:

- Return JSON
- Use proper HTTP status codes
- Validate input
- Use Prisma ORM
- Never expose sensitive data
- Use authentication where required
- Return consistent response format

Standard Response

Success

{
"success": true,
"data": {}
}

Error

{
"success": false,
"message": "Error message"
}

---

# Authentication

Authentication

Managed بواسطة NextAuth.

Protected Routes

/dashboard/*
/api/admin/*
/api/customers/*
/api/settings/*
/api/themes/*

Public Routes

/@{username}
/api/public/*
/api/qr/*
/api/vcard/*

---

# Customers API

## Admin NFC Card CSV Export

GET `/api/admin/cards/export`

Requires an authenticated administrator session. Accepts the NFC Cards page `search`, `status`, and `sortDirection` filters and exports all matching active inventory records. Activation codes remain masked in CSV output. Generate, disable, restore, and soft-delete operations use authenticated Server Actions and the NFC card service.

## Admin Customer CSV Export

GET `/api/admin/customers/export`

Requires an authenticated administrator session. Accepts the Customers page `search`, `status`, `sortBy`, and `sortDirection` query values and returns all matching non-deleted customers as UTF-8 CSV. Pagination is intentionally excluded from the export scope.

Customer create, edit, and archive operations use authenticated Server Actions and the existing `CustomerService`; no duplicate HTTP mutation API is introduced.

## Get All Customers

GET

/api/customers

Authentication

Required

Returns

- Customer list
- Pagination
- Total count

---

## Get Customer

GET

/api/customers/:id

Authentication

Required

Returns

Customer details.

---

## Create Customer

POST

/api/customers

Authentication

Required

Body

- name
- title
- company
- bio
- phone
- whatsapp
- email
- website
- address
- avatar
- coverImage
- templateId

Rules

- Generate slug
- Generate urlHash
- Create default analytics

---

## Update Customer

PUT

/api/customers/:id

Authentication

Required

Updates customer data.

---

## Delete Customer

DELETE

/api/customers/:id

Authentication

Required

Cascade delete

- SocialLinks
- Analytics

---

## Toggle Active

PATCH

/api/customers/:id/status

Authentication

Required

Updates

isActive

---

# Social Links API

## List

GET

/api/customers/:id/social-links

---

## Create

POST

/api/customers/:id/social-links

Body

- platform
- url
- order

---

## Update

PUT

/api/social-links/:id

---

## Delete

DELETE

/api/social-links/:id

---

## Reorder

PATCH

/api/customers/:id/social-links/order

Body

[
{ id, order }
]

---

# Public API

## Get Public Card

GET

/api/public/:slug

Authentication

Not Required

Returns

Public customer information.

Hidden

- userId
- internal IDs
- admin data

---

## Record View

POST

/api/public/:slug/view

Purpose

Increase pageViews.

---

## Record QR Scan

POST

/api/public/:slug/qr

Purpose

Increase qrScans.

---

## Record Link Click

POST

/api/public/:slug/click

Body

- platform

Purpose

Increase linkClicks.

---

# QR API

## Generate QR

GET

/api/qr/:slug

Returns

PNG

Future

SVG

---

## Download QR

GET

/api/qr/:slug/download

---

# vCard API

## Generate Contact

GET

/api/vcard/:slug

Returns

.vcf file

Contains

- Name
- Company
- Phone
- Email
- Website
- Address

---

# Analytics API

## Dashboard Analytics

GET

/api/analytics

Authentication

Required

Returns

- Total Views
- QR Scans
- Link Clicks
- Active Cards

---

## Customer Analytics

GET

/api/analytics/:customerId

Authentication

Required

Returns

- Views
- QR Scans
- Link Clicks
- Last Visit

---

# Themes API

## List Themes

GET

/api/themes

---

## Get Theme

GET

/api/themes/:id

---

## Update Theme

PUT

/api/themes/:id

Authentication

Required

Admin only.

---

# Company Settings API

## Get Settings

GET

/api/settings

Authentication

Required

---

## Update Settings

PUT

/api/settings

Authentication

Required

Body

- companyName
- logo
- footer
- website
- whatsapp
- facebook
- instagram
- primaryColor
- secondaryColor

---

# Upload API

## Upload Image

POST

/api/upload

Authentication

Required

Supported

- JPG
- PNG
- WEBP
- SVG

Maximum Size

5 MB

Returns

Image URL

---

# Validation

Every endpoint must use

- Zod validation
- Prisma validation
- TypeScript types

---

# Error Codes

200 OK

201 Created

204 Deleted

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

# Security

- Rate limiting
- Input validation
- CSRF protection
- XSS prevention
- SQL Injection protection (via Prisma)
- Authentication checks
- Authorization checks

---

# API Versioning

Current Version

v1

Future

/api/v2

Breaking changes must only be introduced in a new API version.

---

# Development Rules

Every new API endpoint must:

- Have input validation.
- Return the standard response format.
- Be fully typed.
- Be documented here.
- Be tested before merging.

## Sprint 3 Transport Routes (2026-07-20)

The original Sprint 3 transport exposed POST /customers, POST /cards, POST /access/verify, POST /editor/session, and GET /card/[slug]. The access-verification and editor-session prototype routes have since been retired in favor of NFC activation, server-issued EditorSessions, and the canonical public profile route.

The legacy `/api/cards` GET, POST, and DELETE handlers now return `410 GONE`. They must not query the database or recreate authorization from the removed prototype User/Card ownership relationship. Current card creation and mutation remain available only through the documented order, activation, Workspace, and Admin flows.

Responses use the standard success/error JSON envelope and x-request-id header. Domain errors are mapped centrally. Publication state is correctness-critical, so successful public responses are marked no-store and publication changes are visible immediately.

# Sprint 10 Order Presentation Contract

The public `/create-card` form submits through a validated Server Action to `CreateOrder`. The response exposes only the order identifier, order number, and pending status. No Customer, Card, AccessCode, or payment is created at intake.

Administrative order actions are Server Actions protected by NextAuth on every invocation. They call only `ApproveOrder`, `CancelOrder`, and `CompleteOrder`. Approval returns newly issued plaintext access codes once; hashes alone are persisted. Legacy `POST /customers` returns `409 ACTIVATION_REQUIRED`; Admin customer creation is no longer an allowed provisioning path. Legacy `POST /cards` rejects direct creation because cards must originate from approved orders.

## NFC activation transport

- `GET /a/{activationToken}` resolves the short token and renders customer registration, customer sign-in, or authenticated continuation for Available or Reserved inventory.
- Activation mutations are Server Actions. Registration and sign-in complete assignment only inside the provisioning transaction, set an HTTP-only customer-session cookie, issue the existing card-scoped EditorSession, and route directly to the activated Card Builder without an intermediate Workspace state.
- Admin Activation Center mutations are authenticated Server Actions for generating short tokens and changing card lifecycle state. Listing, search, status filters, and pagination remain server-rendered query operations.
- The short token is intentionally stored because it is the permanent NFC routing and support identifier. Database uniqueness plus transactional card claiming prevents duplicate activation.

## Sprint 13 Workspace Mutation Routes

All routes below require the existing plaintext EditorSession token in the request body and call composed application use cases only. Existing profile and appearance routes are unchanged.

Workspace autosave requests append `?save=true`; successful mutating requests return the lightweight `{ "id": "<card-id>", "slug": "<card-slug>" }` result because the autosave caller does not consume a refreshed editor DTO. The slug preserves public-card cache invalidation without an editor reload. Requests without `save=true` retain the existing refreshed editor response.

Every successful write that can change the rendered public aggregate—including appearance and avatar upload—must return the affected card slug and use the shared public-card mutation transport. The transport expires the slug-tagged public cache only after the write transaction commits. The canonical public reader is cached for one hour, so this post-commit invalidation is a correctness contract rather than an optional optimization.

- `PUT /cards/[id]/sections` — visibility and complete section order.
- `POST|PUT /cards/[id]/buttons` — create or reorder buttons.
- `PATCH|DELETE /cards/[id]/buttons/[buttonId]` — update or soft-delete a button.
- `POST|PUT /cards/[id]/social-links` — create or reorder social links.
- `PATCH|DELETE /cards/[id]/social-links/[socialLinkId]` — update or soft-delete a social link.
- `PUT /cards/[id]/settings` — SEO and card visibility.
- `POST|PUT /cards/[id]/slug` — validate availability or change the slug.

## Sprint 14 Block Routes

All block mutations require the existing EditorSession token and call application use cases only: `POST|PUT /cards/[id]/blocks`, `PATCH|DELETE /cards/[id]/blocks/[blockId]`, `POST /cards/[id]/blocks/[blockId]/duplicate`, and `POST /cards/[id]/blocks/initialize`. Existing card APIs remain unchanged.

## Sprint 17 Workspace Authorization

Existing Workspace mutation URLs and request DTO shapes are unchanged. Each handler resolves an optional administrator identity from the server-side NextAuth session and passes it to the same application use case:

- Customer strategy: validate the card-scoped EditorSession token from the existing request contract.
- Admin strategy: ignore the request token as authorization evidence; authorize the server-derived Admin session with `CARD_SUPPORT_EDIT`.

Both strategies execute the same use-case transaction and repository operation. No new mutation endpoint, repository query, or duplicated Admin API was introduced.

## Workspace Block Route Hotfix

Next.js 16 supplies dynamic route params as a Promise. `parseRouteParams` now resolves that Promise before applying the shared Zod schema. Block routes use centralized `cardRouteParamsSchema` and `cardBlockRouteParamsSchema` rather than declaring duplicate parameter validators.

Block request-body schemas are exported independently from full application command schemas. This avoids runtime `.omit()` calls on refined Zod 4 schemas while preserving the same validated command received by the use case. Block operations always use `card.id`; `slug` and `adminCardId` are Workspace-entry locators and are never mutation identifiers.

## Card Publication Workflow

`PUT /cards/[id]/publication` accepts the existing Workspace authorization credential plus one explicit action: `PUBLISH`, `UNPUBLISH`, or `RESTORE`. Customer mode validates the EditorSession; Admin mode derives authorization from NextAuth. Both invoke the same `UpdateCardPublication` application use case.

- Publish: `DRAFT → PUBLISHED`, sets visibility to `PUBLIC`, and records `publishedAt`.
- Unpublish: `PUBLISHED → DRAFT`, sets visibility to `PRIVATE`, and clears `publishedAt`.
- Restore: `ARCHIVED → DRAFT`, sets visibility to `PRIVATE`, and clears `publishedAt`.

Legacy `UNPUBLISHED` records may publish as Draft-compatible input, but new unpublish operations use `DRAFT`. `ReadPublicCard` requests exactly `PUBLISHED` and `PUBLIC` records. Public responses are no-store so an unpublish cannot leave a stale public card at browser or CDN level.

## Short NFC activation routes

- `GET /a/{activationToken}` is the permanent physical-card address. Available or Reserved cards render account activation; Activated cards resolve their linked card’s current slug and redirect to its canonical public profile. The physical URL remains valid when the username changes. Disabled, Lost, and Archived cards do not expose a profile.
- `GET /@{username}` is the canonical public profile route. The legacy `/c/{username}` route has been removed.
- `GET /api/admin/cards/export` exports the filtered activation-token inventory projection and requires an authenticated administrator.
- Admin generation and lifecycle mutations remain authenticated Server Actions. They call `NfcCardService`; pages never import repositories or Prisma.

`GET /activate` is an optional manual token-entry fallback. A submitted token is normalized and redirected to `GET /a/{activationToken}`; it performs no lookup or mutation itself. The duplicate `/activate/{token}` route has been removed.

## Platform Settings administration (2026-07-22)

The authenticated `/admin/settings` module loads and updates the versioned platform configuration through Server Actions and the existing platform repository. The save action validates the complete document before persistence. The test-email action saves validated values, uses the existing server-configured email provider, and never exposes provider credentials to the browser.


## Admin Plans Management

Authenticated PLAN_MANAGE Server Actions provide create/update, duplicate, archive, and activate/deactivate operations. Writes use the existing unit of work, enforce unique slug and sort order, atomically maintain one Popular plan, record Admin audit events, and revalidate /admin/plans. No checkout, subscription, billing, order, or payment API was added.


## Dynamic Public Plans

The Create Card Server Component reads active, non-archived plans through ListActivePlans and loads Platform Settings in parallel. Plan presentation uses Platform Settings currency and repository sort order. Plan mutations revalidate both Admin Plans and /create-card. Load failures are logged server-side and rendered as a safe public fallback.

## Sprint 3.3 subscription scheduler

POST /api/internal/subscriptions/daily requires a Bearer SUBSCRIPTION_CRON_SECRET and invokes the idempotent daily expiration/reminder service. Admin lifecycle mutations remain authenticated Server Actions and expose only ACTIVATE, RENEW, SUSPEND, and CANCEL with MONTHLY or YEARLY duration.
