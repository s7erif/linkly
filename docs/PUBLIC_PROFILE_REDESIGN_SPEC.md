# Linkly Public Profile — Desktop-First Redesign Specification

**Status:** Proposal  
**Version:** 2.0  
**Role:** Senior Product Designer & UI Architect  

---

## 0. Current State Audit

### 0.1 What exists today

A single `CardRenderer` component renders the entire public profile. It receives resolved theme tokens (colors, typography, shape, shadow, spacing) from a `ThemeProvider` and layout options (alignment, width, spacing preset, section visibility, section order) from the card's appearance settings.

The component tree is:

```
Page (min-h-screen)
└── CardRenderer
    └── ThemeProvider
        └── div.w-full
            └── InnerRenderer
                └── ProfileCard (motion.div — background, shadow, radius, font)
                    ├── div (radial gradient overlay, absolute)
                    └── motion.div (flex-col, padding, animated entrance)
                        ├── div (widthClass: max-w-[360px] default)
                        │   ├── ProfileAvatar (132-156px, glow, breathing animation)
                        │   ├── ProfileHeader (name, headline, company, address)
                        │   └── ProfileBio (13-14px, line-clamp-2)
                        ├── div.h-6 (spacer)
                        └── div (action sections — NO width constraint)
                            ├── LinksRenderer
                            │   ├── ButtonRenderer[] (w-full, 50px/46px tall)
                            │   └── IconRenderer[] (48px circles)
                            ├── SocialIcons (44px circles)
                            ├── FooterActions (9px branding)
                            └── Content blocks (gallery, video, faq, map, rich text)
```

### 0.2 What works

- Mobile layout is solid — full-width, comfortable spacing, clear hierarchy
- Theme token system is architecturally sound — every visual property flows through tokens
- Framer Motion animations are tasteful (staggered entrance, spring physics, reduced-motion aware)
- Avatar glow + breathing animation creates a focal point
- Section ordering is flexible (configurable `sectionOrder` array)

### 0.3 What fails on desktop

| Issue | Root Cause | Severity |
|-------|-----------|----------|
| Card stretches to viewport width | No max-width on outer container | Critical |
| Excessive vertical whitespace | `min-h-full` chain from `min-h-screen` forces card height | Critical |
| Buttons span full viewport | Action sections div has no `widthClass` constraint | High |
| Flat page background | No page-level background treatment — card floats in white void | Medium |
| Monotonous link rhythm | All buttons identical except primary/secondary color swap — no visual differentiation between link types | Medium |
| Spacing doesn't scale | Same padding/gap values at all breakpoints — feels cramped at 1440p+ | Low |
| No desktop-only enhancements | Identical visual treatment at all breakpoints — misses opportunity for premium desktop feel | Low |

---

## 1. Design Principles (Desktop)

1. **Canvas depth** — The page is not a white void. It has atmosphere. Subtle background treatment creates a stage for the card.
2. **Content determines height** — The card is exactly as tall as its content. Never stretched. Never compressed.
3. **Proportional harmony** — Spacing follows a geometric scale. Nothing feels arbitrary.
4. **Links as interactions, not just anchors** — Each link has distinct personality through hover states, micro-animations, and platform-aware accents.
5. **Typography breathes** — Desktop gives us room for larger type, more generous line-height, and clearer hierarchy.
6. **Mobile preserved** — Every desktop change uses breakpoint-prefixed properties. Mobile is untouched.
7. **Theme-respecting** — All design tokens flow through the existing `resolveTokens()` pipeline. Nothing is hardcoded.

---

## 2. Page Composition — Wireframes

