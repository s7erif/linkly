# Tapp Workspace V2: Implementation Architecture Blueprint
**Version:** 1.0 (Frozen Foundation)
**Status:** Implementation Ready
**Architecture Type:** Next.js / React UI Migration

---

## 1. Component Hierarchy
The workspace follows a recursive "Shell > Region > Container > Component" hierarchy to ensure modularity.

### 1.1 Global Shell
- `WorkspaceLayout`: The parent wrapper managing the 3-column grid and global state.
  - `SideNavBar`: Fixed-width (260px) application wayfinding.
  - `CenterStage`: The flex-grow "Preview" region.
    - `Toolbar`: Minimal floating controls above the preview.
    - `LivePhonePreview`: The high-fidelity mobile emulator.
  - `InspectorPanel`: Fixed-width (420px) contextual editing column.
    - `InspectorHeader`: Contextual title and status.
    - `InspectorBody`: Scrollable region for editing cards.

---

## 2. Design Token System (Tailwind Mapping)
Referencing the **Quiet Luxury Identity** ({{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}}).

### 2.1 Colors
- `surface`: `#FCFCFD` (Base background)
- `surface-overlay`: `#FFFFFF` (Cards & surfaces)
- `outline`: `#ECECEC` (Subtle dividers)
- `primary`: `#6D5DF6` (Brand Lavender)
- `text-primary`: `#1A1A1A`
- `text-muted`: `#6B7280`

### 2.2 Geometry
- `radius-studio`: `24px` (Phone, Cards, Buttons)
- `shadow-ambient`: `0 20px 50px rgba(0,0,0,0.04)`
- `border-fine`: `1px solid var(--outline)`

---

## 3. Screen Breakdown & React Components

### 3.1 Identity Editor
- `ProfilePhotoUploader`: Circular dropzone with progress states.
- `EditorInput`: Text field with custom `label-upper` floating label.
- `BioTextarea`: Auto-expanding text area for "Narrative" section.
- `HandleList`: List component for connected social accounts.

### 3.2 Design Studio
- `ThemeCarousel`: Framer Motion-powered horizontal picker.
  - `ThemeCard`: Miniature preview with active/hover states.
- `VisualControlCard`: Generic container for design adjustments.
  - `TypographyPicker`: Visual font pairing selector.
  - `ColorPaletteGrid`: Discrete color selection dots.
  - `CornerRadiusSlider`: Visual pill-style selector.

### 3.3 Link Management
- `DraggableLinkList`: Reorderable list using `dnd-kit`.
  - `LinkCard`: Compact item with toggle, edit, and drag handle.
- `AddConnectionButton`: Large dashed-border CTA.

---

## 4. Interaction & State Management

### 4.1 State Sync
- **Local State**: UI-only toggles (collapsed sidebar, zoom level).
- **Global Context (`WorkspaceStore`)**: The active "Identity" JSON object.
  - Any change in the `InspectorPanel` triggers a shallow merge to `WorkspaceStore`.
  - `LivePhonePreview` subscribes to `WorkspaceStore` for real-time rendering.
- **Persistence**: Debounced (500ms) sync to existing backend API.

### 4.2 Animation Specs (Framer Motion)
- **Entrance**: `opacity: 0, y: 10` -> `opacity: 1, y: 0` (300ms easeOut).
- **Theme Switch**: Cross-fade (200ms) within the phone preview.
- **Hover**: Scale `1.02` with subtle shadow intensification.

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Sprint 1)
1. Initialize Tailwind theme with Design Tokens.
2. Build `WorkspaceLayout` shell and responsive grid.
3. Implement `WorkspaceStore` (Context/Zustand) for state sync.

### Phase 2: Core Regions (Sprint 2)
1. Build `LivePhonePreview` with responsive scaling.
2. Develop `SideNavBar` and navigation routing.
3. Create base `InspectorCard` components.

### Phase 3: Feature Workflows (Sprint 3-4)
1. **Design Studio**: Carousel and visual customization controls.
2. **Identity Editor**: Photo upload and profile inputs.
3. **Link Manager**: DnD integration and connection logic.

### Phase 4: Final Polish (Sprint 5)
1. Global transitions and motion layer.
2. Accessibility audit and keyboard navigation.
3. Performance optimization for live feedback loop.

---

## 6. Accessibility (A11y)
- **Contrast**: Enforce 4.5:1 ratio for all text on `#FCFCFD`.
- **Focus States**: High-visibility focus rings on all interactive `Inspector` elements.
- **Screen Readers**: `aria-live` regions for "Saving/Saved" status updates.
