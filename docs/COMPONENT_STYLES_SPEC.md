# Component Styles — Product Design Specification
**Status:** Approved  
**Version:** 1.0  
**Author:** Lead Product Designer  

---

## 1. Current UI Analysis

### What Works
- The Design Token architecture is solid — every change flows through `composeTokens()` → `ThemeProvider` → Preview
- The MiniPreviewEngine already renders real production components (ProfileCard, ProfileAvatar, ButtonRenderer) inside ThemeProvider — zero fake graphics
- Store integration is correct — `patchAppearance()` updates immediately, PreviewSync re-renders
- Shadow/radius values are properly mapped (NONE→0px, SMALL→6%, MEDIUM→9%, LARGE→14%)

### What Fails
- **Visual hierarchy is flat.** Every section looks identical. Users scan and see nothing.
- **Spacing is cramped.** Sections sit on top of each other with thin dividers.
- **Selected state is weak.** A 2px ring on a white card is barely visible.
- **Cards feel like settings, not choices.** Buttons sized for text, not visuals.
- **Typography is inconsistent.** Bold labels compete with preview content.
- **The "Advanced" section is open by default mentality.** It should be closed.
- **Four avatar columns are too narrow** — previews get squeezed.
- **No breathing room.** Everything feels like an admin panel, not a design tool.

### Cognitive Load
- Users must parse label text to understand each option
- Flat vs Elevated vs Floating vs Glass — labels carry the burden
- The preview thumbnails are too small to convey the visual difference

### Information Architecture
- Three unrelated sections (Cards, Buttons, Avatar) stacked vertically
- No visual anchor points
- No progressive disclosure
- Advanced controls shown at the bottom without clear affordance

---

## 2. Design Principles

1. **Visual-first** — Previews carry the meaning. Labels support, not lead.
2. **Minimal** — Remove everything that isn't the preview or the label.
3. **Premium** — White surfaces, large whitespace, soft shadows, nothing feels cramped.
4. **Calm** — One decision per section. No competing elements.
5. **Spacious** — 24px+ between sections. 16px between cards.
6. **Highly discoverable** — Large previews make options obvious without reading.
7. **WYSIWYG** — Every preview uses the REAL production component, scaled.
8. **One decision per interaction** — Click one card. See it change. No confirmation.

---

## 3. Design System

### Spacing
```
section-gap:    32px     (between major sections)
card-gap:       16px     (between style cards)
card-padding:   20px     (inside each card)
preview-height: 96px     (card previews)
preview-height: 72px     (button previews)  
preview-height: 64px     (avatar previews)
label-gap:      12px     (preview → label)
```

### Grid
```
2 columns for Card styles (2×2 grid)
3 columns for Button styles (1×3 grid)
4 columns for Avatar styles (1×4 grid)

Cards:     4 options → 2×2
Buttons:   3 options → 1×3
Avatars:   4 options → 1×4
```

### Corner Radius
```
style-card:     20px     (rounded-2xl)
preview-area:   14px     (rounded-xl)
active-ring:    20px     (matches card)
```

### Shadow System
```
card-rest:      none                          (white card, no shadow needed)
card-hover:     0 2px 12px rgba(0,0,0,0.04) (subtle lift)
card-active:    0 0 0 2px #1a1a1a            (dark ring, no shadow)
card-hover+active: 0 2px 12px rgba(0,0,0,0.04), 0 0 0 2px #1a1a1a
```

Note: Cards use a flat design with a dark ring for selection, NOT colored shadows. This is cleaner and closer to Linktree/Framer.

### Typography
```
section-title:  12px / 700 / -0.01em    (text-sm font-bold tracking-tight)
card-label:     11px / 600              (text-[11px] font-semibold)
```

### Color Hierarchy
```
card-bg:        white
card-bg-hover:  white
card-border:    transparent
card-border-hover: slate-200
selected-ring:  slate-900 (dark, visible, no ambiguity)
section-divider: none (spacing replaces dividers)
```

### States
```
Rest:           white bg, no border, no shadow
Hover:          2px translateY, subtle shadow, visible border
Pressed:        scale(0.98), 80ms
Selected:       dark 2px ring, subtle shadow
Focus:          2px slate-900 ring, 2px offset
```

### Motion
```
hover-enter:    150ms ease-out
hover-leave:    200ms ease-out
press:          80ms ease-out
section-collapse: 200ms ease-out (height + opacity)
active-transition: 150ms ease-out (ring appears)
```

---

## 4. Component Styles Experience

