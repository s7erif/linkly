# Tapp Workspace V2: Phase 1 Implementation Plan (Foundation)

**Role:** Staff Frontend Engineer
**Objective:** Establish a stable, high-performance UI framework and responsive shell for the Tapp Workspace V2, optimized for a Next.js production environment.

---

## 1. Project Directory Structure (Phase 1 Focus)
```text
src/
├── app/
│   └── workspace/
│       ├── layout.tsx         # Root Shell (Grid provider, Layout persistence)
│       └── page.tsx           # Page-level orchestrator (Region mounting)
├── components/
│   ├── ui/                    # Atomic, headless-first UI library
│   │   ├── button.tsx         # Primary, Secondary, Ghost variants
│   │   ├── card.tsx           # Base surface with "Quiet Luxury" shadows
│   │   ├── input.tsx          # Understated stationery-style inputs
│   │   ├── scroll-area.tsx    # Custom-themed scrollbars (Radix-based)
│   │   └── separator.tsx      # Micro-fine dividers
│   ├── workspace/             # Domain-specific structural components
│   │   ├── shell/
│   │   │   ├── sidebar.tsx    # Fixed left navigation (Arc-inspired)
│   │   │   ├── toolbar.tsx    # Top action bar (Floating/Docked)
│   │   │   └── inspector.tsx  # Right-side contextual editing container
│   │   └── shared/
│   │       ├── section-header.tsx
│   │       └── inspector-card.tsx
├── styles/
│   └── globals.css            # Tailwind + CSS Variable Design Tokens
├── lib/
│   ├── utils.ts               # cn() helper for Tailwind merging
│   └── constants/             # Z-index stack, layout dimensions
└── store/
    └── use-workspace-store.ts # Lightweight state for layout/navigation
```

---

## 2. Design Token Integration (Tailwind Configuration)
We map the **Quiet Luxury Identity** into a set of semantic CSS variables.

### Colors
- `--surface`: `#FCFCFD`
- `--surface-overlay`: `#FFFFFF`
- `--primary`: `#6D5DF6` (Tapp Lavender)
- `--text-primary`: `#1A1A1A`
- `--outline`: `#ECECEC`

### Geometry & Elevation
- `--radius-studio`: `24px`
- `--shadow-premium`: `0 20px 50px rgba(0,0,0,0.04)`

---

## 3. Component Hierarchy & Responsibilities

### 3.1 Structural Shell
- **`WorkspaceLayout`**: The 3-column grid manager. Uses `grid-template-columns: 260px 1fr 420px`. Handles global scroll-lock.
- **`SideNavBar`**: Fixed-width wayfinding. Responsibilities: Tab routing, User profile quick-access, Storage status.
- **`TopToolbar`**: Floating high-z-index controls. Responsibilities: Undo/Redo stack (UI only), Zoom controls, Global Publish CTA.
- **`InspectorPanel`**: The contextual editor region. Features a `ScrollArea` and standard `InspectorHeader`.

### 3.2 Reusable UI Library
- **`Card`**: Implements the "Object as Interface" philosophy—white background, fine border, premium shadow.
- **`Button`**: Tailwind-variants (cva) for Primary, Secondary (Liquid Glass), and Ghost states.
- **`Input`**: Focuses on typography and minimal borders to maintain the "Editorial" look.

---

## 4. Implementation Checklist & Acceptance Criteria

### Phase 1.1: Environment & Tokens
- [ ] Tailwind theme extended with `Tapp` custom tokens.
- [ ] CSS variable system initialized for Light Mode.
- [ ] Global typography scales defined (Inter).

### Phase 1.2: Root Shell
- [ ] `WorkspaceLayout` correctly maps the 3-column desktop grid.
- [ ] Responsive breakpoints implemented: Sidebar/Inspector collapse to drawer on smaller viewports (Tablet).
- [ ] `Sidebar` navigation active with hover/active states.

### Phase 1.3: Component Atomic Foundation
- [ ] `Button`, `Input`, and `Card` components exported with full type safety.
- [ ] `InspectorCard` layout verified for consistent vertical rhythm (stack-md).
- [ ] `Toolbar` maintains its floating position with backdrop-blur support.

---

## 5. Future Extension Points
- **Phone Scaling Logic**: The `CenterStage` flex-grow region is ready to receive the `LivePhonePreview` with CSS `scale()` transforms.
- **Zustand Persistence**: `useWorkspaceStore` is prepared for local storage persistence for UI states (collapsed/expanded).
- **A11y Layer**: Standard Radix primitives used for all `ui/` components to ensure keyboard navigation is baked-in from Day 1.

---
*End of Phase 1 Specification*
