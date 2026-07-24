# FLOW_AUDIT.md

## Overview
This document audits the complete "Card Creation" workflow, tracing execution from the moment a user clicks "Save Card" on the frontend through to the rendering of the public digital business card URL.

---

## 1. Frontend component responsible for Save
- **File**: `src/components/FormPanel.tsx`
- **Function / Details**: Contains the UI button `<button onClick={() => handleSave(false)}>Save Card</button>`. 
- **Status**: Working / New (recently refactored into a reusable component).

## 2. Function called on click
- **File**: `src/app/page.tsx`
- **Function / Details**: `handleSave(asNew: boolean)`. It gathers `formData`, sets the loading state (`saveStatus`), and fires a `POST` request to `/api/cards` using `fetch`.
- **Status**: Working / Modified (Google Sign-In interruption recently removed).

## 3. API endpoint
- **File**: `src/app/api/cards/route.js`
- **Function / Details**: `export async function POST(req)`. Handles receiving the payload, extracting the session, triggering Zod validation, and routing to the service layer.
- **Status**: Working / Legacy JS (API surface is functional, but file remains `.js` while other parts are migrating to strict TypeScript).

## 4. Validation
- **File**: `src/lib/validation/business-card.ts`
- **Function / Details**: `businessCardCreateSchema.safeParse(body)` or `businessCardUpdateSchema.safeParse(body)`. Validates string lengths, valid URLs, and constructs strict types.
- **Status**: Working / New (Zod validation layer).

## 5. Authentication
- **File**: `src/app/api/cards/route.js` (using `src/lib/auth.js`)
- **Function / Details**: `await getServerSession(authOptions)`. Blocks the request and returns a `401 Unauthorized` if no session is active.
- **Status**: Working / Legacy JS.

## 6. Service layer
- **File**: `src/lib/services/business-card.service.ts`
- **Function / Details**: `createCard(data, userId)` or `updateCard(id, data, userId)`. Cleans the data to strictly match the Prisma schema, handles the `socialLinks` legacy JSON object parsing/stringifying, and generates the URL Hash and Slug natively.
- **Status**: Working / New.

## 7. Prisma call
- **File**: `src/lib/services/business-card.service.ts`
- **Function / Details**: `prisma.businessCard.create({ data: { ... } })`
- **Status**: Working / New.

## 8. Database tables
- **File**: `prisma/schema.prisma`
- **Function / Details**: Inserts or updates a row in the `BusinessCard` model. Note: The `socialLinks` are stored directly in this table as a `String` (JSON object) and the newly created `SocialLink` table is not yet actively utilized in this workflow.
- **Status**: Working / Needs Fix (Migration to the dedicated `SocialLink` model was prepared in the API but is not yet fully utilized in the save flow).

## 9. urlHash generation
- **File**: `src/lib/hash.ts` (and `src/lib/slug.ts` for secondary vanity URLs)
- **Function / Details**: `generateUniqueHash()`. Uses a `Math.random().toString(36).substring(2, 10)` loop against the database to guarantee uniqueness.
- **Status**: Working / New.

## 10. Public URL generation
- **File**: `src/app/page.tsx` & `src/components/SharePanel.tsx`
- **Function / Details**: Evaluated dynamically on the client via ``const cardUrl = window.location.origin + `/card/${urlHash}` ``. The `SharePanel` displays the URL and generates the QR code via an external API (`api.qrserver.com`).
- **Status**: Working / New (Refactored UI).

## 11. Public page rendering
- **File**: `src/app/card/[hash]/page.js` & `src/app/card/[hash]/CardVisitorView.jsx`
- **Function / Details**: The server component (`page.js`) fetches the card via Prisma using the `hash` param. It passes the data to the client component (`CardVisitorView.jsx`). `CardVisitorView.jsx` uses the `ThemeRegistry` to determine whether to render natively in React (`CardRenderer`) or fallback to injecting the legacy `generateCardDocument()` HTML string into an `iframe`.
- **Status**: Working / Hybrid (Coexistence strategy currently active).

---

## Summary Table

| Step | Status | File | Needs Fix |
| :--- | :--- | :--- | :--- |
| 1. Frontend Button | ✅ Working | `src/components/FormPanel.tsx` | No |
| 2. OnClick Function | ✅ Working | `src/app/page.tsx` | No |
| 3. API Endpoint | ⚠️ Legacy | `src/app/api/cards/route.js` | Convert to TypeScript (`.ts`) |
| 4. Validation | ✅ Working | `src/lib/validation/business-card.ts` | No |
| 5. Authentication | ⚠️ Legacy | `src/lib/auth.js` | Convert to TypeScript (`.ts`) |
| 6. Service Layer | ✅ Working | `src/lib/services/business-card.service.ts`| Utilize dedicated `SocialLink` table |
| 7. Prisma Call | ✅ Working | `src/lib/services/business-card.service.ts`| No |
| 8. DB Tables | ⚠️ Legacy Data Flow | `prisma/schema.prisma` | Finalize transition from `businessCard.socialLinks` JSON field to actual `SocialLink` relational table. |
| 9. urlHash Generation | ✅ Working | `src/lib/hash.ts` | No |
| 10. Public URL Render | ✅ Working | `src/components/SharePanel.tsx` | No |
| 11. Public Page View | ✅ Working (Hybrid)| `src/app/card/[hash]/CardVisitorView.jsx`| Fully migrate all themes to React, remove `iframe` and `templates.js` |