### Card Style Section
```
┌──────────────────────────────────────────┐
│  Card                                     │
│                                          │
│  ┌──────────────┐  ┌──────────────┐     │
│  │              │  │              │     │
│  │   [card]     │  │   [card]     │     │
│  │   preview    │  │   preview    │     │
│  │              │  │              │     │
│  │   Flat       │  │  Elevated    │     │
│  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐     │
│  │              │  │              │     │
│  │   [card]     │  │   [card]     │     │
│  │   preview    │  │   preview    │     │
│  │              │  │              │     │
│  │  Floating    │  │   Glass      │     │
│  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────┘
```

**Visual strategy:** Each card is 96px tall. The preview area fills 80% of the card height. The label sits below, small and muted. The preview IS the content — the label is secondary.

### Button Style Section
Same pattern. 1×3 grid. 72px preview height.

### Avatar Style Section
Same pattern. 1×4 grid. 64px preview height.

---

## 5. Style Card Specification

Every style card is:
- `bg-white` — bright, clean surface
- `rounded-2xl` (20px) — soft, premium
- No border at rest
- `border border-slate-200` on hover — gentle reveal
- `-translate-y-0.5` + `shadow-sm` on hover — subtle lift
- No colored backgrounds — Linktree uses white cards, we do too

### Active/Selected:
- `ring-2 ring-slate-900` — dark ring, immediately visible
- `shadow-md` — slight elevation to confirm it's "pressed down / selected"

### Preview Area:
- Centered vertically and horizontally
- Fills card width minus 16px padding
- 96px tall for cards, 72px for buttons, 64px for avatars
- Renders REAL component via MiniPreviewEngine
- Zero fake graphics

### Label:
- 11px, font-semibold, slate-700
- Centered below preview
- 12px gap from preview bottom

---

## 6. Preview Architecture

```
<StyleCard onClick={applyPreset}>
  <MiniPreviewEngine 
    kind="card"           // "card" | "button" | "avatar"
    appearance={merged}   // base appearance + preset override
  />
  <Label>{preset.label}</Label>
</StyleCard>
```

`MiniPreviewEngine` already exists and:
1. Creates a ThemeProvider with the merged appearance
2. Renders the real ProfileCard / ProfileAvatar / ButtonRenderer inside
3. No fake graphics — uses the same resolveTokens() as the phone preview

---

## 7. Design Token Mapping

| Preset | Token Change |
|--------|-------------|
| Flat | `shadow: "NONE"`, `borderRadius: 6` |
| Elevated | `shadow: "MEDIUM"`, `borderRadius: 16` |
| Floating | `shadow: "LARGE"`, `borderRadius: 24` |
| Glass | `shadow: "SMALL"`, `borderRadius: 24` |
| Filled | `buttonStyle: "SOLID"` |
| Outline | `buttonStyle: "OUTLINE"` |
| Soft | `buttonStyle: "SOFT"` |
| Circle | `borderRadius: 32` |
| Squircle | `borderRadius: 20` |
| Rounded | `borderRadius: 12` |
| Square | `borderRadius: 4` |

---

## 8. Advanced Controls

Collapsed by default. Revealed by clicking "Advanced" — a small text link with a chevron.

Contains:
- Corner Radius slider (0–32px)
- Shadow Depth slider (0–3, maps to NONE/SMALL/MEDIUM/LARGE)

These are escape hatches for power users. Most users should never need them because the visual presets cover the common cases.

---

## 9. Accessibility

- All style cards are `<button>` elements — keyboard focusable
- Minimum hit target 44×44px (cards are ~160×140px — well above minimum)
- Focus ring: `ring-2 ring-slate-900 ring-offset-2`
- Tab order: left to right, top to bottom within each section
- aria-label on each card: e.g., "Card style: Flat"
- WCAG AA: slate-700 (#334155) on white (#FFFFFF) = 9.4:1 contrast ratio (passes AAA)

---

## 10. Success Test

**Hide all labels.** A user should identify every option within 1 second:

| Card | Identifying feature |
|------|-------------------|
| Flat | No shadow, sharp corners |
| Elevated | Medium shadow, rounded corners |
| Floating | Large shadow, very round corners |
| Glass | Subtle shadow, very round corners |
| Filled | Solid purple button |
| Outline | Bordered transparent button |
| Soft | Tinted purple button |
| Circle | Fully round avatar |
| Squircle | Softly rounded avatar |
| Rounded | Moderately rounded avatar |
| Square | Sharp square avatar |

If any pair is ambiguous, increase the contrast between them.

---

## 11. Implementation Plan

1. The `mini-preview-engine.tsx` already exists — no changes needed
2. Rewrite `component-style-panel.tsx` to match this spec exactly
3. Verify every preset produces an immediately visible change in the phone preview
4. Zero TypeScript errors, zero lint errors

---

*End of Product Design Specification*
