# Workspace V2 — UX Architecture: Navigation & Interaction Redesign

**Status:** Draft for Review
**Date:** 2026-07-25
**Type:** UX Architecture (no visual redesign)

---

## 1. Current State — Friction Audit

### 1.1 URL Structure

```
Current:  /workspace?slug=<slug>
Example:  /workspace?slug=alex-rivera
```

**Problem 1 — Query-param routing is broken for browser navigation.**

The card being edited is identified by a `?slug=` query parameter. When the user navigates between cards by clicking the sidebar `CardSelector`, `router.replace(buildWorkspaceBuilderPath(slug))` fires. This calls `router.replace("/workspace?slug=other-card")`.

Because `router.replace` is used (not `router.push`), **no browser history entry is created**. The user cannot press Back to return to the previous card.

Additionally, `buildWorkspaceBuilderPath` produces `/workspace?slug=<slug>`. The entire card editor lives at `/workspace` — there is no URL distinction between "card selection view" and "card editing view." Both are the same route, with the query param acting as a mode flag.

### 1.2 Browser History

**Problem 2 — History stack is non-existent for card navigation.**

Every card transition uses `router.replace()`. This means:
- Opening card A → opening card B → pressing Back → lands wherever the user was BEFORE `/workspace` (login, landing page, etc.)
- The user loses all context of their editing session
- There is no way to return to the card selection view after entering the editor

**Problem 3 — Deep-link to a card cannot be distinguished from the selection view.**

`/workspace` (no query) = card selection view
`/workspace?slug=alex` = card editor for "alex"

Both share the same route segment. The browser treats them as the same page. `router.replace` between them destroys the previous state.

### 1.3 Card Selection

**Problem 4 — Two card selectors exist with inconsistent behavior.**

| Selector | Location | Behavior |
|:---------|:---------|:---------|
| `WorkspaceCardSelector` | Center canvas (when no slug) | Full-page card grid with "Open" buttons. Calls `openCustomerCardAction()` → `storeEditorSession()` → `router.replace()`. |
| `CardSelector` | Left sidebar (when slug present) | Compact list in sidebar. Calls `router.replace(buildWorkspaceBuilderPath(slug))` directly without session creation. |

The sidebar `CardSelector` assumes a reusable session already exists (from `hasReusableEditorSession`), while the center `WorkspaceCardSelector` creates a new session. If the session expires and the user clicks the sidebar selector, the navigation fails silently or redirects to login.

**Problem 5 — Card switching destroys unsaved work.**

Clicking a different card in the sidebar immediately calls `router.replace()`. There is no unsaved-changes warning. The Zustand card editor store is reset on the next server render. Any dirty state is lost.

### 1.4 Navigation Hierarchy

**Problem 6 — The sidebar mixes app navigation with content navigation.**

The left sidebar contains:
1. App-level section tabs: Identity, Design, Links, Content, Publish
2. Card switcher: "Your Cards" list
3. User profile footer

These belong to different conceptual levels:
- Card switcher = **workspace-level** (which card am I editing?)
- Section tabs = **card-level** (what part of this card am I editing?)
- User footer = **account-level** (who am I?)

They're rendered as a single flat list in the sidebar, creating hierarchy confusion.

**Problem 7 — Active section state is not URL-reflected.**

Clicking "Design" in the sidebar sets `activeSection` in Zustand (and persists to sessionStorage), but the URL remains `/workspace?slug=alex`. The user cannot:
- Share a link to the Design tab of a specific card
- Bookmark their place
- Navigate with browser back/forward between sections

### 1.5 Back Behavior

**Problem 8 — No "back to cards" affordance.**

Once inside the card editor, the only way to see all cards is to manually clear the `?slug=` query parameter. There is no:
- Back button in the UI
- Breadcrumb trail
- "All Cards" link in the sidebar

The CardSelector in the sidebar shows other cards but doesn't provide a way to return to the selection view without selecting a different card.

### 1.6 Workspace State Persistence

**Problem 9 — Session storage is partial and fragile.**