### 2.1 Desktop (1280px viewport)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ▲ Background Canvas                                                     │
│  │  Subtle radial gradient (primary color at 3-5% opacity, top-center)  │
│  │  Optional: micro-dot pattern overlay at 2% opacity                    │
│  │  Full viewport, z-0                                                   │
│                                                                          │
│                    ┌──────────────────────────┐                          │
│                    │                          │  ◄── Card Container       │
│                    │  ┌────────────────────┐  │      max-w-[448px]       │
│                    │  │                    │  │      mx-auto             │
│                    │  │   ●  Avatar        │  │      rounded-[32px]      │
│                    │  │   (140px)          │  │      shadow-elevated     │
│                    │  │   radial glow      │  │      bg-surface          │
│                    │  │                    │  │                          │
│                    │  │   Name             │  │                          │
│                    │  │   Headline         │  │                          │
│                    │  │   · Company        │  │                          │
│                    │  │   📍 Address       │  │                          │
│                    │  │                    │  │                          │
│                    │  │   Bio text         │  │                          │
│                    │  │   (2 lines)        │  │                          │
│                    │  │                    │  │                          │
│                    │  └────────────────────┘  │                          │
│                    │                          │                          │
│                    │  ┌────────────────────┐  │                          │
│                    │  │ ██ Primary CTA    ██│  │  ◄── Primary button     │
│                    │  └────────────────────┘  │      (platform accent)   │
│                    │                          │      w-full, 52px        │
│                    │  ┌────────────────────┐  │                          │
│                    │  │ ○ Secondary Link   │  │  ◄── Secondary button    │
│                    │  └────────────────────┘  │      (outline style)     │
│                    │  ┌────────────────────┐  │                          │
│                    │  │ ○ Tertiary Link    │  │                          │
│                    │  └────────────────────┘  │                          │
│                    │                          │                          │
│                    │     ◎  ◎  ◎  ◎  ◎      │  ◄── Social icons row    │
│                    │                          │                          │
│                    │  ───  Built with Linkly  │  ◄── Footer              │
│                    │                          │                          │
│                    └──────────────────────────┘                          │
│                                                                          │
│  ▼ End of content. Scroll only if needed.                                │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Laptop (1024px viewport)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  (Background canvas — same treatment)                      │
│                                                            │
│           ┌──────────────────────────┐                     │
│           │                          │  max-w-[420px]      │
│           │   (identical card        │                     │
│           │    content structure)    │                     │
│           │                          │                     │
│           └──────────────────────────┘                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 2.3 Tablet (768px viewport)

```
┌──────────────────────────────────────────────┐
│                                              │
│  (Background canvas — reduced intensity)     │
│                                              │
│      ┌──────────────────────────┐            │
│      │                          │            │
│      │   (same card structure)  │  max-w-[90vw]
│      │                          │  or 448px   │
│      │                          │  whichever  │
│      │                          │  is smaller │
│      └──────────────────────────┘            │
│                                              │
└──────────────────────────────────────────────┘
```

### 2.4 Mobile (<768px) — UNCHANGED

```
┌──────────────────────┐
│                      │
│  ┌────────────────┐  │
│  │                │  │
│  │  ● Avatar      │  │  w-full
│  │  Name          │  │  min-h-screen
│  │  Headline      │  │  px-6
│  │  Bio           │  │  pt-12 pb-12
│  │                │  │
│  │  ██ CTA ██    │  │
│  │  ○ Link       │  │
│  │  ○ Link       │  │
│  │  ◎ ◎ ◎ ◎    │  │
│  │  ─── footer   │  │
│  └────────────────┘  │
│                      │
└──────────────────────┘
```

---

## 3. Spacing System

### 3.1 Geometric Scale

```
Token          Mobile    Tablet    Desktop    Use
─────          ──────    ──────    ──────     ───
space-2xs      4px       4px       4px        Icon gap micro
space-xs       8px       8px       8px        Element siblings
space-sm       12px      14px      16px       Bio → buttons gap
space-md       16px      20px      24px       Section gap (between links)
space-lg       24px      28px      32px       Header → bio gap
space-xl       32px      40px      48px       Avatar → header gap
space-2xl      40px      52px      64px       Card top/bottom padding
space-3xl      48px      64px      80px       Page-level padding (viewport edge → card)
```

### 3.2 Card Internal Spacing Map

