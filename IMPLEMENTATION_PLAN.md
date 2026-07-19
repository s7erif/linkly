# IMPLEMENTATION_PLAN.md

## Overview
This document outlines the granular, step-by-step implementation plan for refactoring the OI Cards project into a clean NFC Digital Business Card platform. Each task is designed to be completed in 15–30 minutes, isolated, testable, and tied to a single commit.

---

## Phase 2: Database Refactor

### Task 2.4: Normalize Social Links
- **Task ID**: `DB-01`
- **Goal**: Create a normalized `SocialLink` model and migrate any existing JSON social links.
- **Files allowed to modify**: `prisma/schema.prisma`
- **Files that must not be modified**: API routes, React components
- **Acceptance criteria**: `SocialLink` model exists with relation to `BusinessCard`. Migration file is generated.
- **Risks**: Data loss during migration if JSON parsing fails.
- **Suggested commit message**: `Phase2: Normalize social links in Prisma schema`

### Task 2.5: Create Analytics Model
- **Task ID**: `DB-02`
- **Goal**: Create an `Analytics` model to track page views, QR scans, and link clicks.
- **Files allowed to modify**: `prisma/schema.prisma`
- **Files that must not be modified**: API routes, React components
- **Acceptance criteria**: `Analytics` model exists with relation to `BusinessCard`. Migration generated.
- **Risks**: None. Non-destructive addition.
- **Suggested commit message**: `Phase2: Add Analytics model to Prisma schema`

---

## Phase 3: Dashboard Refactor

### Task 3.1: Create UI Foundation (Atoms)
- **Task ID**: `DASH-01`
- **Goal**: Build base reusable UI components (Button, Input, Card).
- **Files allowed to modify**: `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Card.tsx`
- **Files that must not be modified**: `src/app/page.js`, `src/app/gallery/page.js`
- **Acceptance criteria**: Components exist, use Tailwind, and accept standard React props.
- **Risks**: None. Isolated new files.
- **Suggested commit message**: `Phase3: Add base UI atom components`

### Task 3.2: Create Dashboard Layout
- **Task ID**: `DASH-02`
- **Goal**: Build Dashboard Sidebar and Header for navigation.
- **Files allowed to modify**: `src/components/DashboardLayout.tsx`, `src/components/Sidebar.tsx`
- **Files that must not be modified**: `src/app/page.js`
- **Acceptance criteria**: Responsive layout component exists that wraps dashboard pages.
- **Risks**: Layout breaking on mobile views.
- **Suggested commit message**: `Phase3: Add dashboard layout components`

### Task 3.3: Overview Page Structure
- **Task ID**: `DASH-03`
- **Goal**: Create the Overview dashboard page with statistics cards.
- **Files allowed to modify**: `src/app/dashboard/page.js` (new)
- **Files that must not be modified**: `src/app/page.js` (legacy)
- **Acceptance criteria**: Page renders dummy stats placeholders using the new `DashboardLayout`.
- **Risks**: None.
- **Suggested commit message**: `Phase3: Create overview dashboard page`

### Task 3.4: Extract Customer List
- **Task ID**: `DASH-04`
- **Goal**: Migrate the gallery view into a reusable `CustomerTable` component.
- **Files allowed to modify**: `src/components/CustomerTable.tsx`, `src/app/dashboard/customers/page.js`
- **Files that must not be modified**: `src/app/gallery/page.js` (keep until deprecation)
- **Acceptance criteria**: Customers are rendered in a table/grid format fetching from `/api/cards`.
- **Risks**: Missing data fields during mapping.
- **Suggested commit message**: `Phase3: Create customer list view`

### Task 3.5: Extract Customer Form (Identity)
- **Task ID**: `DASH-05`
- **Goal**: Build the Basic Information component for customer creation.
- **Files allowed to modify**: `src/components/forms/IdentityForm.tsx`
- **Files that must not be modified**: Legacy `page.js`
- **Acceptance criteria**: Reusable form component capturing name, title, company, bio.
- **Risks**: None.
- **Suggested commit message**: `Phase3: Add customer identity form`

### Task 3.6: Extract Customer Form (Contact & Social)
- **Task ID**: `DASH-06`
- **Goal**: Build the Contact Information and Social Links form components.
- **Files allowed to modify**: `src/components/forms/ContactForm.tsx`, `src/components/forms/SocialForm.tsx`
- **Files that must not be modified**: Legacy `page.js`
- **Acceptance criteria**: Forms capture address, phone, email, and social arrays.
- **Risks**: Array state management for social links can be tricky.
- **Suggested commit message**: `Phase3: Add contact and social form components`

