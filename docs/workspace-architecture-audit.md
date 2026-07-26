# Tapp Workspace — Complete Architectural Audit

> Generated: 2026-07-25
> Purpose: Foundation document for complete UX redesign
> Status: Read-only audit — no recommendations implemented

---

## PHASE 1 — Workspace Architecture

### Component Tree

```
WorkspacePage (RSC, 94 lines)
│
├── [admin mode] ── AppearanceEditor(initialCard={dto}, adminBanner={...})
│
├── [customer + slug] ── AppearanceEditor(initialCard={dto}, editorToken, editorExpiresAt)
│
└── [customer, no slug] ── WorkspaceCardLauncher (from CustomerOnboarding.tsx)
    ├── 1 card → auto-open via openCustomerCardAction()
    └── N cards → card selection grid → click → openCustomerCardAction()


AppearanceEditor (Client Component, ~1150 lines)
│
├── Hooks (business logic layer)
│   ├── useWorkspaceCard()      — card hydration, preview DTO, sections, profile, appearance
│   ├── useWorkspaceSave()      — dirty tracking, save orchestration, per-section persistence
│   ├── useSlugEditor()         — slug validation, suggestions, generate/copy URL
│   ├── usePublication()        — publish/unpublish/restore state machine
│   ├── useAppearance()         — preset selection, appearance field patching
│   └── useValidation()         — client-side profile validation, inline errors
│
├── Layout (3-column CSS grid)
│   ├── Left Column (26fr) — "controls"
│   │   ├── Editor Header (card name, status badge, publish buttons)
│   │   ├── Generate Link Panel (AnimatePresence, slide-down)
│   │   ├── Published Panel (AnimatePresence)
│   │   ├── Accordion Sidebar (7 grouped panels)
│   │   │   ├── Content group
│   │   │   │   ├── Basic Information (4 fields: fullName, headline, company, bio)
│   │   │   │   ├── Contact Information (5 fields: email, phone, website, address, countryCode)
│   │   │   │   ├── Social Links (CRUD list with drag reorder)
│   │   │   │   ├── Action Buttons (CRUD list with drag reorder)
│   │   │   │   └── Content Blocks (BlockEditor sub-component)
│   │   │   ├── Design group
│   │   │   │   └── Appearance (7 presets + colors + typography + radius + shadow + background)
│   │   │   └── Settings group
│   │   │       └── SEO & Visibility (SEO title/desc + slug + card visibility + section order)
│   │   └── Sticky Save Bar (status indicator + Save button)
│   │
│   ├── Center Column (56fr) — "canvas"
│   │   └── PreviewPanel
│   │       ├── Device toggle (Mobile / Desktop)
│   │       ├── Zoom toggle (100% / Fit)
│   │       └── DefaultTheme (renders card with AppearanceSettings via CSS custom properties)
│   │
│   └── Right Column (18fr) — "share"
│       └── SharePanel
│           ├── Public URL display
│           ├── Copy Link button
│           ├── QR Code generation (qrcode npm package)
│           └── Download QR / Open Profile links


BlockEditor (Client Component, 427 lines)
│
├── Block type selector (dropdown: Hero, About, Contact, Gallery, Video, FAQ, Location Map, Divider, Rich Text, Social Links, Buttons)
├── Per-block accordion editors with ConfigFields
└── Uses: createWorkspaceBlock, updateWorkspaceBlock, deleteWorkspaceBlock, duplicateWorkspaceBlock, reorderWorkspaceBlocks, initializeWorkspaceBlocks


WorkspaceCardLauncher (Client Component, 128 lines)
│
├── WorkspaceWelcome — "Create Your Digital Link" + "Browse NFC Cards" (shown when zero cards)
└── Card grid — card selection cards (shown when multiple cards)
```

### Data Flow

```
Customer Session (oi_customer_session cookie)
  ↓
WorkspacePage (RSC) loads account via getActivationService().accountForSession()
  ↓
If slug present: openCardForSession() → readWorkspaceCard() → WorkspaceCardDTO
  ↓
AppearanceEditor receives initialCard + editorToken as props
  ↓
useWorkspaceCard hooks stores editorToken in sessionStorage, hydrates local state
  ↓
User edits → local state updates → previewCard (useMemo) re-derives → PreviewPanel re-renders
  ↓
markDirty("section") → save() → put() to API → server validates & persists → clearDirty()
```

