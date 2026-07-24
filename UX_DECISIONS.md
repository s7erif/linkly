# Workspace UX Decisions

## Product posture

The Workspace is a creative tool, not a record-management dashboard. The preview is the primary artifact; controls are compact properties that support it.

## Information architecture

The left rail uses a single-open accordion so users keep context without navigating away or scanning an endless form. Profile and Appearance lead because they answer the two primary questions: “what does my card say?” and “what does it feel like?” Links, Buttons, and Advanced remain discoverable without competing for initial attention.

Profile fields are grouped by intent—Basic, Contact, About—instead of by storage shape. Appearance controls use token-oriented groups and segmented choices for fast visual comparison.

## Presets

Presets remain data-only collections of `AppearanceSettings`. Their thumbnails are generated from their actual color/background values, so selecting Default, Minimal, Dark, Luxury, Coffee, Ocean, or Sunset applies the exact same persisted settings used by the renderer. No theme component is selected or swapped.

## Preview as hero

The middle column receives approximately 56% of desktop space. A subtle dot grid communicates an editable canvas without adding decoration to the public card itself. Mobile/Desktop changes frame width; 100%/Fit changes scale; Public View opens the actual published route. There are no inert toolbar controls.

## Save feedback

Explicit save remains because the existing application has no autosave contract. A sticky bar keeps the action available without forcing users to reach the end of a form. Its state is visible as saved, dirty, saving, or failed. Preview updates remain immediate and independent from persistence.

## Visual system

- Neutral canvas and white property cards keep user content dominant.
- A compact 8px-derived spacing rhythm, 8–14px control radii, and 14px panel radii create consistency.
- Low-contrast borders and restrained shadows reduce visual noise.
- Hover lift is reserved for selectable presets and primary actions.
- Visible focus rings and semantic buttons/labels support keyboard operation.
- Accordion, canvas frame, button, and state transitions use short 160–300ms motion.

## Contract-aware omissions

No fake controls were introduced. The existing contracts cannot persist avatar media, background images, independent surface/border values, or font scale/weight. The profile initials treatment communicates the current renderer behavior. Expanding those tokens requires a separately approved domain/DTO/API change, outside Sprint 7.
