# OI Platform V2 Interactive Component Foundation

## Status and scope

The official V2 component library lives at `src/design/components/` and is exported through `@/design/components`.

Sprint 7 creates the library only. No page, layout, feature, Admin screen, customer workspace, public screen, or legacy component imports it. Existing `OI*`, Admin, renderer, and feature-owned implementations remain compatibility code until separately approved migrations.

The components contain presentation and native-element behavior only. They contain no product workflow or business logic.

## Component hierarchy

```text
Design tokens and Theme Engine
              ↓
Surface and Glass System
              ↓
Core Primitive Library
              ↓
Interactive Component Foundation
              ↓
Future feature composition
```

Internal field composition is shared by Input and Textarea so label, message, status, and accessibility behavior have one implementation.

## Inventory

### Button

Uses native `button` or `a` semantics and composes Inline, Box, and Icon primitives.

Variants:

| Variant | Intended use |
|---|---|
| Primary | Principal action in a focused region |
| Secondary | Ordinary action with structural emphasis |
| Ghost | Low-emphasis action |
| Danger | Destructive or irreversible action |
| Glass | Approved floating or Glass context |
| Link | Inline navigation or text-style action |

Sizes: `xs`, `sm`, `md`, and `lg`.

Supported states and composition:

- Hover and active token states.
- Native disabled state for buttons.
- `aria-disabled` and removed tab order for unavailable anchors.
- Loading state with `aria-busy`, persisted visible label, and tokenized spinner.
- Icon-only mode requiring both an icon and accessible `aria-label` at the type boundary.
- Left and right icon slots.
- Full-width mode.
- Default `type="button"` to prevent accidental form submission.

### Input

A native input composed with the shared Field structure.

Supported behavior:

- Label associated through generated or supplied ID.
- Helper, error, and success messages connected through `aria-describedby`.
- Error state sets `aria-invalid` and an alert role.
- Success state uses a status role.
- Prefix and suffix slots.
- Placeholder, disabled, and read-only native behavior.
- Sizes: `sm`, `md`, and `lg`.

Supplied `aria-describedby` values are preserved and combined with generated message IDs.

### Textarea

Uses the same Field, message, size, focus, disabled, read-only, error, and success contracts as Input. It keeps native vertical resize behavior. Automatic resizing is intentionally not included because it would require browser measurement and a Client boundary.

### Badge

Variants:

- Primary
- Success
- Warning
- Danger
- Neutral

Sizes: `sm` and `md`.

Badge is visual metadata, not an interactive control. Status text uses theme-specific contrast tokens rather than decorative status colors.

### Card

Composes the Surface primitive.

Variants:

- Default
- Elevated
- Glass
- Interactive

Interactive provides hover emphasis only. It does not manufacture click or keyboard semantics. Place native links or buttons inside the Card when actions are required.

### Skeleton

Variants:

- Text
- Title
- Avatar
- Card
- Table row

Skeleton is hidden from assistive technology. Its shimmer uses semantic surface colors and motion tokens. Under `prefers-reduced-motion: reduce`, animation is removed.

### Empty State

Composes Surface, Stack, Inline, Box, Icon, Heading, and Text.

Slots:

- Illustration
- Icon
- Title
- Description
- Actions

Illustration content remains available to assistive technology when the supplied content carries semantics. The Icon slot is decorative by default through the Icon primitive.

## Variant matrix

| Component | Variants | Sizes |
|---|---|---|
| Button | primary, secondary, ghost, danger, glass, link | xs, sm, md, lg |
| Input | default, error, success, disabled, read-only | sm, md, lg |
| Textarea | default, error, success, disabled, read-only | sm, md, lg |
| Badge | primary, success, warning, danger, neutral | sm, md |
| Card | default, elevated, glass, interactive | component-defined |
| Skeleton | text, title, avatar, card, table-row | variant-defined |
| Empty State | illustration or icon composition | content-defined |

## Composition examples

### Action group