### State Ownership

| State | Owner | Consumer(s) |
|---|---|---|
| card (WorkspaceCardDTO) | useWorkspaceCard | PreviewPanel, SharePanel, all panels, save |
| appearance (AppearanceSettings) | useWorkspaceCard | PreviewPanel, Appearance panel |
| profile (CardProfileDTO) | useWorkspaceCard | PreviewPanel, Basic/Contact panels |
| sections (CardSectionDTO[]) | useWorkspaceCard | Visibility panel, preview |
| saveState, message | useWorkspaceSave | SaveBar, all panels |
| dirty sections (Set) | useWorkspaceSave (useRef) | save() |
| slug, slugDraft, slugStatus | useSlugEditor | SEO panel, SharePanel, save |
| publicationBusy, publicationMessage | usePublication | Editor header |
| openPanel | useState local to AppearanceEditor | Sidebar accordion |
| newButton, newSocial | useState local to AppearanceEditor | Button/Social panels |
| fieldErrors, errorSummary | useValidation | Inline field errors, error banner |

### Hooks (all in `src/features/appearance/hooks/`)

| Hook | Purpose | Key return values |
|---|---|---|
| useWorkspaceCard | Card hydration, session storage, derived preview DTO | card, appearance, profile, sections, previewCard, sessionState, editorButtons, editorSocial |
| useWorkspaceSave | Dirty tracking, save orchestration, per-section persistence | saveState, message, markDirty(section), save(params), refresh, isDirty, clearDirty |
| useSlugEditor | Slug validation, suggestion generation, URL copy | slug, slugDraft, slugStatus, suggestions, openGenerateLink, copyPublicLink |
| usePublication | Publish/unpublish/restore state | publicationBusy, publicationMessage, changePublication(card, action) |
| useAppearance | Preset selection, appearance field patching | patch(key, value), choosePreset(id), presets |
| useValidation | Client-side profile validation, server error mapping | fieldErrors, errorSummary, validate(profile), applyServerErrors(issues), clearFieldError(field) |

### Preview Rendering

```
AppearanceSettings + CardProfileDTO + CardSectionDTO[] + EditorCardDTO
  ↓
useMemo → PublicCardDTO (merged, with visible buttons/socialLinks only)
  ↓
PreviewPanel (memo'd)
  ↓
DefaultTheme (CSS custom properties: --primary, --accent, --text, --muted, --radius, --card-shadow, --font, --background)
```

### Save Pipeline

```
handleSave()
  ↓
validate(profile)  ← client-side Zod validation (rejects before any HTTP)
  ↓
save({ card, appearance, profile, sections, slugDraft, slug, editorButtons, editorSocial })
  ↓
  ├── slugDraft !== slug → PUT /cards/{id}/slug (+ sessionStorage update)
  ├── dirty.has("profile") → PUT /cards/{id}/profile
  ├── dirty.has("appearance") → PUT /cards/{id}/appearance
  ├── dirty.has("sections") → PUT /cards/{id}/sections
  ├── dirty.has("settings") → PUT /cards/{id}/settings
  ├── dirty.has("buttons") → PATCH each /cards/{id}/buttons/{buttonId}
  └── dirty.has("social") → PATCH each /cards/{id}/social-links/{linkId}
  ↓
clearDirty()  ← local state stays, no server reload
```

---

## PHASE 2 — Feature Inventory

### Identity
- Full Name (required, 1-120 chars, trimmed)
- Headline (optional, 160 chars max)
- Company (optional, 160 chars max)
- About/Bio (optional, 2000 chars max, textarea)
- Avatar (displayed as initials in preview, editable via admin only)

### Contact
- Email (optional, validated with Zod `.email()`)
- Phone (optional, regex: `^\+?[0-9 ()\-.]{7,40}$`)
- Website (optional, validated with Zod `.url()`, auto-normalized to prepend `https://`)
- Address (optional, 300 chars max)
- Country Code (optional, 2-char ISO 3166-1 alpha-2, auto-uppercased)

