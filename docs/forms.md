# OI Platform V2 Form System

## Table of contents

1. Architecture
2. Component hierarchy
3. Field states and validation presentation
4. Accessibility
5. Responsive behavior
6. Upload workflow
7. Server and Client boundaries
8. Composition
9. Future extension points
10. Anti-patterns

## 1. Architecture

`src/design/forms` is the canonical V2 form-composition and missing-control layer. It depends only on Design Tokens, Theme Engine semantic variables, Surface System, Primitive Library, Component Library, React, and the existing icon package.

This package owns presentation infrastructure only. Feature consumers own values, validation, submission, authorization, persistence, API calls, Server Actions, localization, and business rules. Controls expose native form behavior and controlled callbacks without selecting a state-management, schema, or validation library.

The Component Library remains authoritative for `Input` and `Textarea`. The Form System consumes those components and does not duplicate text-field implementations.

## 2. Component hierarchy

```text
Form
|-- form-level ErrorMessage or success HelperText
|-- FormSection
|   |-- FormRow
|   |   |-- FieldGroup
|   |   |   |-- Label and RequiredIndicator
|   |   |   |-- Description
|   |   |   |-- control
|   |   |   `-- HelperText or ErrorMessage
|   |   |-- Select, MultiSelect, Combobox
|   |   |-- Checkbox, RadioGroup, Switch, ToggleGroup
|   |   |-- DatePickerPlaceholder, ColorPickerPlaceholder
|   |   `-- FileUpload, ImageUpload
|   `-- nested FormSection
`-- FormActions
```

### Structural components

- `Form`: semantic form surface with form-level error and success presentation.
- `FormSection`: titled, described, optionally nested grouping surface.
- `FormRow`: single owner of single-column, two-column, auto-grid, and inline layout.
- `FormActions`: responsive action alignment.
- `FieldGroup`: shared label, description, status, and message structure.

### Semantic text

- `Label`: visible control association.
- `Description`: purpose and context.
- `HelperText`: neutral, success, or warning guidance.
- `ErrorMessage`: assertive validation presentation.
- `RequiredIndicator`: required or optional annotation; native `required` remains authoritative.

### Controls

- `Select`: native single selection.
- `Checkbox`: controlled checked and mixed states.
- `RadioGroup`: native exclusive choice grouping.
- `Switch`: ARIA switch for immediate binary settings.
- `ToggleGroup`: single or multiple pressed-button choices.
- `Combobox`: controlled input and listbox suggestions.
- `MultiSelect`: native multiple selection.
- `DatePickerPlaceholder`: native date infrastructure pending an approved calendar engine.
- `ColorPickerPlaceholder`: native color infrastructure pending an approved advanced picker.
- `FileUpload`: file selection and controlled upload-state presentation.
- `ImageUpload`: caller-provided preview composition over FileUpload.

## 3. Field states and validation presentation

Controls support the applicable subset of label, description, helper text, required, optional, disabled, read-only, error, success, warning, and loading states.

Status precedence is error, warning, success, then neutral helper text. Error sets `aria-invalid`. Loading sets `aria-busy` and prevents changes where necessary; it never starts work.

Validation is consumer-owned:

- Field errors use `error`.
- Form errors use `Form.error`.
- Field success uses `success`.
- Form success uses `Form.success`.
- Non-blocking concerns use `warning`.
- Persistent guidance uses `helperText`.

The package does not parse schemas, infer validity, execute validation, mutate values, or submit data. Read-only native controls without `readonly`, such as selects and file inputs, are disabled. If such a value must be submitted, the consumer supplies its own hidden value.

## 4. Accessibility

- Visible labels associate through `htmlFor` and generated or caller IDs.
- Descriptions and messages connect through `aria-describedby`.
- Invalid controls expose `aria-invalid`.
- Native select, checkbox, radio, date, color, and file semantics are retained.
- Checkbox mixed state sets the native indeterminate property and `aria-checked="mixed"`.
- RadioGroup uses fieldset and legend.
- Switch uses `role="switch"`, `aria-checked`, and an explicit accessible name.
- ToggleGroup uses pressed-button semantics and RTL-aware Arrow, Home, and End focus movement.
- Combobox uses combobox, listbox, option, expanded, controls, active-descendant, and selection semantics. Escape, Arrow, and Enter are supported.
- Focus indicators consume canonical focus tokens.
- Reduced-motion removes transition duration.
- Forced-colors preserves selected checkbox and switch states.

Consumers provide localized labels, meaningful option labels, and announcements for asynchronous application results.

## 5. Responsive behavior

FormRow owns every layout without duplicate field markup:

- `single`: one full-width column.
- `two-columns`: two equal columns, collapsing to one on mobile.
- `auto-grid`: token-sized responsive columns.
- `inline`: aligned wrapping controls, becoming one mobile column.

Sections and actions reduce padding at the mobile boundary. Logical properties support RTL and LTR. Switch movement and toggle keyboard direction respond to writing direction. Nested sections retain one DOM tree at every breakpoint.

## 6. Upload workflow

FileUpload and ImageUpload are selection and state-presentation components only. The consumer controls:

1. `idle`: ready.
2. `uploading`: busy presentation and tokenized Skeleton.
3. `uploaded`: successful completion.
4. `error`: accessible failure.

`onFilesSelected` receives native File objects. Components do not upload, call APIs, create object URLs, inspect content, enforce domain limits, or persist data. ImageUpload accepts a caller-owned `preview`; the feature owns secure URL creation, alternative text, cleanup, and media policy.

## 7. Server and Client boundaries

Structural components, labels, descriptions, messages, sections, rows, actions, Select, and the native date placeholder are Server-compatible when used without event handlers.

Client Components are limited to interaction needs:

- Checkbox
- RadioGroup
- Switch
- ToggleGroup
- Combobox
- MultiSelect
- ColorPickerPlaceholder
- FileUpload
- ImageUpload

Browser access is limited to native event data, focus movement, writing direction, and checkbox indeterminate state. There is no data fetching.

## 8. Composition

```tsx
<Form error={formError} success={formSuccess}>
  <FormSection title="Customer">
    <FormRow layout="two-columns">
      <Input label="Name" required />
      <Select label="Plan" options={planOptions} required />
    </FormRow>
    <FormRow layout="auto-grid">
      <Checkbox label="Active" checked={active} onCheckedChange={setActive} />
      <Switch label="Notifications" checked={notifications} onCheckedChange={setNotifications} />
    </FormRow>
  </FormSection>
  <FormActions>
    <Button variant="secondary">Cancel</Button>
    <Button type="submit">Save</Button>
  </FormActions>
</Form>
```

This is architecture documentation only. Feature adoption requires separate approval.

## 9. Future extension points

Separately approved extensions may add a calendar popover, advanced color picker, consumer-supplied asynchronous combobox results, repeatable sections, localized state labels, drag-and-drop selection, caller-supplied upload progress, or external form-library adapters.

Extensions must retain controlled ownership, accessibility semantics, token-only visuals, and the documented dependency boundary.

## 10. Anti-patterns

- Fetching options or submitting data inside form components.
- Embedding product validation, permissions, routes, or APIs.
- Duplicating Input, Textarea, Button, Surface, or status primitives.
- Maintaining separate desktop and mobile form markup.
- Treating a visual required marker as validation.
- Omitting accessible names or descriptions.
- Hardcoding colors, spacing, radii, shadows, or motion.
- Uploading files or creating object URLs inside upload components.
- Passing CSS Module objects through component boundaries.