```
┌────────────────────────────────────┐
│  ▲  space-2xl (pt, desktop: 64px) │
│                                    │
│         ●  Avatar                  │
│         │                          │
│         ▼  space-xl (48px)         │
│                                    │
│      Name / Headline               │
│         │                          │
│         ▼  space-lg (32px)         │
│                                    │
│      Bio text                      │
│         │                          │
│         ▼  space-md (24px)         │
│                                    │
│   ██  Primary CTA                  │
│         │                          │
│         ▼  space-sm (16px)         │
│                                    │
│    ○  Secondary Link               │
│         │                          │
│         ▼  space-sm (16px)         │
│                                    │
│    ○  Tertiary Link                │
│         │                          │
│         ▼  space-md (24px)         │
│                                    │
│      ◎  ◎  ◎  ◎  ◎               │
│         │                          │
│         ▼  space-lg (32px)         │
│                                    │
│    ───  Footer                     │
│         │                          │
│  ▼  space-2xl (pb, desktop: 64px) │
└────────────────────────────────────┘
```

---

## 4. Responsive Breakpoints

### 4.1 Breakpoint Table

```
Breakpoint   Width       Card Max-Width    Card Padding    Behavior
──────────   ─────       ──────────────    ────────────    ────────
mobile       < 640px     w-full            24px (px-6)     Full-width, min-h-screen
sm           640-767px   420px             32px            Slightly narrower
md           768-1023px  90vw (max 448px)  40px            Tablet transition
lg           1024-1279px 448px             48px            Laptop
xl           1280-1535px 480px             56px            Standard desktop
2xl          1536px+     480px             64px            Large desktop / ultrawide

Note: Card max-width transitions smoothly between breakpoints.
      Card padding uses the geometric scale (Section 3).
```

### 4.2 Breakpoint Decision Table

```
Property              <640px        640-767px     768-1023px    1024-1279px   1280px+
────────────────────  ──────        ────────      ─────────    ──────────    ───────
Card max-width        none          420px         90vw/448px   448px         480px
Card padding-x        24px          32px          40px         48px          56px
Card padding-y        48px          52px          56px         60px          64px
Name font-size        26px          28px          30px         32px          32px
Headline font-size    11px          12px          12px         13px          13px
Bio font-size         13px          14px          14px         15px          15px
Bio line-clamp        2             2             3            3             4
Button primary h      50px          52px          52px         52px          52px
Button secondary h    46px          48px          48px         48px          48px
Social icon size      44px          44px          44px         44px          44px
Social icon gap       16px          18px          20px         20px          20px
Avatar size           132px         132px         140px        140px         140px
Section gap (links)   16px(space-md)18px         20px         24px          24px
Header→bio gap        24px          28px          32px         32px          32px
Avatar→header gap     40px          44px          48px         48px          48px
Page bg treatment     none          subtle        full         full          full
Footer font-size      9px           9px           9px          10px          10px
```

---

## 5. Typography Hierarchy

### 5.1 Type Scale

```
Element        Mobile          Tablet           Desktop          Weight    Tracking
───────        ──────          ──────           ───────          ──────    ────────
Name           26px            28px             32px             Semibold  -0.02em
Headline       11px            12px             13px             Semibold  +0.10em (uppercase)
Company        (merged w/headline via • separator)
Address        12px            13px             14px             Medium    +0.02em
Bio            13px            14px             15px             Regular   normal
               line-clamp-2    line-clamp-3     line-clamp-4
Button label   15px            15px             16px             Bold      normal
Footer         9px             9px              10px             Bold      +0.15em (uppercase)

Line-height:
  Name:         1.1
  Headline:     1.3
  Bio:          1.7 (mobile) → 1.75 (desktop)
  Buttons:      1.0 (centered vertically via min-height)
```

### 5.2 Typography Visual Hierarchy