```tsx
import { Button } from "@/design/components";
import { Inline } from "@/design/primitives";

<Inline gap="sm" wrap>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</Inline>
```

### Field

```tsx
import { Input } from "@/design/components";

<Input
  label="Email"
  helperText="Used for account notifications."
  name="email"
  placeholder="name@example.com"
  type="email"
/>
```

### Card and badge

```tsx
import { Badge, Card } from "@/design/components";
import { Heading, Inline, Stack, Text } from "@/design/primitives";

<Card variant="elevated">
  <Stack gap="md">
    <Inline justify="between">
      <Heading level={3} variant="title">Subscription</Heading>
      <Badge variant="success">Active</Badge>
    </Inline>
    <Text tone="muted">Renews at the end of the current period.</Text>
  </Stack>
</Card>
```

### Empty state actions

```tsx
import { Button, EmptyState } from "@/design/components";

<EmptyState
  title="Nothing here yet"
  description="New records will appear here."
  actions={<Button variant="primary">Create record</Button>}
/>
```

Examples document API composition only and are not mounted by Sprint 7.

## Accessibility

- Button preserves native button and anchor semantics.
- Icon-only Button requires an accessible name.
- Loading Button exposes `aria-busy` and becomes unavailable.
- Input and Textarea associate labels and messages programmatically.
- Errors expose both visual state and `aria-invalid`.
- Disabled and read-only states remain distinct.
- Status text uses contrast-safe Light and Dark semantic tokens.
- Skeleton is decorative and hidden.
- Empty State headings preserve semantic hierarchy.
- Interactive Card does not impersonate a control.
- Forced-colors behavior resolves through semantic Theme and Surface tokens.
- Reduced-motion users receive no Skeleton or spinner animation.

## RTL

- Button icon order follows DOM order and document direction.
- Field affixes use logical inline flow.
- Full-width and padding rules use inline sizing.
- Components inherit direction and never force LTR or RTL.
- Text alignment is not hardcoded.
- Layout is composed through RTL-compatible primitives.

## Usage guidelines

- Use one Primary Button per focused action group when practical.
- Use Danger only when the action is genuinely destructive.
- Use Glass only in locations approved by the Surface System.
- Always provide visible labels unless an icon-only Button has a precise accessible name.
- Provide either error or success feedback, not both.
- Use helper text for durable guidance, not transient errors.
- Keep Cards compositional and product-neutral.
- Match Skeleton variants to the approximate content category.
- Empty State actions should be concise and relevant to recovery or creation.

## Anti-patterns

- Replacing existing UI without an approved migration.
- Passing inline visual styles or raw color values.
- Adding product-specific variants to this layer.
- Using a disabled anchor as the only explanation for unavailable behavior.
- Omitting an icon-only Button label.
- Using placeholder text as the only field label.
- Using Badge as an interactive control.
- Attaching click behavior to Card without native interactive descendants.
- Animating Skeleton under reduced-motion preferences.
- Duplicating Input label/message logic outside the shared Field implementation.
- Importing legacy CSS or components into the V2 library.

## Engineering contract

- Components may depend on primitives, surfaces, semantic themes, and tokens.
- Components must not depend on pages, features, business services, repositories, or legacy components.
- Inline `style` and raw `color` props are excluded where native props would otherwise expose them.
- Browser APIs require a separately justified Client boundary.
- New variants require documentation and token coverage.
- Adoption requires a separate migration batch with visual, responsive, theme, RTL, and accessibility verification.


## Sprint 7 validation

- Canonical public exports: 7 of 7, with no duplicates.
- Every public component imports and composes Core Primitive Library primitives.
- Client directives: zero.
- Browser API usage: zero.
- Inline style usage: zero.
- Component CSS hardcoded visual values: zero.
- Design-token references: 127 resolved, zero missing.
- Light and Dark semantic token sets: 21 each, identical.
- Current page, layout, feature, and legacy-component consumers: zero.
- Typecheck, production build, and architecture checker: pass.
