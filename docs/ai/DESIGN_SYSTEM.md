---
name: Tapp Design System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5e60'
  on-secondary: '#ffffff'
  secondary-container: '#dfdfe1'
  on-secondary-container: '#616365'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2c0050'
  on-tertiary-container: '#ae57ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e4'
  secondary-fixed-dim: '#c6c6c8'
  on-secondary-fixed: '#1a1c1d'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0050'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
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
  label-upper:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-xl: 128px
  stack-lg: 64px
  stack-md: 32px
---

## Brand & Style

This design system is built on the principles of **Editorial Minimalism** and **Tactile Digitalism**. It is designed to bridge the gap between high-end physical stationery and fluid digital interaction. The aesthetic is inspired by premium lifestyle publications and Apple’s hardware-software cohesion, focusing on extreme clarity, immense whitespace, and a sense of "quiet luxury."

The design narrative centers on the "Object as Interface." Every card, button, and surface should feel like a physical artifact suspended in a digital void. To achieve this, we utilize a **Liquid Glass** style—a refined evolution of glassmorphism that uses ultra-subtle backdrop blurs, micro-fine borders, and high-quality typography to create a sense of depth without visual noise.

**Key Attributes:**
- **Breathable:** Massive margins and generous line heights.
- **Intentional:** Every element exists for a specific functional purpose.
- **Refined:** Precision in alignment and micro-interactions.
- **Premium:** High-contrast color play between deep blacks and pure whites.

## Colors

The palette is rooted in an achromatic foundation to allow professional profile photography and brand logos to stand out. 

- **Foundation:** Pure White (#FFFFFF) serves as the primary canvas, creating an expansive, gallery-like feel.
- **Structure:** Soft Gray (#F5F5F7) is used for subtle grouping, sectioning, and background layers to distinguish the "page" from the "component."
- **Authority:** Deep Black (#000000) is reserved for primary typography and high-impact calls to action, ensuring maximum readability and an editorial weight.
- **Accentuation:** Subtle Purple (#8E2DE2) and Soft Blue (#4A90E2) are used sparingly for interactive highlights, active states, and "magic" moments (like NFC connection success).

Color should be used as a wayfinder, not as decoration.

## Typography

The typography uses **Inter** to achieve a neutral, modern, and highly legible look that mimics the precision of Swiss design. 

The system relies on extreme scale contrast. Headlines are tight, bold, and authoritative, while labels use generous tracking (letter-spacing) to create an airy, architectural feel. 

**Usage Guidelines:**
- **Display:** Used for hero sections and impact statements. On mobile, the size reduces significantly to maintain the "one-screen" view.
- **Body:** Aim for a "comfortable" read. Body-lg is preferred for introductory text.
- **Labels:** Always use the uppercase variant for category headers or small metadata to distinguish them from functional body text.

## Layout & Spacing

This design system employs a **Fluid Grid** with fixed maximum constraints to ensure the content feels grounded on large displays. 

- **The Rhythm:** We use an 8px base unit. Vertical rhythm is critical; use `stack-xl` (128px) between major sections to emphasize the "editorial" whitespace.
- **Mobile:** A 4-column grid with 20px side margins. Content should occupy full width or span 2 columns for smaller cards.
- **Desktop:** A 12-column grid. Most profile content should be centered in a 6-column or 8-column "reading lane" to prevent eye strain.
- **Safe Zones:** Use `stack-md` (32px) as the default internal padding for large cards and containers.

## Elevation & Depth

Depth is conveyed through **Liquid Glass** layers rather than traditional drop shadows.

1.  **Base Layer:** The white background (#FFFFFF).
2.  **Surface Layer:** Soft Gray (#F5F5F7) containers with 0% opacity backgrounds and 40px backdrop blurs to create a "frosted" effect.
3.  **Borders:** Instead of heavy shadows, use a 1px solid border with 10% opacity black. For dark mode/dark elements, use 10% white.
4.  **Shadows:** When shadows are necessary for focus (e.g., a floating Action Button), use a "Long Ambient" shadow: `0px 20px 50px rgba(0,0,0,0.05)`. It should be barely perceptible but provide a sense of "lift."

## Shapes

The shape language is dominated by large, friendly radii that mirror the corners of modern mobile devices.

- **Primary Radius:** Use `rounded-xl` (1.5rem / 24px) for all primary cards, profile photos, and large containers.
- **Interactive Radius:** Buttons and input fields should also utilize `rounded-xl` to maintain a consistent silhouette.
- **Micro Radius:** For small elements like chips or badges, use a full "pill" shape (100px) to distinguish them as secondary interactive elements.

## Components

### Buttons
- **Primary:** Deep Black (#000000) background, White (#FFFFFF) text. High-contrast, no shadow. 24px corner radius.
- **Secondary:** Liquid Glass (frosted) background with a 1px Subtle Gray border.
- **Ghost:** No background, Blue or Purple text for low-priority actions.

### Cards (The "Tapp" Card)
The central component of the system.
- Background: Either Deep Black or a subtle gradient (Purple to Blue).
- Radius: 24px.
- Typography: Use `headline-md` for names and `label-upper` for titles.
- Interaction: On hover, a subtle scale increase (1.02x) and an increase in backdrop blur intensity.

### Input Fields
- Understated style. A 1px bottom border is preferred for a "stationery" look, or a Liquid Glass container for a more modern app feel.
- Placeholder text: Soft Gray, using `body-md`.

### Chips & Badges
- Pill-shaped. Backgrounds should be a 5% opacity version of the accent colors (Purple/Blue) to keep the look light and professional.

### Lists
- Use generous vertical padding (24px) between list items. Use a 1px `divider` (#F5F5F7) that does not span the full width of the container (inset by 24px).