```
┌────────────────────────────┐
│                            │
│     [Avatar — visual]      │  ◄── Highest visual weight
│                            │
│   Sherif Ahmed             │  ◄── Primary typography (32px semibold)
│   SENIOR ENGINEER · ACME   │  ◄── Secondary (13px semibold uppercase, 75% opacity)
│   📍 Cairo, Egypt          │  ◄── Tertiary (14px medium, muted color)
│                            │
│   Building products that   │  ◄── Body (15px regular, 90% opacity)
│   people love to use...    │
│                            │
│   ██  Portfolio           │  ◄── Action primary (bold, accent bg)
│   ○  Schedule Meeting     │  ◄── Action secondary (semibold, outline)
│   ○  Read Blog            │  ◄── Action tertiary
│                            │
│     ◎  ◎  ◎  ◎  ◎       │  ◄── Social (icon-only, no text)
│                            │
│   BUILT WITH LINKLY        │  ◄── Footer (10px bold, 50% opacity)
└────────────────────────────┘
```

---

## 6. Avatar Placement & Treatment

### 6.1 Specification

```
Desktop avatar:  140px × 140px  (same as current lg size max)
Tablet avatar:   132px × 132px
Mobile avatar:   132px × 132px  (unchanged from current sm-lg responsive)

Position:         Top-center of card
Top offset:       space-2xl (64px on desktop) from card top edge
Alignment:        mx-auto (centered horizontally in card)

Glow treatment:   Radial gradient behind avatar
                  Primary color at 25% opacity → transparent at 60% radius
                  Extends 24px beyond avatar edge (inset: -24px)
                  30% opacity at rest, 50% on hover
                  Blur: 32px

Hover behavior:   Scale 1.03 (existing, preserved)
                  Glow intensifies from 30% → 50% opacity

Border:           Ring-1 black/5% (light mode) or white/10% (dark mode)
                  Subtle inner frame, not a heavy border
```

### 6.2 Avatar-to-Name Relationship

```
  ┌──────────────────────────────────┐
  │                                  │
  │         ╭─────────────╮          │  ◄── Glow ring (primary, blurred)
  │         │ ┌─────────┐ │          │
  │         │ │         │ │          │  ◄── Avatar image
  │         │ │  IMAGE  │ │          │      140×140, object-cover
  │         │ │         │ │          │      radius from theme token
  │         │ └─────────┘ │          │
  │         ╰─────────────╯          │
  │                │                 │
  │          48px gap                │  ◄── space-xl
  │                │                 │
  │         Sherif Ahmed             │
  │     SENIOR ENGINEER · ACME       │
  │         📍 Cairo, Egypt          │
  │                                  │
  └──────────────────────────────────┘
```

---

## 7. Link Section Architecture

### 7.1 Button Design System

```
Primary Button (first link, i === 0):
┌──────────────────────────────────────┐
│                                      │
│   ████████████████████████████████   │  height: 52px
│   ███  Portfolio  →            ███   │  font: 16px bold
│   ████████████████████████████████   │  radius: 28px (theme token)
│                                      │  background: platform accent
└──────────────────────────────────────┘  shadow: theme.shadow.button
                                          hover: scale(1.01), translateY(-1px)
                                          active: scale(0.98)
                                          transition: spring, 400ms/30ms

Secondary Buttons (i > 1):
┌──────────────────────────────────────┐
│                                      │
│   ┌──────────────────────────────┐   │  height: 48px
│   │  ○  Schedule Meeting         │   │  font: 15px semibold
│   └──────────────────────────────┘   │  radius: 28px
│                                      │  background: transparent
└──────────────────────────────────────┘  border: 1.5px solid accent/20%
                                          color: accent
                                          hover: bg accent/4%, scale(1.01)
                                          active: scale(0.97)
```

### 7.2 Link Group Spacing & Rhythm

```
Desktop link stack:

  ██ Primary CTA                 (52px tall)
         │  16px gap (space-sm)
  ○ Secondary Link               (48px tall)
         │  16px gap
  ○ Secondary Link               (48px tall)
         │  16px gap
  ○ Secondary Link               (48px tall)
         │  24px gap (space-md)

  ◎ ◎ ◎ ◎ ◎ Social icons       (44px circles, 20px gap)
```

