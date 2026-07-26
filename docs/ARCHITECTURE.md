# SYSTEM_ARCHITECTURE.md

Version: 1.0

Status: Official Architecture

---

# Architecture Philosophy

OI Platform is built around one core idea:

Everything revolves around the Card.

Not the user.
Not authentication.
Not subscriptions.

The Card is the center of the system.

---

# High Level Architecture

                    Internet
                        │
                        ▼
                Landing Website
                        │
      ┌─────────────────┴─────────────────┐
      │                                   │
      ▼                                   ▼

Manage (Access Code) Public Card
│ │
▼ ▼
Card Editor Card Renderer
│ │
└──────────────┬────────────────────┘
▼
Database

                     ▲
                     │
              Admin Dashboard

---

# System Modules

1.

Landing Website

Responsible for

- Marketing
- Pricing
- FAQ
- Contact
- SEO

Independent from Dashboard.

---

2.

Access Code System

Responsible for

- Validate Code
- Find Card
- Open Card Editor

No Authentication.

No Password.

---

3.

Card Editor

Responsible for editing

- Profile
- Theme
- Links
- Buttons
- Settings

Uses Autosave.

---

4.

Card Renderer

Single rendering engine.

Never duplicate rendering.

Everything renders using

CardRenderer

↓

Theme

↓

Card Data

---

5.

Theme Engine

Theme receives only

CardData

Example

<CardRenderer>

↓

MedicalTheme(CardData)

↓

HTML

---

Rules

Theme never fetches data.

Theme never calls API.

Theme only renders.

---

6.

Public Card

Responsibilities

Metadata

Analytics

Share

QR

Footer

Rendering handled ONLY by

CardRenderer.

---

7.

Analytics Engine

Track

Visits

↓

Clicks

↓

Save Contact

↓

QR Scan

↓

Device

↓

Country

↓

Browser

Stored independently.

Never modifies card.

---

8.

Subscription Engine

Responsible for

Plan Validation

Limits

Expiration

Feature Access

Independent module.

---

9.

Admin Dashboard

Controls

Customers

Cards

Themes

Subscriptions

Plans

Analytics

Settings

Everything starts here.

---

# Folder Structure

src/

app/

components/

features/

lib/

services/

hooks/

types/

styles/

prisma/

public/

---

# Features

features/

landing/

card/

editor/

analytics/

subscription/

access/

theme/

admin/

shared/

Each feature owns

Components

Hooks

Services

Types

Utils

---

# Components

components/

ui/

layout/

forms/

cards/

charts/

tables/

modals/

shared/

Reusable only.

Business logic stays inside features.

---

# Services

services/

card.service.ts

analytics.service.ts

subscription.service.ts

theme.service.ts

access.service.ts

customer.service.ts

No UI.

No Components.

Business Logic only.

---

# API

/api/

access

cards

analytics

customers

themes

plans

subscriptions

settings

One responsibility per route.

---

# Database Flow

Manage Page

↓

Access Code

↓

Access Service

↓

Database

↓

Card

↓

Editor

---

# Public Flow

Visitor

↓

Public URL

↓

Card Service

↓

Card Data

↓

Theme Engine

↓

Card Renderer

↓

Analytics

↓

Response

---

# Admin Flow

Admin

↓

Dashboard

↓

Service Layer

↓

Database

↓

Response

---

# Rendering Pipeline

Database

↓

Normalize Card

↓

Card Data

↓

Card Renderer

↓

Theme

↓

Public Page

Dashboard Preview uses

Exactly

The same pipeline.

---

# Theme Rules

Theme receives

CardData

Nothing else.

No Fetch.

No API.

No Database.

No Cookies.

No Local Storage.

Only Rendering.

---

# Card Rules

One Card

↓

One Access Code

↓

One Public URL

---

# Slug System

Every Card has

slug

Example

oi.io/card/sherif

Unique.

Editable.

---

# Storage

Supabase Storage

avatars/

covers/

gallery/

themes/

exports/

---

# Autosave

Every change

↓

Debounce

↓

API

↓

Database

↓

Success

No Save button required.

Manual save optional.

---

# Security

Access Code

↓

Validation

↓

Card Owner

↓

Editor

Public Card

Never exposes

Access Code

Never exposes

Private Data

---

# Performance

Server Components by default

Client Components only when needed

Lazy Loading

Dynamic Imports

Image Optimization

Caching

---

# Future Modules

Organizations

Teams

Employees

Marketplace

Theme Store

Template Store

White Label

API

Developer Portal

Wallet Passes

AI Builder

AI Theme Generator

CRM Integration

---

# Core Principles

✔ Card First

✔ Feature Based Architecture

✔ Single Rendering Engine

✔ Theme Isolation

✔ Service Layer

✔ Modular Design