Current persistence:
| State | Storage | Survives |
|:------|:--------|:---------|
| `zoom` | sessionStorage | Page reload within same tab |
| `activeSection` | sessionStorage | Page reload within same tab |
| Editor session token | sessionStorage (`editor-session:{cardId}`) | Page reload within same tab |
| Card→slug mapping | sessionStorage (`workspace-card:{slug}`) | Page reload within same tab |
| Card editor data (profile, appearance, buttons) | Zustand (in-memory only) | Nothing — lost on reload |
| Dirty/unsaved changes | Zustand (in-memory only) | Nothing — lost on reload |

**Problem 10 — Tab duplication loses context.**

Opening `/workspace?slug=alex` in a new tab:
- The editor session token exists in the original tab's sessionStorage, not the new tab
- The server page creates a NEW editor session
- The Zustand store starts empty — card data is re-fetched
- Any unsaved changes in the original tab are lost if the user saves from the new tab

### 1.7 User Journey

**Problem 11 — First-time experience has too many redirects.**

```
New user flow:
  1. /login → enter access code
  2. Redirect to /workspace (no cards yet)
  3. Server auto-creates first card → redirect to /workspace?slug=new-card
  4. CardEditorProvider hydrates → PreviewSync renders
```

Three server round-trips before the user sees an editor. The auto-create redirect happens server-side, so the user sees a flash of loading state.

**Problem 12 — Returning user flow is non-deterministic.**

```
Returning user flow (multiple cards):
  1. /workspace → server sees cards[] with length > 1 and no slug
  2. Renders WorkspaceCardSelector (card grid)
  3. User clicks a card → openCustomerCardAction() → router.replace(?slug=xxx)
  4. Server re-renders → opens session → hydrates editor
```

If the user had a card open in their previous session, there's no "last active card" memory. They always land on the card selector, even if they only ever edit one card.

### 1.8 Confusion Points Summary

| # | Symptom | Root Cause |
|:--|:--------|:-----------|
| 1 | Back button doesn't work | `router.replace` for all navigation |
| 2 | No breadcrumb or "back to cards" | Card selection and editing share one route |
| 3 | Two different card selectors | Inconsistent session handling |
| 4 | Section tabs look like app navigation | Flat sidebar hierarchy |
| 5 | Can't share a link to Design tab | Sections are Zustand-only, not in URL |
| 6 | Unsaved changes silently lost on card switch | No dirty-state guard before navigation |
| 7 | New tab loses editor context | sessionStorage (not URL) holds session tokens |
| 8 | Three redirects before first edit | Auto-create happens server-side with redirect |

---

## 2. Proposed UX Architecture

### 2.1 URL Structure — RESTful card-based routing

```
/workspace                          → Card list (selection view)
/workspace/{slug}                   → Card editor (identity tab, default)
/workspace/{slug}/design            → Card editor (design tab)
/workspace/{slug}/links             → Card editor (links tab)
/workspace/{slug}/content           → Card editor (content tab)
/workspace/{slug}/publish           → Card editor (publish tab)
```

**Rationale:**
- Every card is a distinct URL segment → browser history works natively
- Every editor tab is a distinct URL segment → shareable, bookmarkable, back/forward works
- `router.push()` creates history entries; Back returns to the previous card or the card list
- The server can pre-fetch the correct card from the URL without query-param parsing

**Implementation:**
- Next.js dynamic route: `src/app/workspace/[slug]/page.tsx` for card editing
- Optional catch-all for tabs: `src/app/workspace/[slug]/[[...tab]]/page.tsx`
- `src/app/workspace/page.tsx` remains the card list (no slug)
- The `layout.tsx` wraps both — the shell is consistent across all workspace pages

### 2.2 Browser History

**Rule: Every user-initiated navigation creates a history entry.**

| Action | Method | History Entry |
|:-------|:-------|:--------------|
| Open card from list | `router.push(/workspace/{slug})` | Yes |
| Switch card via sidebar | `router.push(/workspace/{other-slug})` | Yes |
| Switch editor tab | `router.push(/workspace/{slug}/design)` | Yes |
| Return to card list | `router.push(/workspace)` | Yes |
| Back button | Browser native | Returns to previous card/list |
| Forward button | Browser native | Returns to next card/tab |