### 7.3 Icon Row (Social Links)

```
Desktop:   44px circles, 20px gap between, centered
Tablet:    44px circles, 18px gap
Mobile:    44px circles, 16px gap (unchanged sm: gap-6)

Hover per icon:
  - Scale 1.12
  - Rotate ±3° (alternating: +3, -3, +3, -3, +3)
  - Color shifts to primary
  - Background: primary/10% → primary/15%
  - Shadow: 0 4px 12px primary/15%
  - Spring transition, 500ms/25ms
```

---

## 8. Background Treatment

### 8.1 Page-Level Canvas

The page background is NOT plain white. It has depth.

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Base fill                                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  bg: resolved from theme.surface.background           │  │
│  │  (solid color or gradient, user-configurable)         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 2: Atmospheric radial bloom (DESKTOP ONLY)           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  position: fixed, full viewport, z-0, pointer-events  │  │
│  │  background: radial-gradient(                          │  │
│  │    circle at 50% 0%,                                   │  │
│  │    var(--primary) 0%,                                  │  │
│  │    var(--primary)/3% 40%,                              │  │
│  │    transparent 75%                                     │  │
│  │  )                                                     │  │
│  │  opacity: 0.6 (light mode) / 0.3 (dark mode)          │  │
│  │  Subtle, atmospheric — never distracting               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 3: Optional dot-grid texture (EXTREMELY SUBTLE)     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  background-image: radial-gradient(circle,             │  │
│  │    currentColor 1px, transparent 1px)                  │  │
│  │  background-size: 32px 32px                            │  │
│  │  color: var(--primary)                                 │  │
│  │  opacity: 0.02                                         │  │
│  │  DESKTOP ONLY, z-0, pointer-events: none               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 4: Card (z-10 relative)                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Card Surface

```
Card background:  theme.surface.background (white or user-configured)
Card shadow:      theme.shadow.card (resolved from SMALL/MEDIUM/LARGE preset)
Card radius:      theme.shape.radius (user-configured, default 32px)
Card border:      none at rest
                  Subtle 1px solid outline on hover?  No — card doesn't hover.
                  The OUTLINE token is used for internal dividers, not card border.

Elevation effect (desktop only):
  - Card rests on the canvas with shadow
  - Subtle parallax-like feel: the background bloom stays fixed
    while the card scrolls (achieved via position: fixed on background layer)
```

---

## 9. Component Hierarchy — Architecture

### 9.1 Proposed Component Tree

```
PublicProfilePage (Server Component)
├── BackgroundCanvas (Client, desktop-only)
│   ├── RadialBloom (fixed, z-0)
│   └── DotGridTexture (fixed, z-0, optional)
│
└── ProfileCardContainer (Client)
    └── ProfileCard (motion.div — surface, shadow, radius)
        └── CardContent (motion.div — entrance animation)
            ├── AvatarSection
            │   ├── AvatarGlow (radial gradient behind avatar)
            │   └── ProfileAvatar (img + fallback)
            │
            ├── IdentitySection
            │   ├── ProfileName (h1)
            │   ├── ProfileHeadline (span, uppercase)
            │   └── ProfileLocation (address + icon)
            │
            ├── BioSection
            │   └── ProfileBio (p, line-clamp responsive)
            │
            ├── LinksSection
            │   ├── PrimaryButton (platform-accented, solid)
            │   ├── SecondaryButton[] (outline style)
            │   └── SocialIconRow (flex-wrap, centered)
            │
            └── FooterSection
                └── BrandingMark (9px uppercase, muted)
```

### 9.2 Data Flow (Unchanged)

```
PublicCardDTO
    │
    ▼
toCardRendererProps()
    │
    ├── data: PreviewData (profile, buttons, socialLinks, blocks)
    ├── appearance: AppearanceSettings (colors, typography, layout, background)
    ├── layout: PreviewLayoutOptions (show*, sectionOrder, alignment, width, spacing)
    └── avatarUrl: string | null
            │
            ▼
        CardRenderer
            │
            ▼
        ThemeProvider (resolves tokens from appearance)
            │
            ▼
        InnerRenderer (consumes tokens via useTheme())
```

