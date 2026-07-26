---
name: Quiet Luxury Identity
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f1ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f3'
  surface-container-highest: '#e5e0ed'
  on-surface: '#1c1b24'
  on-surface-variant: '#474555'
  inverse-surface: '#312f39'
  inverse-on-surface: '#f3effc'
  outline: '#787586'
  outline-variant: '#c8c4d7'
  surface-tint: '#5643de'
  primary: '#5441dc'
  on-primary: '#ffffff'
  primary-container: '#6d5df6'
  on-primary-container: '#fffcff'
  inverse-primary: '#c6c0ff'
  secondary: '#5b4bc5'
  on-secondary: '#ffffff'
  secondary-container: '#9182ff'
  on-secondary-container: '#270192'
  tertiary: '#924800'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75c00'
  on-tertiary-container: '#fffcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c6c0ff'
  on-primary-fixed: '#150066'
  on-primary-fixed-variant: '#3d22c6'
  secondary-fixed: '#e5deff'
  secondary-fixed-dim: '#c7bfff'
  on-secondary-fixed: '#180065'
  on-secondary-fixed-variant: '#4330ac'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb785'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#fcf8ff'
  on-background: '#1c1b24'
  surface-variant: '#e5e0ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system embodies "Quiet Luxury"—a sophisticated, editorial aesthetic tailored for a high-end digital identity studio. It prioritizes clarity, intentional whitespace, and a tactile quality reminiscent of premium physical stationery. 

The visual direction is **Editorial Minimalism** infused with **Liquid Glass** elements. This creates a sense of depth and lightness through subtle translucency and fine-line detailing. The interface should feel "expensive" yet approachable, avoiding aggressive marketing tropes in favor of an understated, confident presence that allows the studio's portfolio to take center stage.

## Colors
The palette is rooted in a warm, off-white foundation to avoid the sterile feel of pure digital white.

- **Foundations:** Use `#FCFCFD` for the main page background. Layer `#FFFFFF` surfaces on top to create physical-like depth.
- **Accents:** Lavender tones are used sparingly. `#6D5DF6` is reserved for primary actions, while `#EDE9FE` provides a soft, non-intrusive background for secondary chips or highlights.
- **Contrast:** High legibility is maintained with Onyx text against the warm white backdrop, ensuring an editorial feel. 
- **Constraint:** Dark mode is strictly excluded to preserve the high-end stationery brand identity.

## Typography
The typography system relies on **Inter** to achieve a modern, Swiss-inspired precision. 

- **Hierarchy:** Dramatic scale shifts between display titles and body text evoke a magazine-style layout. 
- **Display:** Utilize tight letter spacing (-0.04em) for large headlines to create a "locked-in" professional look.
- **Labels:** Small labels use uppercase styling with increased letter spacing to provide a structural, architectural feel to the UI.
- **Execution:** Ensure optical sizing is active to maintain the elegance of the letterforms at extreme scales.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous "breathing room" to emphasize the luxury positioning.

- **Rhythm:** An 8px base unit governs all padding and margins.
- **Desktop:** A 12-column grid with wide 64px outer margins to frame content like a gallery piece.
- **Mobile:** Margins tighten to 20px, but vertical rhythm remains expansive to prevent a cramped feeling.
- **Composition:** Align elements to a central axis for a balanced, symmetrical editorial look, or use staggered offsets for portfolio showcases.

## Elevation & Depth
Depth is created through a combination of **Liquid Glass** and **Ambient Long Shadows**.

- **Liquid Glass:** Use `backdrop-filter: blur(12px)` on floating headers and overlay cards. Pair this with a 1px solid border in `#ECECEC` at 50% opacity to mimic the edge of a glass pane.
- **Shadows:** Avoid "muddy" or dark shadows. Use extremely diffused, large-radius shadows with very low opacity (e.g., `box-shadow: 0 20px 50px rgba(0,0,0,0.03)`).
- **Layering:** Elements closer to the user receive more blur and a slightly more pronounced shadow, while base cards sit flat with only a subtle 1px border.

## Shapes
The design system uses a signature **24px (rounded-xl)** corner radius for all primary containers and surfaces. 

- **Primary Surfaces:** Large cards and modal containers use the full 24px radius to create a soft, approachable silhouette.
- **Interactive Elements:** Buttons and input fields scale down to a 12px (rounded-lg) radius to maintain a cohesive look without appearing overly "bubbly."
- **Icons:** Should follow a similar soft-cornered aesthetic, avoiding sharp 90-degree angles.

## Components
- **Buttons:** Primary buttons use the Lavender gradient (`#6D5DF6` to `#8B7CF8`) with white text. Secondary buttons use a transparent background with a 1px border and a subtle glass blur.
- **Cards:** Use `#FFFFFF` with a 24px corner radius and a 1px `#ECECEC` border. Apply the ambient long shadow on hover to indicate interactivity.
- **Inputs:** Fields should be `#F7F7F8` with no border initially, transitioning to a white background with a lavender border on focus.
- **Chips/Badges:** Use the muted lavender `#EDE9FE` for background with `#6D5DF6` for the text. Keep edges highly rounded (pill-shaped).
- **Lists:** Use generous vertical padding (20px+) between list items, separated by a hairline 1px divider in `#ECECEC`.
- **Identity Elements:** Incorporate "Studio Stamps"—small, uppercase, bordered labels—to mark sections, adding to the stationery feel.