**Exception:** `router.replace` is used ONLY for:
- Redirect after card creation (don't let user go "back" to the create action)
- Server-side redirects (auto-create first card)

### 2.3 Card Selection

**Design: Card list is a dedicated route, not a mode of the editor route.**

```
/workspace (no slug)
  └── Shell (sidebar + toolbar + canvas)
       └── Canvas: CardList component
            ├── "Your Cards" heading
            ├── Card grid (click → push /workspace/{slug})
            └── "Create New Card" button

/workspace/{slug} (slug present)
  └── Shell (sidebar + toolbar + canvas)
       ├── Sidebar:
       │    ├── Breadcrumb: "← All Cards"
       │    ├── Card selector: compact list, current highlighted
       │    └── Section tabs: Identity / Design / Links / Content / Publish
       ├── Canvas: PreviewSync (card editor)
       └── Inspector: Contextual editor for active section
```

**Card switching guard:**
- Before navigating away, check `useCardEditorStore.saveState`
- If `"dirty"`, show a confirmation dialog: "You have unsaved changes. Discard them?"
- If confirmed, navigate. If cancelled, stay.
- The dirty guard lives in the `CardSelector` click handler and the Back button handler.

**Sidebar card selector behavior:**
- Uses the same session creation logic as the card list: `openCustomerCardAction()` → `storeEditorSession()` → `router.push()`
- No direct `router.push(buildWorkspaceBuilderPath(slug))` — always goes through the session check
- Shows a loading spinner while session is being created

### 2.4 Navigation Hierarchy

**Design: Three-tier sidebar hierarchy with visual separation.**

```
┌─────────────────────────┐
│ Tapp Studio (brand)     │  ← Tier 0: Product identity
├─────────────────────────┤
│ ← All Cards             │  ← Tier 1: Breadcrumb / workspace-level
│                         │
│ Your Cards              │
│  ○ Alex Rivera    ●     │  ← Tier 1: Card switcher (compact list)
│    Design Portfolio     │
│    Consulting Profile   │
├─────────────────────────┤
│ Identity           ●    │  ← Tier 2: Card-level section tabs
│ Design                  │
│ Links                   │
│ Content                 │
│ Publish                 │
├─────────────────────────┤
│ User profile            │  ← Tier 3: Account-level
│ Settings                │
└─────────────────────────┘
```

**Visual separation:**
- Tier 0: Brand header (existing — unchanged)
- Tier 1: Breadcrumb + card switcher, separated by a subtle divider from Tier 2
- Tier 2: Section navigation tabs (existing — unchanged)
- Tier 3: User footer (existing — unchanged)

### 2.5 Breadcrumbs

**Design: Single breadcrumb in the sidebar header area.**

```
[← All Cards]
```

- Visible ONLY when editing a card (not on the card list view)
- Clicking returns to `/workspace` (card list)
- Uses `router.push()` so Back from the card list returns to the card being edited
- Positioned above the card switcher in the sidebar

**Alternative considered:** Full breadcrumb trail (`Workspace > Alex Rivera > Design`). Rejected — adds visual noise in a minimal sidebar. The single ← link is sufficient for wayfinding.

### 2.6 Back Behavior

**Complete back-button contract:**

| User is on | Presses Back | Lands on |
|:-----------|:-------------|:---------|
| `/workspace` (card list) | Browser back | Previous app page (login, landing, etc.) |
| `/workspace/alex` (editing) | Browser back | `/workspace` (card list) |
| `/workspace/alex/design` | Browser back | `/workspace/alex` (identity tab) |
| `/workspace/alex` after switching from `/workspace/beth` | Browser back | `/workspace/beth` |

**Back with unsaved changes:**
- `popstate` event listener checks `saveState`
- If dirty, calls `event.preventDefault()` + `history.pushState()` to stay, then shows confirmation dialog
- If user confirms discard, manually navigates back

### 2.7 Workspace State Persistence

**Design: Tiered persistence strategy.**

| State | Storage | Rationale |
|:------|:--------|:----------|
| Active card slug | URL (`/workspace/{slug}`) | Sharable, survives tab duplication, history-native |
| Active editor tab | URL (`/workspace/{slug}/design`) | Sharable, bookmarkable |
| Zoom level | sessionStorage (existing) | Personal preference, tab-scoped |
| Sidebar collapsed | sessionStorage (existing) | Personal preference |
| Editor session token | sessionStorage (existing) | Security — never in URL |
| Card data (profile, appearance) | Zustand in-memory + server re-fetch | Always fresh on navigation; no stale data risk |
| Dirty/unsaved changes | Zustand in-memory + dirty guard | Warn before navigation; save or discard |

**Last active card memory:**
- On card open, write `localStorage.setItem("workspace-v2:lastCard", slug)`
- On `/workspace` (card list) load, if user has cards and a `lastCard` exists, auto-navigate with `router.replace()`
- Only for multi-card users; single-card users navigate directly (existing behavior)
- `localStorage` survives tab closure (unlike `sessionStorage`)

### 2.8 User Journey — Redesigned

#### First-Time User

```
1. /login → enter access code
2. Redirect to /workspace
3. Server auto-creates first card
4. Redirect to /workspace/{new-slug}
5. CardEditorProvider hydrates → PreviewSync renders
6. User sees the editor immediately (no card list for single-card users)
```

(Steps 3-4 unchanged from current — the auto-create flow works correctly.)

#### Returning User (multiple cards)

```
1. /workspace
2. Server loads cards[], sees lastCard in localStorage
3. If lastCard exists and is in cards[]:
   a. router.replace(/workspace/{lastCard})  ← uses replace (no history for auto-nav)
   b. User lands directly in the editor
4. If no lastCard or card was deleted:
   a. Render card list
   b. User clicks a card → router.push(/workspace/{slug})
```

#### Switching Cards

```
1. User is editing /workspace/alex
2. Clicks "Design Portfolio" in sidebar card switcher
3. Dirty guard: "You have unsaved changes. Discard them?" → Discard
4. openCustomerCardAction("design-portfolio") → storeEditorSession()
5. router.push("/workspace/design-portfolio")
6. New history entry created
7. Server fetches new card → hydrates editor
8. User presses Back → returns to /workspace/alex
```

#### Switching Editor Tabs

```
1. User is on /workspace/alex (identity tab)
2. Clicks "Design" in sidebar
3. router.push("/workspace/alex/design")
4. History entry created
5. Inspector switches to DesignStudioSection
6. User presses Back → returns to /workspace/alex (identity tab)
```

---

## 3. Implementation Roadmap

### Phase A: Route Restructuring (no visual changes)

1. Create `src/app/workspace/[slug]/page.tsx` — card editor route
2. Create `src/app/workspace/[slug]/[[...tab]]/page.tsx` — card editor with tab
3. Update `src/app/workspace/page.tsx` — card list only (remove slug-handling logic)
4. Update `buildWorkspaceBuilderPath` → `buildWorkspacePath(slug, tab?)`
5. Update all `router.replace(buildWorkspaceBuilderPath(...))` → `router.push(buildWorkspacePath(...))`
6. Wire `[[...tab]]` to `useWorkspaceStore.setActiveSection()`

### Phase B: Navigation Hierarchy

1. Add breadcrumb ("← All Cards") to sidebar
2. Add visual separators between card switcher / section tabs / user footer
3. Update `CardSelector` to use proper session creation
4. Wire last-card memory via localStorage

### Phase C: Dirty State Guard

1. Add `popstate` listener for unsaved-changes warning
2. Add confirmation dialog component
3. Wire into card switching and back navigation

### Phase D: Polish

1. Smooth transitions between card list and editor
2. Loading skeleton during card switch
3. Test full user journeys

---

## 4. What Does NOT Change

- Visual design — colors, typography, spacing, shadows, radii
- Shell layout — 3-column grid (sidebar | canvas | inspector)
- Preview rendering engine
- Theme engine
- Identity and Design editors
- Save flow and API endpoints
- Card editor store (Zustand)
- Workspace UI store (Zustand)
- All backend architecture

---

*End of UX Architecture document.*
