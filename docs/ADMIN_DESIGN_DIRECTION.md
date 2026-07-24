# OI Platform — Executive Tech Design Direction

Status: Phase 0 — design direction only  
Scope: Admin Platform experience  
Implementation: intentionally none in this phase

## 1. Product position

OI Platform is an operating product for issuing and maintaining premium digital NFC cards. The Admin Platform is not a database browser. It is the control room for four moments in the business:

1. acquire and qualify an order;
2. activate a customer and card;
3. maintain the customer relationship and billing;
4. publish and operate the public experience.

The interface should make those moments feel direct, reliable, and quiet. The product earns trust through clarity, not ornament.

## 2. Design language: Executive Tech

Executive Tech combines Stripe’s financial confidence, Linear’s focus, Vercel’s restraint, Clerk’s product clarity, and Notion’s flexible content handling. It is a distinct OI identity:

- deep navy foundation rather than pure black;
- warm, near-white text with quiet neutral surfaces;
- one OI accent used for focus and primary action;
- semantic green, amber, and red only for state;
- restrained radii and almost invisible dividers;
- typography that prioritizes scanability over spectacle;
- fast, short, functional motion.

No gradients as decoration, glassmorphism, neon, rainbow status colors, oversized hero copy, ornamental charts, or template-like card stacks.

## 3. Audit of the existing UI

### What should stay

- The existing server-side data boundaries and route map.
- Admin authentication, authorization, and action behavior.
- The distinction between Admin Platform, Customer Workspace, and Public Card.
- Existing domain terminology: orders, cards, customers, subscriptions, media, website.
- Proven empty, loading, error, confirmation, and status behaviors where they are semantically correct.
- The ability to deep-link directly to a record.

### What should be removed from the experience

- Database-model navigation as the primary mental model.
- A permanent list of every low-frequency module in the sidebar.
- Repeated generic page headers and the “title + description + card grid” rhythm.
- Card-inside-card compositions, decorative KPI tiles, placeholder charts, and empty containers.
- Giant vertical forms and pages that expose every field at once.
- Filters that are always open, duplicate actions, and operational detail with no next step.
- Visual labels such as “operations console” when the screen itself should communicate the job.

### What should be redesigned

- Navigation, around operator workflows.
- Overview, as an actionable work queue rather than a metrics gallery.
- Orders, as a queue and review workspace.
- Customers and cards, as searchable relationship records with contextual side panels.
- Media, as a visual asset browser with folders, search, selection, and usage context.
- Website, as a CMS editing environment with draft/publish focus.
- Plans and subscriptions, as billing configuration and lifecycle tools.
- Settings, as grouped product configuration with progressive disclosure.
- Tables, forms, detail pages, dialogs, empty states, and mobile behavior as one coherent system.

## 4. Information architecture

The top-level navigation contains six operator jobs, not entities:

- **Command center** — what needs attention now.
- **Commerce** — acquire, qualify, and activate customers.
- **Billing** — verify money, configure plans, and manage lifecycle.
- **Content** — publish the public website and manage its assets.
- **Operations** — measure health and resolve platform work.
- **Settings** — configure the platform and its integrations.

Secondary destinations live inside the relevant job. For example, Customers, Cards, and Orders belong to Commerce; Media belongs to Content; Access Codes and Invoices belong to Billing. They should be reached through contextual navigation, search, breadcrumbs, and related-record links—not a 20-item permanent menu.

## 5. Workflow philosophy

Every screen has one job, one primary action, and one visible next step. The operator should know where they are, what changed, and what to do next without reading documentation.

### Command center

Answer: “What requires a decision today?” Show prioritized queues, not a dashboard of everything. Pending orders, payment reviews, expiring subscriptions, and failed operations are actionable rows with owners, timestamps, and direct actions.

### Commerce / Orders

Answer: “Which orders can I process next?” Use a queue with saved views, keyboard navigation, bulk selection, and a right-side review panel. Approval, rejection, issuance, and customer creation belong to the order context.

