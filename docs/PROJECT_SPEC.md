# OI Platform

Version: 1.0
Status: Planning

---

# Overview

OI Platform هي منصة لإدارة Digital Business Cards.

المنصة بتسمح للمستخدم إنه ينشئ ويعدل ويشارك بطاقته الرقمية سواء كان عنده NFC Card أو مجرد مشترك في الخدمة.

---

# Goals

- Simple User Experience
- No Login / No Password
- Fast Card Editing
- Powerful Admin Dashboard
- Easy Theme System
- Scalable Architecture
- Subscription Ready

---

# User Types

## 1. NFC Customer

- Buys NFC Card
- Receives Access Code
- Opens Manage Page
- Edits Card
- Shares Public Link

---

## 2. Digital Customer

- Subscribes Online
- Receives Access Code
- Creates Digital Card
- Shares Public Link

---

## 3. Admin

- Manage Customers
- Manage Cards
- Manage Access Codes
- Manage Plans
- Manage Themes
- View Analytics
- Manage Settings

---

# User Flow

Customer

Receive Access Code

↓

oi.io/manage

↓

Enter Access Code

↓

Card Editor

↓

Save

↓

Public Card

↓

Share Card

---

# Public Pages

/

Landing Page

/manage

Enter Access Code

/card/[slug]

Public Card

/pricing

Pricing

/contact

Contact

/privacy

Privacy Policy

/terms

Terms & Conditions

---

# Card Editor

Sections

- Profile
- Cover
- Avatar
- Bio
- Buttons
- Social Links
- Theme
- Colors
- Preview
- Save

---

# Public Card Features

- Avatar
- Cover
- Name
- Job Title
- Company
- About
- Contact Buttons
- Social Links
- QR Code
- Save Contact
- Share Button

---

# Theme System

Themes must be independent.

Each Theme receives only CardData.

Example Themes

- Default
- Minimal
- Medical
- Luxury
- Corporate
- Cyber

---

# Access Code System

Each card has one unique Access Code.

Example

AAXFVMLMVR

The Access Code is used to:

- Access Card
- Edit Card
- Recover Card (Admin)

No Login.

No Password.

---

# Subscription Plans

Free

Basic

Pro

Business

Enterprise

---

# Analytics

Track

- Visits
- Button Clicks
- Social Clicks
- Save Contact
- QR Scans
- Device
- Country

---

# Admin Dashboard

Dashboard

Customers

Cards

Access Codes

Subscriptions

Themes

Analytics

Settings

Logs

---

# Future Features

- Multiple Cards
- Teams
- Employees
- White Label
- Custom Domains
- NFC Store Integration
- API
- CRM
- Google Reviews
- QR Menu
- Apple Wallet
- Google Wallet

---

# Architecture Rules

- One Card = One Access Code
- CardRenderer renders every card
- Themes are isolated
- Public Page never renders card manually
- Admin controls everything
- Store is separate project

---

# Tech Stack

Frontend

- Next.js
- React
- TailwindCSS

Backend

- Next.js API
- Prisma
- PostgreSQL

Storage

- Supabase Storage

Authentication

- Access Code System

Deployment

- Cloudflare

---

# Roadmap

Phase 1

✔ Product Planning

Phase 2

Database Design

Phase 3

Admin Dashboard

Phase 4

Access Code System

Phase 5

Card Builder

Phase 6

Public Card

Phase 7

Analytics

Phase 8

Subscriptions

Phase 9

Production Launch

## Sprint 8 Product Separation (2026-07-20)

OI Platform now has three explicit products: Admin Platform under `/admin`, Customer Workspace under `/workspace`, and Public Card Experience under `/{username}`. Administrator NextAuth credentials and customer EditorSession credentials remain separate and are never exchanged or impersonated. The legacy Gallery is compatibility-only and no longer serves as the Admin product.

## Sprint 9 Product Experience (2026-07-20)

The public product now begins at a marketing landing page with only Create New Card and Access Your Card actions. `/access` exchanges an issued access code for an EditorSession and routes the customer to `/workspace`. `/create-card` presents purchase intent without claiming persistence or payment. `/admin/orders` represents the operator fulfillment pipeline. Admin entry is intentionally absent from public navigation.

## Customer Communications

Order fulfillment sends a one-time Welcome email after customer, card, and access-code issuance succeeds. The email contains customer-facing URLs, the plaintext access code available during issuance, and getting-started instructions. Order Approved and Card Ready templates are available for later lifecycle triggers, but Sprint 12 activates only Welcome. Delivery failure is visible to administrators and never rolls back fulfillment.

## Sprint 13 Visual Card Builder

The Customer Workspace is the canonical visual editor for profile, contact, social links, action buttons, appearance, SEO, visibility, and persisted section order. Every mutation requires the existing card-scoped EditorSession. The live preview uses the same PublicCardDTO and DefaultTheme as the public experience and refreshes from the authorized read model after successful persistence.

## Sprint 14 Card Blocks

Cards support ordered modular blocks: Hero, About, Contact, Social Links, CTA Buttons, Gallery, Video, FAQ, Location Map, Divider, and Rich Text. Existing profile, appearance, section, button, and social data remains canonical for legacy-compatible blocks. Persisted blocks become the page composition source after the customer initializes or adds block content.

## Sprint 17 Editing Product Boundary

The platform exposes one Workspace product at `/workspace`. Customers enter with an Access Code and use an EditorSession. Administrators enter from Admin Cards with their Admin session and never receive a customer EditorSession. Both actors use the same editor, renderer, preview, and save pipeline; Admin Mode adds only operator context and controls.

## Publication Lifecycle

Cards are edited as Drafts. Saving never publishes. A dedicated publication command transitions Draft to Published, makes visibility Public, and records the publication timestamp. Unpublish returns the card to Draft/Private. Archived cards must be restored to Draft before publishing. The public reader serves only cards that are simultaneously Published and Public.

## Sprint 15 Activation-Driven Customer Provisioning

Activation is the authoritative provisioning boundary for NFC customers. Administrators generate a one-time link for an available physical NFC card in the Activation Center. A customer signs up or signs in through that link; one transaction then consumes the activation, creates the customer identity when needed, creates a Workspace and digital card when needed, assigns the physical card, issues scoped sessions, and records lifecycle events. Admin Customer management remains edit, archive, search, filter, drawer, activity, and export only. Direct Admin customer creation is not permitted.

## Sprint 3.3 manual subscriptions

Subscriptions are manually approved and renewed by Platform Admin. Runtime subscription operations do not use pricing plans, gateways, or feature entitlements. Automatic expiration restricts customer Workspace writes without deleting data or hiding public profiles. See docs/manual-subscription-lifecycle.md.


## Sprint UX-0.6 Customer Onboarding (2026-07-23)

Customer onboarding has three canonical journeys: Website registration to a two-choice Welcome screen, NFC registration/login through the atomic activation transaction directly to the Card Builder, and returning-customer login to a secure Card selector or direct single-Card Builder handoff. The legacy NFC-oriented Workspace empty state and pending-activation navigation are removed.
