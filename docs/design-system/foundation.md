# OI Premium Design System Foundation

## Canonical implementation

The canonical UI foundation lives in `src/design`. Product pages consume semantic tokens and exported primitives; they do not import palette values, shadows, blur amounts, animation curves, or dimensions directly.

Import global CSS once through `src/design/index.css`. Import React components from `@/design/components`, forms from `@/design/forms`, layout primitives from `@/design/primitives`, and navigation from `@/design/navigation`.

## Visual principles

OI is minimal, light, precise and dimensional. Typography and spacing establish hierarchy. Crystal surfaces create separation through transparency, internal light, refraction-like saturation, a reflective one-pixel edge and layered low-alpha shadows. Glass never compensates for weak hierarchy.

Avoid opaque frosted panels, strong blur, thick borders, saturated gradients, neon glows, large scale animation, and one-off values.

## Token families

- Semantic color: primary, neutral, success, warning, danger, information, backgrounds, surfaces, text, border, overlay, muted, focus, hover and disabled.
- Typography: Display XL, Display L, H1–H4, Body Large, Body, Small, Caption, Button and Label.
- Geometry: spacing, containers, grids, breakpoints, radii, controls, header, sidebar, section and card dimensions, z-index and safe areas.
- Depth: solid surfaces, five crystal-glass levels, borders, blur, saturation, internal highlights and layered shadows.
- Motion: fast, normal, slow, hero, spring, hover, press, exit, page, reveal, card, floating, glow and focus.

## Glass scale

Use the smallest sufficient level.

- Glass XS: compact controls and chips.
- Glass SM: toolbars and compact floating panels.
- Glass MD: cards and grouped content that need environmental depth.
- Glass LG: navigation, drawers and large floating panels.
- Glass XL: dialogs, command surfaces and hero-level overlays.

Every level has a background, blur, saturation, reflective border, internal highlight, shadow and hover treatment. Always include the solid fallback emitted by the surface utilities. Avoid stacking multiple high-blur layers directly on top of one another.

## Accessibility and performance

Semantic components preserve native HTML behavior, visible focus, disabled states, labels and ARIA relationships. Text and essential controls must meet WCAG AA contrast independently of backdrop content. Motion uses opacity and transform, respects `prefers-reduced-motion`, and never blocks interaction. Backdrop effects are progressive enhancement and must degrade to the semantic surface token.

## Migration contract

UX-1, UX-2 and UX-3 should compose these tokens and components instead of creating page-local visual primitives. New reusable behavior belongs in `src/design`; business-aware composition belongs in its feature directory.