✔ Mobile First

✔ Scalable

✔ Easy Maintenance

✔ Easy AI Development

---

# Development Order

1.

Database

↓

2.

Services

↓

3.

API

↓

4.

Access Code

↓

5.

Card Editor

↓

6.

Card Renderer

↓

7.

Public Card

↓

8.

Analytics

↓

9.

Subscriptions

↓

10.

Admin Dashboard

↓

11.

Production

## Sprint 1 Foundation Implementation (2026-07-20)

The backend foundation implements the canonical Service to Repository/DAL to Prisma boundary. Services own transaction boundaries and return DTOs. Repositories use explicit selects and do not expose generated Prisma model types. The Prisma client uses the PostgreSQL driver adapter; the Node/Next runtime uses a development-safe singleton, while Cloudflare Worker entry points must call the exported factory per request with the Hyperdrive connection string.

No editor, API, authentication, analytics ingestion, upload, subscription UI, or admin UI capability is introduced by this sprint.

## Sprint 1 Boundary Remediation (2026-07-20)

Sprint 1 now enforces service-to-port-to-repository boundaries. Repository contracts use application commands and DTOs only. Read repositories are separate from transaction-only write repositories. Services own policy and transaction orchestration through UnitOfWork, while Prisma clients, generated types, queries, and explicit DTO mapping remain in the DAL. Legacy compatibility consumers use the same service/repository boundary.

The automated architecture gate is npm run architecture:check and is included in npm run verify:foundation. FOUNDATION_REVIEW_V2.md records the passing review.

## Sprint 2 Application Use Cases (2026-07-20)

The application layer is implemented in src/use-cases. Each use case accepts Zod-validated input, depends on repository ports, returns DTOs, and uses UnitOfWork for writes. Credential generation and hashing use Web Crypto. Access-code verification and editor-session creation append AccessCodeUsage records through the AccessCode repository. No UI, API, route, middleware, or analytics capability is part of this sprint.

The automated Sprint 2 gate is npm run verify:sprint2. Detailed evidence and risks are recorded in SPRINT_2_REVIEW.md.

## Sprint 3 Transport Layer (2026-07-20)

HTTP handlers depend on composed application use cases and shared transport adapters only. Zod request validation, JSON envelopes, domain-error mapping, request IDs, structured logging, and caching headers are centralized under src/transport/http. Architecture enforcement prevents route handlers from importing repositories, Prisma, database infrastructure, or application implementations directly.

## Sprint 8 Product Boundary (2026-07-20)

Routes are partitioned by actor: `/admin/*` is guarded by the existing administrator session, `/workspace` uses card-scoped EditorSession credentials for writes, and `/{username}` is visitor-only. Admin initial issuance calls the existing `GenerateInitialAccessCode` through an authenticated server action. No Admin page imports Prisma/repositories or mints a customer session. Full operator collection views and support editing require future approved application ports; legacy data and authorization bypasses are prohibited.

## Sprint 9 Business Flow Boundary (2026-07-20)

The visible product flow is Visitor → Landing → Create Card → Order → Admin Approval → Issue Card → Access Code → Workspace → Public Card. Sprint 9 adds only presentation and orchestration: customer access composes existing CreateEditorSession and CardService lookup, then stores the existing card-scoped session format. No Order aggregate exists, so purchase intake and Admin Orders remain explicit non-persisting foundations rather than direct database or legacy implementations.

## Sprint 10: Order and Fulfillment Boundary

Order is the canonical commercial entry point. Public intake invokes `CreateOrder`; it cannot invoke customer or card provisioning. Authenticated approval invokes `ApproveOrder`, which owns one Unit of Work and composes transaction-scoped `CreateCustomer`, `CreateCard`, and `GenerateInitialAccessCode` operations. Repositories remain persistence-only and Prisma remains confined to repository implementations. Presentation uses server actions; every administrative mutation re-verifies the NextAuth admin session.

New cards created by the operational workflow carry `Card.orderId`. The nullable database field preserves legacy cards while making provenance mandatory in the approval command. Direct `POST /cards` creation is retired with a conflict response, preventing transport-level bypass.

## Activation Read Boundary Hotfix (2026-07-20)

Workspace reads resolve the card-scoped EditorSession and load the editor Card by ID. They do not use the public slug query, because Draft/Private Order Cards must be editable before publication. The returned renderer contract remains PublicCardDTO, while the public `/{username}` read retains its Published/Public visibility rules.

## Sprint 11 Admin Read Platform (2026-07-20)

Admin Server Components consume `AdminReadService`, which validates query input and delegates to the read-only `AdminReadRepository`. Only the Prisma repository performs database reads. Admin-specific projections are separate read models and do not alter shared DTO contracts. Write use cases and Unit of Work remain isolated.