### Social Links
- Platform (text, 40 chars max, trimmed)
- Label (optional text, 80 chars max)
- URL (required)
- Per-link visibility toggle
- Drag reorder + up/down buttons
- Add/delete individual links

### Action Buttons
- Label (1-80 chars, trimmed)
- URL (required)
- Per-button visibility toggle
- Drag reorder + up/down buttons
- Add/delete individual buttons
- Supported types: Call, Email, Website (freeform labels)

### Content Blocks
- Hero block (heading, subtitle, background)
- About block (heading, body text)
- Contact block (heading)
- Gallery block (heading, mediaIds, columns)
- Video block (heading, URL, mediaId, caption)
- FAQ block (heading, items list)
- Location Map block
- Divider block
- Rich Text block
- Social Links block (mirrors social links)
- Buttons block (mirrors action buttons)
- Block initialization (migrates legacy sections to blocks)
- Per-block add/delete/duplicate/reorder
- Block configuration editor per kind

### Appearance
- 7 presets: Default, Minimal, Dark, Luxury, Coffee, Ocean, Sunset
- Colors: primary, accent, text, mutedText (hex color pickers)
- Background: style (SOLID/GRADIENT), color, gradientFrom, gradientTo
- Typography: SYSTEM, SANS, SERIF
- Button Style: SOLID, OUTLINE, SOFT
- Border Radius: integer 0-32
- Shadow: NONE, SMALL, MEDIUM, LARGE
- Section visibility toggles: profile, bio, contact, buttons, socialLinks

### Publishing
- Card visibility: PUBLIC, UNLISTED, PRIVATE
- Card status: DRAFT, PUBLISHED, UNPUBLISHED, ARCHIVED
- Publish / Unpublish / Restore actions
- Published date tracking

### Public URL (Slug)
- Editable slug (3-80 chars, lowercase alphanumeric + hyphens)
- Real-time availability checking (debounced 350ms)
- Auto-generated suggestions from card name + suffixes
- Reserved word checking
- Copy public link
- Open public profile
- URL format: `{baseUrl}/@{slug}`

### QR Code
- Auto-generated PNG via qrcode npm package
- Download QR as PNG
- Displayed only when card is published

### SEO
- SEO Title (70 chars max, trimmed)
- SEO Description (180 chars max, trimmed, textarea)
- Character counts displayed

### Section Ordering
- Drag-and-drop section reorder in Visibility panel
- Up/down arrow buttons per section
- Per-section visibility toggle
- Default order: PROFILE, ABOUT, CONTACT, BUTTONS, SOCIAL_LINKS

### Subscription Display
- Plan name, status, billing interval
- Price display (currency-formatted)
- Renewed/expires dates
- Expiration warning banner
- Write lock when subscription expired

### Admin Mode (admin only)
- AdminModeBanner with card context
- NFC card management
- Subscription management
- Issue new access codes

---

## PHASE 3 — User Workflow

### First-Time Customer Journey

```
1. Login (email + password)
   ↓
2. Welcome Page (shown once)
   - Displays: "Account approved", subscription details, getting started checklist
   - Actions: "Start Building" → card builder, "Go to Workspace" → workspace
   - Sets oi_welcome_seen cookie
   ↓
3. Workspace Dashboard
   - Zero cards → auto-creates first card via createDigitalCardForSession()
   - Redirects to /workspace?slug={new-slug}
   ↓
4. AppearanceEditor loads
   - Server loads card via openCardForSession() + readWorkspaceCard()
   - Passes initialCard + editorToken as props
   - Editor stores editorToken in sessionStorage for API auth
   - All panels available, Basic Information open by default
   ↓
5. Edit Identity
   - Click Basic Information panel (if not default)
   - Edit Full Name, Headline, Company, About
   - Each keystroke updates preview in real-time
   - markDirty("profile") on any change
   ↓
6. Edit Contact
   - Click Contact Information panel
   - Edit Email, Phone, Website, Address, Country Code
   - Client-side validation on save
   ↓
7. Add Social Links
   - Click Social Links panel
   - Type platform (e.g., "LinkedIn") and URL
   - Click Add
   - Drag to reorder
   ↓
8. Add Action Buttons
   - Click Action Buttons panel
   - Type label and URL (e.g., "Book a Call", "https://cal.com/me")
   - Click Add
   ↓
9. Customize Design
   - Click Appearance panel
   - Browse 7 presets, click one to apply
   - Adjust colors via hex inputs
   - Change typography, button style, border radius, shadow
   - Each change updates preview in real-time
   ↓
10. Save
    - Click "Save Changes" in sticky save bar (or submit form)
    - Only dirty sections are persisted
    - No full card reload — local state is source of truth
    - Save state changes: "Saving…" → "Saved"
    ↓
11. Publish
    - Click "Publish" in editor header
    - Card status changes to PUBLISHED
    - Public URL becomes active
    - Published panel shows URL with Copy/Open actions
    ↓
12. Share
    - SharePanel (right column) shows public URL + QR code
    - Copy link, download QR, open public profile
```