### Task 3.7: Implement Customer Editor Page
- **Task ID**: `DASH-07`
- **Goal**: Assemble the forms into the final Create/Edit Customer page.
- **Files allowed to modify**: `src/app/dashboard/customers/[id]/page.js`
- **Files that must not be modified**: Legacy `page.js`
- **Acceptance criteria**: Editor allows full CRUD of a customer using modular components.
- **Risks**: Form state lifting complexity.
- **Suggested commit message**: `Phase3: Assemble customer editor page`

### Task 3.8: Refactor Image Upload
- **Task ID**: `DASH-08`
- **Goal**: Update the upload endpoint to handle file saving securely (e.g., local storage or simple cloud bucket setup) rather than Base64 stringification.
- **Files allowed to modify**: `src/app/api/upload/route.js`
- **Files that must not be modified**: Form components
- **Acceptance criteria**: Endpoint returns a URL to a stored asset.
- **Risks**: File system permissions issues if storing locally.
- **Suggested commit message**: `Phase3: Refactor upload API to prevent base64 bloat`

---

## Phase 4: Customer Card & Public View

### Task 4.1: Public Card Base Layout
- **Task ID**: `CARD-01`
- **Goal**: Build the universal React layout for public cards.
- **Files allowed to modify**: `src/app/c/[slug]/layout.tsx` (new)
- **Files that must not be modified**: `src/app/card/[hash]/page.js` (legacy)
- **Acceptance criteria**: Clean layout wrapper that will house dynamic themes.
- **Risks**: None.
- **Suggested commit message**: `Phase4: Add base public card layout`

### Task 4.2: Public Card Shared UI Components
- **Task ID**: `CARD-02`
- **Goal**: Extract `ContactButtons`, `SocialLinks`, and `QR` rendering out of HTML templates into React components.
- **Files allowed to modify**: `src/components/public/ContactButtons.tsx`, `src/components/public/SocialLinks.tsx`
- **Files that must not be modified**: `src/lib/templates.js`
- **Acceptance criteria**: Components render correctly given a standard `ThemeProps` interface.
- **Risks**: Broken SVG paths or styling mismatches from legacy templates.
- **Suggested commit message**: `Phase4: Extract public card shared UI components`

### Task 4.3: Implement vCard Export API
- **Task ID**: `CARD-03`
- **Goal**: Create an API route to dynamically generate `.vcf` files for "Save Contact".
- **Files allowed to modify**: `src/app/api/vcard/[slug]/route.js`
- **Files that must not be modified**: Database schema
- **Acceptance criteria**: Visiting the route downloads a valid `.vcf` file containing user data.
- **Risks**: Improper vCard formatting causing failed imports on iOS/Android.
- **Suggested commit message**: `Phase4: Implement dynamic vCard generation API`

### Task 4.4: Slug Routing Implementation
- **Task ID**: `CARD-04`
- **Goal**: Enable resolving cards via `/c/[slug]` instead of `[hash]`.
- **Files allowed to modify**: `src/app/c/[slug]/page.js` (new)
- **Files that must not be modified**: Legacy `[hash]` routes
- **Acceptance criteria**: Route fetches card by slug, rendering a placeholder or the new layout.
- **Risks**: Slug collisions or unhandled 404s.
- **Suggested commit message**: `Phase4: Enable slug-based public routing`

---

## Phase 5: Themes

### Task 5.1: Theme Provider & Interface
- **Task ID**: `THEME-01`
- **Goal**: Define the React `ThemeProps` interface and Theme Switcher logic.
- **Files allowed to modify**: `src/components/themes/ThemeRenderer.tsx`
- **Files that must not be modified**: `src/lib/templates.js`
- **Acceptance criteria**: Renderer accepts a `templateId` and card data, resolving to a specific theme component.
- **Risks**: None.
- **Suggested commit message**: `Phase5: Add theme renderer and interface`

### Task 5.2: Rebuild Classic Theme
- **Task ID**: `THEME-02`
- **Goal**: Convert the classic HTML template into a React component.
- **Files allowed to modify**: `src/components/themes/ClassicTheme.tsx`
- **Files that must not be modified**: `src/lib/templates.js`
- **Acceptance criteria**: Renders identical to the HTML version but entirely in React.
- **Risks**: Minor spacing/styling regressions.
- **Suggested commit message**: `Phase5: Implement Classic Theme in React`