## Notification Platform (Sprint 12)

Transactional communication follows one boundary: application coordinator → `NotificationService` → channel provider. Order approval commits customer, card, and access-code creation before notification begins. The coordinator passes the ephemeral plaintext access code directly to the welcome template; it is never persisted in notification storage.

`NotificationService` creates an idempotent delivery record, atomically claims its first attempt, renders the message, and delegates delivery to `EmailProvider`. `ResendEmailProvider` is the only implemented channel adapter. Provider errors are converted into persisted `FAILED` deliveries and structured logs; they do not change the successful order result.

Delivery identity is deterministic per card, channel, and template. Database uniqueness plus the provider idempotency key prevents a repeated approval invocation from sending a duplicate welcome email. SMS, WhatsApp, and Push are modeled channel capabilities but have no adapters or triggers.

## Sprint 13 Additive Card Aggregate Extension

The existing `cards` transaction repository port gained optional source-compatible capabilities for slug checks, metadata, CardSection replacement, and button/social CRUD and reordering. New application use cases enforce EditorSession ownership and own all mutation transactions. Routes compose those use cases and never access persistence. The authorized Workspace read model adds optional full editor collections while PublicCardDTO continues exposing visible collections only. `CardRenderer` is the single renderer for both Workspace Preview and the public profile; it does not fetch or contain persistence logic.

## Sprint 14 Block Rendering Pipeline

Repository reads map raw persisted block configuration into EditorCardDTO. Application mappers validate each configuration and expose typed CardBlockDTO values. If no persisted blocks exist, legacy CardSection order and visibility map automatically to Hero, About, Contact, CTA Buttons, and Social Links blocks. The shared renderer adapter maps those enabled blocks to the canonical renderer's section order. Application use cases own materialization, CRUD, duplication, reorder, media ownership validation, authorization, and transactions.


## Sprint 15 additive subscription architecture

Orders may select an active Plan and billing interval. Approval creates the Customer Subscription inside the existing UnitOfWork before card issuance. PlanFeature stores extensible relational entitlements. Admin mutations are authorized by application-layer RBAC and recorded in AuditLog.

## Sprint 17 Shared Workspace Architecture

`/workspace` is the only visual editor route and renders the single `AppearanceEditor`, `BlockEditor`, preview, share panel, and save adapter for both actors. Customer entry uses the existing card-scoped EditorSession. Administrator entry uses `/workspace?adminCardId=<uuid>`; the server resolves the NextAuth identity and `CARD_SUPPORT_EDIT` permission before supplying the editor read model. It never creates or impersonates an EditorSession.

All editor mutation use cases accept an optional server-derived administrator authorization context. The mutation transaction, repository commands, DTO mapping, and renderer remain shared. Customer requests still hash and validate their EditorSession token. Administrator requests are authorized by application-layer RBAC and append `ADMIN_WORKSPACE_EDIT` audit records. Request bodies cannot assert administrator identity.

The former `/admin/cards/[cardId]/workspace` page and its profile-only Server Action were removed. Admin card management now links to the canonical Workspace. The only actor-specific UI is the permanent Admin Mode banner.

## Shared Publication Boundary

Publication is a dedicated application use case and UnitOfWork transaction, separate from profile, appearance, metadata, and block saves. It reuses the shared EditorSession/Admin authorization strategy and Card repository update port. No UI or transport path writes Prisma directly. The public reader independently enforces Published plus Public on every request.

## Short NFC Activation Boundary

The canonical physical-card address is `/a/{activationToken}`. Each physical NFC card stores one immutable, cryptographically generated, uppercase alphanumeric token of 8–10 characters. That token is both the permanent public routing key and the support identifier; there is no second public identifier, activation code, JWT, UUID, batch identifier, or mutable profile slug written to the chip. Activated token routes resolve the linked Workspace and render its public profile directly without an HTTP redirect.

`NfcCard` owns only its internal UUID, unique activation token, lifecycle status, optional Customer and Workspace assignments, activation timestamp, and creation timestamp. An Available or Reserved token opens the customer activation experience. Activation creates a Customer and CustomerAccount only for a new registration, reuses an existing Customer and Workspace after login, creates a Workspace only when the customer does not already own one, and atomically links the physical card. An Activated token redirects to `/{username}` through the linked Workspace primary card. Disabled, Lost, and Archived cards do not expose a profile.

The Admin Activation Center consumes `NfcCardService` through the repository port. Server Components perform inventory reads while authenticated Server Actions own token generation and lifecycle mutations. Digital customers remain a separate order-driven flow: approval activates their existing account and their Workspace/public profile does not require an NFC token. All externally shareable URLs are built by `src/lib/public-links.ts` from the once-normalized `NEXT_PUBLIC_APP_URL` value.