### Commerce / Customers and Cards

Answer: “What is the state of this relationship?” Use a searchable index and a record workspace. Profile, cards, orders, billing, access, and activity are tabs or contextual panels—not separate disconnected CRUD pages.

### Billing

Answer: “Is money verified and is the customer active?” Payment review is a focused split view: proof and payment facts on the left, decision and timeline on the right. Plans use pricing configuration with a clear preview. Subscription lifecycle actions are progressive and confirmation-based.

### Content / Website

Answer: “What public content is ready to publish?” Use a CMS shell with section navigation, inline editing, preview, draft state, review summary, and a single publish action. Never expose JSON or a generic form for structured content.

### Content / Media

Answer: “Can I find, understand, and safely reuse this asset?” Use a visual library with search, folders, filters, grid/list modes, usage inspection, and a preview drawer. Upload is a persistent action; metadata is edited in context.

### Operations

Answer: “Is the platform healthy?” Analytics should privilege trends and decisions. Notifications, retries, and audit records should use triage queues with filters and explicit resolution paths.

### Settings

Answer: “What platform behavior am I configuring?” Group settings by outcome—General, Security, Messaging, Storage, Integrations—and progressively disclose advanced controls.

## 6. Layout direction

Use a stable application frame with a compact rail, contextual secondary navigation only when needed, a command/search surface, and a constrained reading column. Detail work should open in a drawer or split pane where possible so the operator keeps list context. Full-page routes are reserved for complex editing and review flows.

Avoid uniform grids. Let the content determine the layout: queues are dense, media is visual, CMS is structured, settings are calm and sectional.

## 7. Design-system philosophy

Components should be quiet primitives rather than branded containers:

- text and icon buttons with one clear primary style;
- fields with strong labels, useful defaults, and inline validation;
- tables with row hierarchy, keyboard focus, selection, and contextual actions;
- drawers and dialogs for decisions, not for hiding unfinished architecture;
- status badges only where state changes a decision;
- skeletons that match the eventual geometry;
- empty states with explanation and a single useful next action.

Spacing is generous around decisions and compact inside data rows. Borders separate regions only when proximity is insufficient. Surfaces are used to establish hierarchy, never to decorate every block.

## 8. Color and typography

Dark mode is the primary product mode: deep navy background, two restrained elevated surfaces, warm text, muted secondary text, and one OI accent. Semantic colors are reserved for success, attention, danger, and information. Contrast must meet accessibility requirements in every state.

Typography uses a modern grotesk/system stack with a clear scale: page title, section title, body, metadata. Titles are confident but never oversized. Numeric values are tabular and easy to scan. Captions are short and never carry essential meaning alone.

## 9. Interaction and accessibility

- Command palette is the universal escape hatch for navigation and actions.
- Keyboard shortcuts are discoverable and never the only way to operate.
- Lists support arrow-key movement, selection, and bulk actions.
- Drawers preserve context and have predictable focus management.
- Destructive actions require confirmation with consequences stated plainly.
- Loading, error, empty, disabled, and success states are designed—not incidental text.
- Motion is 120–220ms, purposeful, and disabled or reduced for users who request it.
- Mobile turns side panels into bottom sheets and preserves the same task sequence.

## 10. Screen quality bar

Before any future implementation is approved, the screen must answer:

- What is the single job of this screen?
- What is the primary action?
- What needs attention first?
- Can the operator complete the task without leaving context?
- What happens when there is no data, an error, or a slow request?
- Is the same job clear on tablet and mobile?
- Does the screen feel like a product workflow rather than a model editor?

This document is the source of truth for future Admin Platform redesign phases. No implementation is included in Phase 0.

## Phase 1 foundation

The isolated foundation lives under `src/design-system/` and defines semantic tokens plus reusable Executive Tech primitives. It is intentionally not imported into application pages during this phase.
