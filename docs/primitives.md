# OI Platform V2 Core Primitive Library

## Status and scope

The Core Primitive Library lives at `src/design/primitives/`. It is the product-neutral composition layer above tokens, themes, and surfaces. Sprint 6 does not migrate or modify existing pages, layouts, features, or legacy components.

All primitives are Server Components by default. None declares `"use client"`, owns state, accesses browser APIs, or contains business logic.

## Hierarchy

```text
Design tokens and semantic themes
              ↓
Surface and Glass System
              ↓
Core Primitive Library
              ↓
Future component library
              ↓
Feature components and pages
```

The public entry point is `@/design/primitives`.

## Primitive reference

### Box

A neutral polymorphic wrapper for document structure. It applies only safe box sizing and minimum inline sizing.

Use Box when semantic HTML is known by the consumer but no layout or visual treatment is required.

### Stack

A vertical flex layout. It supports tokenized base and responsive gaps, alignment, justification, wrapping, custom semantic elements, and logical RTL behavior.

### Inline

A horizontal flex layout. It supports the same gap and alignment contract as Stack. Its default cross-axis alignment is centered.

### Grid

A token-spaced grid supporting 1, 2, 3, 4, 5, 6, or 12 equal columns. It also supports responsive gaps, alignment, and justification.

Grid defines structure only. Responsive column collapse remains the responsibility of a future documented layout pattern or component.

### Container

A centered content-width boundary with tokenized maximum widths and logical inline padding.

Sizes: `sm`, `md`, `lg`, `xl`, and `full`.

Padding: `none`, `sm`, `md`, and `lg`.

### Surface

A generic wrapper over the Sprint 5 Surface System.

Variants:

- `standard`
- `elevated`
- `floating`
- `glass`
- `overlay`

Radius is independently selected from the canonical radius tokens. Surface does not add product layout, spacing, or interaction behavior.

### Text

The general typography primitive. It is polymorphic and supports the complete type and semantic tone scales.

Variants:

- `display`
- `h1`
- `h2`
- `h3`
- `title`
- `body`
- `small`
- `caption`
- `muted`

Tones:

- `default`
- `muted`
- `subtle`
- `accent`
- `success`
- `warning`
- `danger`
- `info`

The muted variant automatically selects the muted tone unless the consumer explicitly supplies another semantic tone.

### Heading

A semantic heading primitive supporting heading levels 1–3 and visual variants `display`, `h1`, `h2`, `h3`, and `title`.

Heading level controls document semantics. Visual variant controls appearance. Do not choose a heading level for its size.

### Icon

A unified wrapper for SVG or React icon elements.

Sizes: `xs`, `sm`, `md`, `lg`, and `xl`.

Decorative icons omit a label and are hidden from assistive technology. Informative standalone icons require `label`, which applies an accessible image role and name.

### Separator

A horizontal or vertical structural separator using the canonical border system. Separators are decorative by default. Set `decorative={false}` only when the separation is meaningful to assistive technology.

### Spacer

A strictly decorative spacing primitive supporting block, inline, or both axes and the canonical gap scale. It cannot contain children.

Prefer Stack, Inline, or Grid gaps. Spacer is reserved for composition boundaries that cannot be expressed by a parent layout.

## Layout API

The shared gap scale is:

`none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`.

Stack, Inline, and Grid accept:

- `gap`: mobile/default gap.
- `gapSm`: small-viewport override.
- `gapMd`: medium-viewport override.
- `gapLg`: large-viewport override.
- `align`: start, center, end, stretch, or baseline.
- `justify`: start, center, end, between, around, or evenly.

All spacing declarations resolve through `--oi-space-*` tokens. Logical properties are used for container padding and spacer axes, keeping composition RTL-compatible.

## Composition example

```tsx
import {
  Container,
  Heading,
  Stack,
  Surface,
  Text,
} from "@/design/primitives";

export function Example() {
  return (
    <Container size="lg">
      <Surface variant="elevated" radius="xl">
        <Stack gap="md" gapMd="lg">
          <Heading level={2}>Section title</Heading>
          <Text tone="muted">Supporting information.</Text>
        </Stack>
      </Surface>
    </Container>
  );
}
```

This example documents composition only. It is not mounted in the application.

## Accessibility

- Semantic element props remain available through the polymorphic `as` API.
- Heading levels are separate from visual heading variants.
- Icon labels distinguish informative and decorative icons.
- Separators are decorative unless explicitly exposed.
- Spacer is always hidden from assistive technology.
- Primitives do not remove keyboard semantics from native interactive elements.
- No primitive creates interaction behavior or substitutes a generic element for a semantic control.
- Theme colors and forced-colors behavior resolve through Design System tokens.

## RTL behavior

- Container padding uses logical inline properties.
- Spacer uses block and inline axes.
- Horizontal layout follows the document direction.
- Alignment uses flex/grid start and end semantics rather than left and right.
- Primitives do not force a text direction.

## Composition rules

- Use the smallest primitive that expresses the required structure.
- Prefer parent gap over child margins or Spacer.
- Use Surface only for semantic visual hierarchy.
- Use Heading for document headings and Text for non-heading typography.
- Keep product terminology, workflow state, data loading, and mutations outside primitives.
- Extend primitives through composition rather than adding feature-specific variants.

## Anti-patterns

- Passing inline visual styles.
- Hardcoding colors, spacing, radii, shadows, or typography.
- Using Box where a native semantic element is required without setting `as`.
- Using Text styled as a heading instead of Heading.
- Using Heading levels to select visual size.
- Applying Glass to ordinary cards or every section.
- Using Spacer repeatedly to recreate Stack or Grid.
- Adding click behavior to a non-interactive primitive without native semantics.
- Importing legacy component styles into the primitive layer.

The TypeScript API omits `style` and raw `color` props to prevent inline visual values. Consumers may provide `className` only for separately approved token-backed composition.

## Verification contract

A primitive-library change must verify:

- Every requested primitive has exactly one canonical export.
- No Client directive or browser API enters the library.
- CSS declarations contain no hardcoded color, spacing, or radius values.
- CSS Module compilation succeeds.
- Typecheck, production build, and architecture checks pass.
- No page, feature, or legacy component consumes the library without separate migration approval.


## Sprint 6 validation

- Canonical primitive exports: 11 of 11, exactly once each.
- Client directives: zero.
- Browser API references: zero.
- Token references: 53, all resolved.
- Audited visual declarations: 63, with zero hardcoded values.
- CSS Module compilation: passed, producing 108 scoped class exports.
- Existing page, feature, and legacy-component consumers: zero.
- Typecheck, production build, architecture checker, and scoped diff checks passed.