### Task 5.3: Rebuild Neumorphism Theme
- **Task ID**: `THEME-03`
- **Goal**: Convert the neumorphism HTML template into a React component.
- **Files allowed to modify**: `src/components/themes/NeumorphismTheme.tsx`
- **Files that must not be modified**: `src/lib/templates.js`
- **Acceptance criteria**: Renders correctly with shadow effects intact.
- **Risks**: Complex CSS shadow migration.
- **Suggested commit message**: `Phase5: Implement Neumorphism Theme in React`

### Task 5.4: Deprecate HTML Templates
- **Task ID**: `THEME-04`
- **Goal**: Remove `src/lib/templates.js` and switch the main app to the React-based `ThemeRenderer`.
- **Files allowed to modify**: `src/app/c/[slug]/page.js`, `src/lib/templates.js` (delete)
- **Files that must not be modified**: Theme implementations
- **Acceptance criteria**: `templates.js` is deleted, and the app builds successfully.
- **Risks**: Breaking existing live preview if not properly wired up.
- **Suggested commit message**: `Phase5: Deprecate legacy HTML template engine`

---

## Phase 6: Analytics

### Task 6.1: Record Views API
- **Task ID**: `ANLY-01`
- **Goal**: Create API to increment `pageViews`.
- **Files allowed to modify**: `src/app/api/public/[slug]/view/route.js`
- **Files that must not be modified**: Database schema
- **Acceptance criteria**: POST request successfully increments page view count.
- **Risks**: High traffic could cause race conditions if not atomically incremented (`increment: 1`).
- **Suggested commit message**: `Phase6: Add analytics view recording API`

### Task 6.2: Record Link Clicks & QR API
- **Task ID**: `ANLY-02`
- **Goal**: Create APIs to increment `linkClicks` and `qrScans`.
- **Files allowed to modify**: `src/app/api/public/[slug]/click/route.js`, `src/app/api/public/[slug]/qr/route.js`
- **Files that must not be modified**: Database schema
- **Acceptance criteria**: POST requests successfully increment respective counters.
- **Risks**: None.
- **Suggested commit message**: `Phase6: Add click and QR scan tracking APIs`

### Task 6.3: Dashboard Analytics View
- **Task ID**: `ANLY-03`
- **Goal**: Feed analytics data into the Overview Dashboard.
- **Files allowed to modify**: `src/app/api/analytics/route.js`, `src/app/dashboard/page.js`
- **Files that must not be modified**: Public APIs
- **Acceptance criteria**: Dashboard displays real views, clicks, and scan statistics.
- **Risks**: Heavy queries slowing down dashboard load (need indexing).
- **Suggested commit message**: `Phase6: Integrate analytics into dashboard overview`

---

## Phase 7: Branding

### Task 7.1: Setup Company Settings
- **Task ID**: `BRND-01`
- **Goal**: Add database support for global Company Settings (name, logo, footer text).
- **Files allowed to modify**: `prisma/schema.prisma`
- **Files that must not be modified**: React components
- **Acceptance criteria**: Settings model added and migrated.
- **Risks**: None.
- **Suggested commit message**: `Phase7: Add CompanySettings model`

### Task 7.2: Apply Branding to Public Cards
- **Task ID**: `BRND-02`
- **Goal**: Update the `Footer` of public cards to read from Company Settings.
- **Files allowed to modify**: `src/components/public/PublicFooter.tsx`
- **Files that must not be modified**: Admin dashboards
- **Acceptance criteria**: Public cards display the dynamic "Powered By" text and logo.
- **Risks**: None.
- **Suggested commit message**: `Phase7: Apply dynamic branding to public cards`

---

## Cleanup & Finalization

### Task 8.1: Remove Legacy Pages
- **Task ID**: `CLN-01`
- **Goal**: Delete `src/app/page.js` (editor), `src/app/gallery`, and `src/app/card/[hash]`.
- **Files allowed to modify**: Legacy root files
- **Files that must not be modified**: New `app/dashboard` and `app/c` files
- **Acceptance criteria**: Old monolithic code is removed and the project cleanly boots into the new dashboard architecture.
- **Risks**: Routing loops if redirects aren't configured.
- **Suggested commit message**: `Phase8: Remove legacy monolithic pages`
