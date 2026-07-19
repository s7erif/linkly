# ROADMAP.md

# OI Cards Development Roadmap

Version: 1.0

Status: Active

---

# Current Progress

✅ Phase 1 - Project Cleanup

In Progress

⬜ Phase 2 - Database Refactor

Pending

⬜ Phase 3 - Dashboard Refactor

Pending

⬜ Phase 4 - Customer Management

Pending

⬜ Phase 5 - Public Card

Pending

⬜ Phase 6 - Themes

Pending

⬜ Phase 7 - Analytics

Pending

⬜ Phase 8 - Branding

Pending

⬜ Phase 9 - Testing

Pending

⬜ Phase 10 - Deployment

Pending

---

# Phase 2 — Database Refactor

## Task 2.1

Remove AI fields

Status

Pending

Deliverables

- Remove credits
- Remove htmlContent
- Remove userPrompt
- Remove showAiAssistant

---

## Task 2.2

Add slug

Status

Pending

Deliverables

- slug
- unique constraint
- automatic generation
- duplicate handling

---

## Task 2.3

Add isActive

Status

Pending

Deliverables

- Boolean
- Default true

---

## Task 2.4

Normalize Social Links

Status

Pending

Deliverables

- Create SocialLink model
- Migration
- Relations

---

## Task 2.5

Analytics model

Status

Pending

Deliverables

- pageViews
- qrScans
- linkClicks
- lastVisit

---

# Phase 3 — Dashboard Refactor

## Task 3.1

Dashboard Layout

Status

Pending

Deliverables

- Sidebar
- Header
- Mobile Navigation

---

## Task 3.2

Overview Page

Status

Pending

Deliverables

- Statistics Cards
- Recent Activity
- Charts Placeholder

---

## Task 3.3

Customers List

Status

Pending

Deliverables

- Table
- Search
- Pagination
- Filters

---

## Task 3.4

Create Customer

Status

Pending

Deliverables

- Form
- Validation
- Image Upload

---

## Task 3.5

Edit Customer

Status

Pending

Deliverables

- Update Form
- Validation

---

## Task 3.6

Delete Customer

Status

Pending

Deliverables

- Confirmation Dialog
- Cascade Delete

---

## Task 3.7

Disable Customer

Status

Pending

Deliverables

- Toggle Status

---

# Phase 4 — Customer Card

## Task 4.1

Public Card Layout

Status

Pending

---

## Task 4.2

Contact Buttons

Status

Pending

---

## Task 4.3

Social Links

Status

Pending

---

## Task 4.4

Share Button

Status

Pending

---

## Task 4.5

Save Contact

Status

Pending

Deliverables

- vCard Generation

---

## Task 4.6

QR Download

Status

Pending

---

# Phase 5 — Themes

## Task 5.1

Medical Theme

Pending

---

## Task 5.2

Corporate Theme

Pending

---

## Task 5.3

Business Theme

Pending

---

## Task 5.4

Developer Theme

Pending

---

## Task 5.5

Theme Switcher

Pending

---

# Phase 6 — Analytics

## Task 6.1

Page Views

Pending

---

## Task 6.2

QR Tracking

Pending

---

## Task 6.3

Link Tracking

Pending

---

## Task 6.4

Analytics Dashboard

Pending

---

# Phase 7 — Branding

## Task 7.1

Company Settings

Pending

---

## Task 7.2

Footer Branding

Pending

---

## Task 7.3

Logo Upload

Pending

---

## Task 7.4

Brand Colors

Pending

---

# Phase 8 — Testing

## Task 8.1

API Testing

Pending

---

## Task 8.2

UI Testing

Pending

---

## Task 8.3

Responsive Testing

Pending

---

## Task 8.4

Performance

Pending

Target

Lighthouse > 95

---

# Phase 9 — Deployment

## Task 9.1

Production Build

Pending

---

## Task 9.2

Environment Variables

Pending

---

## Task 9.3

Database Migration

Pending

---

## Task 9.4

Deploy

Pending

---

# Rules

Every task must:

- Modify only related files.
- Update documentation if architecture changes.
- Generate TASK_REPORT.md.
- Pass build successfully.
- Pass TypeScript checks.
- Wait for approval before continuing.

---

# Commit Convention

Each completed task should have its own commit.

Example

Phase2: Remove AI fields

Phase2: Add slug support

Phase3: Dashboard layout

Phase3: Customers CRUD

Phase4: Public card

Phase5: Medical theme

---

# Success Criteria

The roadmap is complete when:

- All tasks are marked Completed.
- Production build succeeds.
- Documentation is up to date.
- No critical bugs remain.
- Platform is ready for deployment.