### Returning Customer Journey

```
1. Login → Workspace Dashboard
   - Multiple cards → card selection grid
   - Single card → auto-opens builder
   ↓
2. Editor loads with card data
   - All previous edits preserved
   - Status badge shows "Published" or "Draft"
   ↓
3. Edit → Save → (re-publish if needed)
```

---

## PHASE 4 — UI Structure

### Panel 1: Editor Header
- **Purpose**: Card identity + publication status + actions
- **Contents**: Card name, status badge (Published/Draft/Archived), Publish/Unpublish/Restore buttons, "Generate Link" button
- **Dependencies**: activeCard, slugEditor, publication state, subscription state
- **Current UX**: Buttons are small (0.65rem font), status badge uses green/amber dots, generate link is hidden behind a button
- **Pain points**: Three disconnected surfaces for one workflow (header has publish, SEO panel has slug, SharePanel has URL)

### Panel 2: Content Blocks (accordion)
- **Purpose**: Add/edit/reorder card content blocks
- **Contents**: BlockEditor component — type selector dropdown, per-block accordion with ConfigFields
- **Dependencies**: activeCard, setCard
- **Related APIs**: POST/PATCH/DELETE /cards/{id}/blocks/*, POST /cards/{id}/blocks/initialize
- **Current UX**: 427-line sub-component, block type dropdown, per-block configuration
- **Pain points**: First panel in the list but used by few users; complex UI for an advanced feature

### Panel 3: Basic Information (accordion)
- **Purpose**: Edit card owner's identity
- **Contents**: Avatar display (initials), fullName, headline, company, bio (textarea)
- **Dependencies**: activeProfile, profilePatch
- **Current UX**: 4 fields in a single field group
- **Pain points**: Most-used panel but not the default; avatar is display-only (no upload)

### Panel 4: Contact Information (accordion)
- **Purpose**: Edit contact details
- **Contents**: email, phone, website, address, countryCode — all text/url/tel inputs
- **Dependencies**: activeProfile, profilePatch
- **Current UX**: 5 fields, browser input type validation (email, url, tel)
- **Pain points**: No inline validation feedback until save

### Panel 5: Social Links (accordion)
- **Purpose**: Manage social media profile links
- **Contents**: Count badge, draggable list items (platform, label, URL inputs per link), add row at bottom
- **Dependencies**: editorSocial, replaceSocial, markDirty
- **Current UX**: Inline CRUD with drag handles, up/down arrows, delete buttons
- **Pain points**: Dense layout with small inputs; platform field is freeform text (no platform picker)

### Panel 6: Action Buttons (accordion)
- **Purpose**: Manage CTA buttons on the card
- **Contents**: Count badge, draggable list items (label, URL inputs per button), add row
- **Dependencies**: editorButtons, replaceButtons, markDirty
- **Current UX**: Same pattern as Social Links
- **Pain points**: Same density issues; no button preview

### Panel 7: Appearance (accordion)
- **Purpose**: Visual design of the card
- **Contents**: 7 preset cards in 2-column grid, color tokens (4 hex inputs), background style (segmented control + color pickers), typography (segmented), button style (segmented), border radius (range slider), shadow (segmented), section visibility toggles
- **Dependencies**: activeAppearance, patch, choosePreset, presets
- **Current UX**: 20+ controls in one panel; preset preview cards show color swatches
- **Pain points**: Longest panel — requires significant scrolling; color pickers are native browser inputs (inconsistent across platforms); no live preview of appearance changes on the card during editing (only after save+reload in the old flow, now real-time in local state)

### Panel 8: SEO & Visibility (accordion)
- **Purpose**: Search optimization + card visibility + public URL + section order
- **Contents**: SEO title (70 char limit), SEO description (180 char limit), public slug with availability checking, card visibility select, section visibility toggle grid, section drag reorder
- **Dependencies**: activeCard, slugEditor, sections, setCard, markDirty
- **Current UX**: Many unrelated controls combined; slug editing shows real-time validation; section reorder uses drag-and-drop
- **Pain points**: Too many features in one panel; slug editing is duplicated (here + Generate Link panel); section reorder is a complex interaction

### Panel 9: Save Bar (sticky footer)
- **Purpose**: Show save state + trigger save
- **Contents**: Status dot (green/amber/blue/red), status text ("Saved"/"Unsaved changes"/"Saving…"/"Could not save"), optional error message, "Save Changes" button
- **Current UX**: Sticky at bottom of left column, glass effect background
- **Pain points**: Always visible even when saved; "Unsaved changes" creates anxiety; button disappears when saved

### Panel 10: PreviewPanel (center column)
- **Purpose**: Live card preview
- **Contents**: Device toggle (Mobile/Desktop), Zoom toggle (100%/Fit), Public View link (when published), DefaultTheme rendering
- **Current UX**: 56% of viewport, static rendering, mobile view shows card at phone width
- **Pain points**: Card is not interactive (can't click to edit); mobile view has no phone frame; no transition animations on appearance changes

### Panel 11: SharePanel (right column)
- **Purpose**: Share and distribute the card
- **Contents**: Publish status badge, Public URL (readonly input), Copy Link button, QR code (when published), Download QR / Open Profile links
- **Current UX**: 18% of viewport, thin column
- **Pain points**: Disconnected from publish workflow; QR only shows when published; disappears below 760px viewport; no NFC sharing options

---

## PHASE 5 — Data Model

### Entity Relationships

```
Card (central entity)
├── Profile (1:1 embedded)
│   ├── fullName, headline, company, bio
│   ├── email, phone, website, address, countryCode
│   └── stored as Card.profile via Prisma relation
│
├── Appearance (1:1, stored as Card.themeConfig JSON)
│   ├── colors: { primary, accent, text, mutedText }
│   ├── background: { style, color, gradientFrom, gradientTo }
│   ├── typography, buttonStyle, borderRadius, shadow
│   └── sections: { profile, bio, contact, buttons, socialLinks }
│
├── Sections (1:N, CardSection table)
│   ├── kind: PROFILE | ABOUT | CONTACT | BUTTONS | SOCIAL_LINKS
│   ├── position, isVisible, title
│   └── soft-deleted (deletedAt)
│
├── Buttons (1:N, CardButton table)
│   ├── label, url, position, isVisible
│   └── soft-deleted (deletedAt)
│
├── SocialLinks (1:N, SocialLink table)
│   ├── platform, label?, url, position, isVisible
│   └── soft-deleted (deletedAt)
│
├── Blocks (1:N, CardBlock table)
│   ├── kind, position, isEnabled, config (JSON)
│   ├── Media (N:M, CardBlockMedia)
│   └── soft-deleted (deletedAt)
│
├── Metadata
│   ├── slug (unique), name, status, visibility
│   ├── publishedAt, seoTitle, seoDescription
│   ├── accessVersion, themeId, customerId
│   └── timestamps: createdAt, updatedAt
│
├── Plan/Subscription (1:1 via customer)
│   ├── plan name, price, currency, features
│   └── subscription status, billing interval, dates
│
└── Editor Session (1:N, created per editor session)
    ├── token (SHA-256 hashed), cardId
    ├── status, expiresAt
    └── used for API authorization on mutation endpoints
```

### DTO Hierarchy

```
CardDTO (base)
  ├── PublicCardDTO (extends, omits customerId/accessVersion)
  │   ├── adds: appearance, buttons, socialLinks, sections, blocks
  │   └── used by: public card page, preview panel
  │
  ├── EditorCardDTO (extends CardDTO)
  │   ├── adds: themeConfig, buttons (with isVisible), socialLinks (with isVisible), sections, blocks
  │   └── used by: server-side card reads, repository layer
  │
  └── WorkspaceCardDTO (extends PublicCardDTO)
      ├── adds: plan (CustomerPlanSummaryDTO), editorButtons, editorSocialLinks, editorBlocks
      └── used by: AppearanceEditor (client-side state)
```

---

## PHASE 6 — Design Controls

### Typography
| Control | Values | Where |
|---|---|---|
| Font family | SYSTEM, SANS, SERIF | Appearance panel → segmented control |
| Font weight | Controlled by theme | DefaultTheme CSS |
| Font sizes | Controlled by theme | DefaultTheme CSS |

### Colors
| Control | Format | Where |
|---|---|---|
| Primary color | Hex (#RRGGBB) | Appearance panel → color input |
| Accent color | Hex | Appearance panel → color input |
| Text color | Hex | Appearance panel → color input |
| Muted text | Hex | Appearance panel → color input |

### Background
| Control | Values | Where |
|---|---|---|
| Style | SOLID, GRADIENT | Appearance panel → segmented control |
| Solid color | Hex | Conditionally shown |
| Gradient from | Hex | Conditionally shown |
| Gradient to | Hex | Conditionally shown |

### Shape
| Control | Range | Where |
|---|---|---|
| Border radius | 0-32 (integer) | Appearance panel → range slider |

### Depth
| Control | Values | Where |
|---|---|---|
| Shadow | NONE, SMALL, MEDIUM, LARGE | Appearance panel → segmented control |

### Buttons
| Control | Values | Where |
|---|---|---|
| Button style | SOLID, OUTLINE, SOFT | Appearance panel → segmented control |

### Sections
| Control | Values | Where |
|---|---|---|
| Profile visibility | Boolean toggle | Appearance panel |
| Bio visibility | Boolean toggle | Appearance panel |
| Contact visibility | Boolean toggle | Appearance panel |
| Buttons visibility | Boolean toggle | Appearance panel |
| Social links visibility | Boolean toggle | Appearance panel |
| Section order | Drag-and-drop + arrow buttons | SEO & Visibility panel |

### Presets (7 pre-configured designs)
| Preset | Primary | Accent | Typography | Buttons | Radius | Shadow | Background |
|---|---|---|---|---|---|---|---|
| Default | #1d4ed8 | #60a5fa | SANS | SOLID | 16 | MEDIUM | SOLID #f8fafc |
| Minimal | #18181b | #a1a1aa | SYSTEM | OUTLINE | 6 | NONE | SOLID #ffffff |
| Dark | #a78bfa | #22d3ee | SANS | SOFT | 18 | LARGE | GRADIENT #0f172a |
| Luxury | #a16207 | #facc15 | SERIF | OUTLINE | 4 | LARGE | GRADIENT #fafaf9 |
| Coffee | #78350f | #d97706 | SERIF | SOFT | 20 | MEDIUM | GRADIENT #fef3c7 |
| Ocean | #0369a1 | #2dd4bf | SANS | SOLID | 22 | MEDIUM | GRADIENT #ecfeff |
| Sunset | #c2410c | #e11d48 | SANS | SOFT | 24 | LARGE | GRADIENT #fff7ed |

---

## PHASE 7 — File Map

### Core Editor
| File | Lines | Type | Purpose |
|---|---|---|---|
| `src/features/appearance/AppearanceEditor.tsx` | ~1150 | Client | Main orchestration component. 7 accordion panels, save bar, publish controls, slug generation. Imports 6 hooks. |
| `src/features/appearance/BlockEditor.tsx` | 427 | Client | Content block CRUD sub-component. Block type selector, per-block config editors. |
| `src/features/appearance/AdminModeBanner.tsx` | 45 | Client | Admin-only banner showing card context, NFC management, subscription actions. |
| `src/features/appearance/workspace-session-client.ts` | 355 | Client | sessionStorage management, 19 mutation API functions, admin bypass logic. |
| `src/features/appearance/actions.ts` | 40 | Server | `loadWorkspaceCard(cardId, token)` and `loadAdminWorkspaceCard(cardId)`. |
| `src/features/appearance/presets.ts` | 14 | Shared | 7 AppearancePreset definitions + `copyPreset()` deep clone function. |
| `src/features/appearance/appearance-editor.module.css` | ~600 rules | CSS | All editor styles — grid layout, accordion, forms, save bar, panels, responsive. |

### Hooks (Business Logic Layer)
| File | Lines | Purpose |
|---|---|---|
| `hooks/useWorkspaceCard.ts` | ~90 | Card hydration from initialCard, sessionStorage token storage, preview DTO derivation, editor buttons/social memoization. |
| `hooks/useWorkspaceSave.ts` | ~95 | Dirty tracking per section (Set<DirtySection>), save orchestration, server error parsing, put() helper. |
| `hooks/useSlugEditor.ts` | ~75 | Slug state, debounced validation, suggestion generation, copy URL. |
| `hooks/usePublication.ts` | ~30 | Publish/unpublish/restore with busy state and error handling. |
| `hooks/useAppearance.ts` | ~15 | Preset selection, appearance field patching. |
| `hooks/useValidation.ts` | ~55 | Client-side profile validation, server error mapping, field-level error clearing. |

### Pages
| File | Lines | Purpose |
|---|---|---|
| `src/app/workspace/page.tsx` | 94 | RSC. Three modes: admin, customer+slug, customer dashboard. Auto-creates first card. |
| `src/app/welcome/page.tsx` | 105 | RSC. Post-approval welcome screen with subscription display. |
| `src/app/welcome/WelcomeActions.tsx` | 29 | Client. Navigation buttons that call markWelcomeSeen() before navigating. |

### Customer Onboarding
| File | Lines | Purpose |
|---|---|---|
| `src/features/customer-onboarding/CustomerOnboarding.tsx` | 128 | Client. WorkspaceCardLauncher (card picker) and WorkspaceWelcome (create first card). |
| `src/features/customer-onboarding/actions.ts` | 48 | Server. createDigitalCardAction(), openCustomerCardAction(). |

### Rendering
| File | Lines | Purpose |
|---|---|---|
| `src/components/themes/DefaultTheme.tsx` | 104 | Canonical card renderer using CSS custom properties from AppearanceSettings. |
| `src/components/PreviewPanel.tsx` | 78 | Client. Live preview with device/zoom toggles, wraps DefaultTheme. |
| `src/components/SharePanel.tsx` | 70 | Client. QR code generation, public URL display, copy/download actions. |

### Infrastructure
| File | Purpose |
|---|---|
| `src/validation/fields.ts` | Shared field schemas (email, phone, website, countryCode, fullName), profileFieldsSchema, validateProfileFields(), normalizeProfileFields() |
| `src/validation/use-cases.ts` | Server use-case input schemas (updateCardProfile, updateCardAppearance, etc.) |
| `src/validation/appearance.ts` | AppearanceSettings Zod schema + defaults |
| `src/types/appearance.ts` | AppearanceSettings TypeScript interface |
| `src/dto/card.dto.ts` | CardDTO, PublicCardDTO, EditorCardDTO, WorkspaceCardDTO, CardProfileDTO |
| `src/dto/card-block.dto.ts` | CardBlockDTO, EditorCardBlockDTO, CardBlockKind |
| `src/use-cases/update-card-profile.ts` | UpdateCardProfile use case |
| `src/use-cases/update-card-appearance.ts` | UpdateCardAppearance use case |
| `src/use-cases/card-builder.ts` | BuilderUseCase base, 12 card mutation use cases (sections, buttons, social, metadata, slug) |
| `src/use-cases/card-blocks.ts` | BlockUseCase base, 7 block mutation use cases |
| `src/use-cases/update-card-publication.ts` | Publish/unpublish/restore use case |
| `src/use-cases/editor-authorization.ts` | authorizeEditorAccess(), auditAdminWorkspaceEdit() |
| `src/repositories/card.repository.ts` | Prisma card read/write with editorSelect (6 relations), 17 mutation methods returning MutationResult |
| `src/features/public-card/public-card-cache.server.ts` | Next.js cache tag invalidation for public cards |
| `src/features/public-card/public-card-mutation-route.server.ts` | Shared route handler wrapper for card mutations |

### Mutation API Routes (all under `src/app/cards/[id]/`)
| Route | Method | Purpose |
|---|---|---|
| `/profile` | PUT | Update card profile |
| `/appearance` | PUT | Update appearance settings |
| `/sections` | PUT | Replace all sections |
| `/settings` | PUT | Update SEO + visibility |
| `/slug` | PUT | Change card slug |
| `/buttons` | POST/PUT | Create / reorder buttons |
| `/buttons/[buttonId]` | PATCH/DELETE | Update / delete button |
| `/social-links` | POST/PUT | Create / reorder social links |
| `/social-links/[socialLinkId]` | PATCH/DELETE | Update / delete social link |
| `/blocks` | POST/PUT | Create / reorder blocks |
| `/blocks/[blockId]` | PATCH/DELETE | Update / delete block |
| `/blocks/[blockId]/duplicate` | POST | Duplicate block |
| `/blocks/initialize` | POST | Initialize blocks from legacy sections |
| `/publication` | PUT | Publish / unpublish / restore |

---

## PHASE 8 — Final Summary

### Current Architecture
A Next.js 16 App Router application with a React client-side card editor. The workspace uses a 3-column CSS grid layout: sidebar (26fr, accordion panels), preview (56fr, live card render), share panel (18fr, QR + URL). State is managed via React hooks (6 custom hooks). Data flows unidirectionally: server loads card → client hydrates → user edits local state → preview updates in real-time → save persists only dirty sections. The server uses Prisma with PostgreSQL, Zod validation, and a unit-of-work pattern with transaction-scoped repositories.

### Current Features
- 7 accordion panels grouped into 3 categories (Content, Design, Settings)
- Complete profile editing (identity + contact)
- CRUD for social links and action buttons
- Content block system (11 block types)
- Appearance system with 7 presets + 6 categories of design controls
- Publishing workflow (draft → publish → unpublish → restore)
- Slug editing with real-time validation and suggestions
- QR code generation and download
- SEO metadata editing
- Section visibility and ordering
- Per-section dirty tracking
- Client-side validation with inline errors
- Auto-save with minimal HTTP requests
- Admin mode with NFC card management

### Current Strengths
- Zero unnecessary reloads — local state is source of truth
- Per-section dirty tracking saves only what changed
- Shared Zod schemas between client and server
- Website URL auto-normalization, country code auto-uppercase
- Professional inline validation with field-level errors
- Lightweight MutationResult return type (no unnecessary DTO reconstruction)
- Single Prisma transaction per mutation
- Server-side authorization on every mutation
- Responsive layout (3-column → 2-column → stacked)

### Current Limitations
- 1150-line monolithic editor component
- Accordion pattern limits user to one panel at a time
- Card preview is static — no click-to-edit
- Publish workflow split across three disconnected surfaces
- Content Blocks panel is first but least-used
- No direct manipulation (edit in sidebar, view in preview)
- Small typography (0.64-0.8rem base) creates density
- Sticky save bar creates anxiety even when saved
- Share panel disappears below 760px
- No auto-save — manual save button required
- No undo/redo
- No photo upload for avatar
- No mobile editing experience
- No keyboard shortcuts beyond form submit

### Opportunities for UX Redesign
1. **Replace accordion with direct manipulation** — click-to-edit on the card preview
2. **Consolidate to 3 modes** (Profile, Design, Share) instead of 7 panels
3. **Make preview interactive** — hover highlights, click-to-edit, inline text editing
4. **Unify publish workflow** — single Share mode with URL, QR, visibility, status
5. **Auto-save** — remove the sticky save bar, save on every change
6. **Larger typography and spacing** — more breathing room, premium feel
7. **Mobile-first responsive** — stack vertically with bottom sheet inspector
8. **Add undo/redo** — essential for creative tools
9. **Add keyboard shortcuts** — ⌘S save, ⌘Z undo, ⌘⇧Z redo
10. **Phone frame for mobile preview** — make the card feel like a physical object
11. **Transition animations** — smooth transitions when appearance settings change
12. **Photo upload** — avatar and cover image upload via drag-and-drop