The data flow is NOT changed. The redesign works within the existing prop contract.

---

## 10. Responsive Rules

### 10.1 Rule Set

```
Rule 1: Mobile is immutable.
        No CSS change affects screens below 640px.
        All desktop classes use sm:, md:, lg:, or xl: prefixes.

Rule 2: Card width transitions smoothly.
        sm: max-w-[420px]
        md: max-w-[90vw] (capped at 448px)
        lg: max-w-[448px]
        xl: max-w-[480px]

Rule 3: Content height is intrinsic.
        min-h-screen on outer wrapper (provides vertical centering baseline)
        h-auto / min-h-fit on card body (content determines height)
        flex + items-center + justify-center on wrapper (vertically centers card)

Rule 4: Padding scales with viewport.
        Uses geometric scale tokens (Section 3).
        Applied via responsive padding classes.

Rule 5: Typography scales up on desktop.
        Name: 26px → 28px → 32px
        Bio: 13px → 14px → 15px
        Bio line-clamp: 2 → 3 → 4
        Footer: 9px → 10px

Rule 6: Bio has more room to breathe on desktop.
        Mobile: line-clamp-2 (approx 44px visible)
        Tablet: line-clamp-3 (approx 66px visible)
        Desktop: line-clamp-4 (approx 105px visible)

Rule 7: Card-to-viewport-edge clearance.
        Mobile: 0px (card touches edges)
        Tablet: 16px
        Laptop: 32px
        Desktop: 48px minimum (scrollable if viewport shorter than card)

Rule 8: Buttons stay within card width.
        w-full relative to card content width, not viewport.
        Primary: 52px tall
        Secondary: 48px tall
```

---

## 11. Animation Design

### 11.1 Page Load Sequence

```
Timeline (orchestrated):

0ms      ─ Page renders, card invisible
80ms     ─ Background bloom fades in (opacity 0 → target, 600ms ease-out)
150ms    ─ Card fades in + slides up (opacity 0→1, y: 24→0, 500ms ease-out)
250ms    ─ Avatar fades in + scales (opacity 0→1, scale: 0.92→1, 400ms ease-out)
350ms    ─ Name/headline fades in + slides up (opacity 0→1, y: 8→0, 400ms)
450ms    ─ Bio fades in (opacity 0→1, 300ms)
550ms    ─ Buttons stagger in, one by one (each: y: 12→0, opacity 0→1, 300ms, 80ms delay between)
750ms    ─ Social icons stagger (each: y: 8→0, opacity 0→1, 250ms, 50ms delay)
900ms    ─ Footer fades in (opacity 0→1, 300ms)

Total: ~1.2s from page load to fully rendered.

ALL animations respect prefers-reduced-motion: instant, opacity-only.
```

### 11.2 Hover Micro-Interactions

```
Primary Button:
  Rest:    scale(1), shadow-elevated
  Hover:   scale(1.015), translateY(-1px), shadow intensifies 15%
           background lightens 5% (overlay white/8%)
  Active:  scale(0.97), shadow collapses, background darkens 5%
  Spring:  400ms stiffness, 30ms damping

Secondary Button:
  Rest:    scale(1), no bg, accent border
  Hover:   scale(1.015), translateY(-1px), bg accent/4%
           border opacity increases from 20% → 35%
  Active:  scale(0.97)
  Spring:  400ms, 30ms

Social Icon:
  Rest:    scale(1), subtle gradient bg
  Hover:   scale(1.12), translateY(-2px), rotate(3deg alternating)
           gradient bg intensifies, shadow appears
           icon color shifts from text → primary
  Active:  scale(0.92), rotate(0)
  Spring:  500ms, 25ms

Avatar:
  Rest:    continuous breathing (translateY: 0 → -3 → 0, 4.5s ease-in-out loop)
  Hover:   scale(1.03), glow opacity 30% → 50%
  No click action (avatar is not a link)

Bio (if truncated via line-clamp):
  Hover:   slight highlight border appears on left edge
  Click:   expands to show full text (height transition, 300ms ease-out)
  (Desktop-only enhancement)
```

