# Tapp Workspace V2: Engineering Handbook & Implementation Specification

**Status:** Finalized Architecture (Frozen)
**Target Stack:** Next.js / React / Tailwind CSS / Framer Motion
**Migration Type:** UI/UX Layer Migration (Frontend Only)

---

## 1. Project Directory Structure
Following Next.js 13+ App Router conventions with a clear separation between features and core library.

```text
src/
├── app/
│   └── workspace/             # Main Workspace V2 route
│       ├── layout.tsx         # Global Shell (Sidebar + Grid)
│       └── page.tsx           # Page-level state orchestrator
├── components/
│   ├── ui/                    # Generic, headless UI (Buttons, Inputs, Cards)
│   ├── workspace/             # Workspace-specific domain components
│   │   ├── shell/             # Navigation, Toolbar, Layout regions
│   │   ├── preview/           # Live Phone Emulator & Scaling
│   │   └── inspector/         # Contextual Editor Panels & Cards
│   └── shared/                # Profile-rendering components (shared with public pages)
├── hooks/
│   ├── use-workspace-store.ts # Central state management (Zustand/Context)
│   ├── use-autosave.ts        # Debounced API sync logic
│   └── use-viewport.ts        # Responsive scaling for preview
├── lib/
│   ├── constants.ts           # Design tokens, grid specs
│   └── utils.ts               # Tailwind merge, formatting
└── types/
    └── workspace.d.ts         # Identity JSON schema definitions
```

---

## 2. Component Inventory & Responsibilities

### 2.1 Shell Components (Structural)
| Component | Responsibility | Props | Dependencies |
| :--- | :--- | :--- | :--- |
| `WorkspaceLayout` | Root 3-column grid & global scroll lock. | `children` | Tailwind Grid |
| `SideNavBar` | Primary navigation & app wayfinding. | `activeTab`, `onTabChange` | `NavIcon` |
| `TopToolbar` | Global actions (Undo, Redo, Zoom, Publish). | `zoomLevel`, `status` | Framer Motion |

### 2.2 Preview Components (Hero)
| Component | Responsibility | Props | Dependencies |
| :--- | :--- | :--- | :--- |
| `LivePhonePreview` | High-fidelity mobile emulator frame. | `identityData`, `theme` | `device-frame.css` |
| `ProfileRenderer` | Recursive component to render public profile. | `blocks[]` | `SharedUI` |

### 2.3 Inspector Components (Contextual)
| Component | Responsibility | Props | Dependencies |
| :--- | :--- | :--- | :--- |
| `InspectorCard` | Container for editing groups (Identity, Design). | `title`, `icon`, `isExpanded` | `ui/Card` |
| `ThemeCarousel` | Horizontal scroll picker for themes. | `themes`, `selectedId` | `framer-motion` |
| `LinkEditor` | Reorderable list for connection management. | `links`, `onReorder` | `dnd-kit` |

---

## 3. Data Flow & State Management

### 3.1 Synchronous Preview Flow
1. **Action:** User interacts with `Inspector` (e.g., changes Name input).
2. **Local Update:** `Zustand Store` updates the `identity` object immediately.
3. **Reactive Render:** `LivePhonePreview` subscribes to the store; re-renders profile at 60fps.
4. **Debounced Sync:** `useAutosave` hook triggers after 500ms of inactivity.

### 3.2 Persistent Storage Flow
- **API Strategy:** Patch-only updates to the existing `/api/identity` endpoint.
- **Optimistic UI:** Show "Saving..." status in `TopToolbar` during inflight requests.
- **Rollback:** If API fails, notify user and revert local store to last "Saved" snapshot.

---

## 4. Migration Strategy
**Objective:** Replace the UI without breaking existing backend integrations.

1. **Side-by-Side Deployment:** Deploy Workspace V2 at `/workspace-v2`. Keep `/workspace` (Legacy) active for internal testing.
2. **Hook Abstraction:** Map new UI components to existing `useIdentity()` and `useProfile()` hooks. No logic changes.
3. **Data Parity:** Ensure the V2 component tree consumes the exact same JSON schema as the V1 dashboard.
4. **Feature Toggle:** Use a cookie-based flag (`tapp_v2_beta`) to route specific users to the new experience.

---

## 5. Animation & Interaction Specs

| Interaction | Trigger | Specification |
| :--- | :--- | :--- |
| **Tab Switch** | `onClick` (Nav) | Cross-fade (200ms) + 4px Y-translation. |
| **Theme Change** | `onSelect` | Layout transition on preview cards (Framer Motion `layout` prop). |
| **Hover** | `onMouseEnter` | Soft scale (1.02x) + Shadow intensification (`shadow-premium`). |
| **Panel Entry** | `Mount` | Staggered fade-in for inspector cards (50ms interval). |

---

## 6. Phased Implementation Roadmap

### Phase 1: Core Foundation (Sprint 1)
- [ ] Initialize Next.js structure.
- [ ] Define Tailwind theme with "Quiet Luxury" tokens.
- [ ] Build `WorkspaceLayout` shell and Sidebar navigation.

### Phase 2: Live Preview (Sprint 2)
- [ ] Implement `LivePhonePreview` with responsive scaling logic.
- [ ] Connect `WorkspaceStore` for real-time reactivity.
- [ ] Map existing `ProfileRenderer` to the new preview frame.

### Phase 3: Feature Inspectors (Sprint 3-4)
- [ ] Build `IdentityEditor` cards (Photo upload, Bio).
- [ ] Build `ThemeLibrary` carousel and visual controls.
- [ ] Build `LinkManager` with Drag-and-Drop integration.

### Phase 4: Polish & Performance (Sprint 5)
- [ ] Implement global motion layer (Entrance/Transitions).
- [ ] Add Loading/Empty states and Error boundaries.
- [ ] Final Accessibility audit (Keyboard nav, Screen readers).

---

## 7. Accessibility (A11y) Requirements
- **Focus States:** Every `Inspector` control must have a visible 2px lavender focus ring.
- **ARIA Labels:** Sidebar items must use `aria-label` for screen reader wayfinding.
- **Reduced Motion:** Wrap all Framer Motion components in `useReducedMotion()` checks.
- **Contrast:** Enforce 4.5:1 ratio for all metadata and labels.

---
*End of Handbook*