### 11.3 Scroll Behavior

```
Background bloom:  position: fixed — stays put while card scrolls
                   Creates subtle parallax depth

Card:              Normal document flow
                   Scrolls when content exceeds viewport

Edge fade:         When card is taller than viewport,
                   a subtle mask-gradient fades the bottom 40px
                   of the card to transparent to indicate scrollability.
                   (Desktop-only, disappears when scrolled to bottom)
```

---

## 12. Desktop-Only Improvements Summary

| Feature | Mobile | Desktop | Why |
|---------|--------|---------|-----|
| Page background | None (white) | Radial bloom + dot grid | Creates depth, removes "floating card in void" feeling |
| Card max-width | Full-width | 448-480px centered | Professional proportions, no stretching |
| Card height | min-h-screen | Content-intrinsic | Removes excessive whitespace |
| Button width | Full card width | Card content width (constrained) | Buttons don't span viewport |
| Typography | Compact | Breathes with scale | Desktop has room for larger type |
| Bio truncation | 2 lines | Up to 4 lines | More content visible before truncation |
| Spacing | Tight (mobile-appropriate) | Generous geometric scale | White space feels intentional, not wasted |
| Button hover states | None (touch) | Full micro-interactions | Desktop is pointer-driven |
| Scroll edge fade | None | Subtle bottom fade | Indicates scrollable content |
| Social icon hover | Minimal | Full (scale, rotate, shadow, color shift) | Delightful on pointer devices |
| Entrance animation | Simple fade | Orchestrated staggered sequence | Feels premium without being heavy |
| Card elevation | Subtle shadow | Shadow + background parallax | Depth through layered composition |

---

## 13. Accessibility Preservation

```
✓ Keyboard navigation:      Tab order follows visual order (avatar skip, name, buttons top→bottom, socials L→R, footer)
✓ Focus rings:              ring-2 ring-offset-2, uses theme primary color, 2px offset
✓ Color contrast:           All text meets WCAG AA minimum (4.5:1 for body, 3:1 for large text)
✓ Reduced motion:           All animations disabled → instant transitions, opacity-only changes
✓ Screen reader:            Avatar has alt text, buttons have aria-labels, social icons have aria-labels
✓ Touch targets:            Minimum 44×44px (buttons are 48-52px tall, social icons 44×44px)
✓ Zoom support:             Card scales with browser zoom, no horizontal overflow until 400%+
✓ Dark mode:                All background treatments reduce opacity in dark mode (30% vs 60%)
✓ Forced colors:            Respects forced-colors media query, maps to system colors
```

---

## 14. Implementation Scope Boundaries

### 14.1 In scope (this design covers)

```
✓ Page composition (background canvas + card container)
✓ Spacing system (geometric scale, responsive tokens)
✓ Card max-width responsive behavior
✓ Typography hierarchy and responsive scale
✓ Avatar placement and glow treatment
✓ Link button sizing, spacing, and responsive behavior
✓ Social icon section layout
✓ Footer treatment
✓ Entrance animations and hover states
✓ Desktop-only background atmospheric layer
```

### 14.2 Out of scope (NOT changed by this design)

```
✗ Theme engine (resolveTokens, ThemeProvider, useTheme)
✗ Data fetching (readPublicCardForRender, toCardRendererProps)
✗ Card content blocks (gallery, video, faq, map, divider, rich text)
✗ Section ordering logic (sectionOrder array)
✗ Layout option system (alignment, width, spacing presets)
✗ Mobile layout (all changes are breakpoint-prefixed)
✗ Button color resolution (platform-resolver.ts)
✗ Admin/workspace preview
✗ Embed/share page variants
✗ QR code section
✗ Save contact functionality
```

---

*End of Design Specification — Version 2.0*
