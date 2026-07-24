# Component usage

## Foundations

Use `Container`, `Stack`, `Inline`, `Grid`, `Box`, `Surface`, `Heading`, `Text`, `Icon`, `Separator` and `Spacer` to create structure. Use Lucide icons through the shared Icon sizing contract.

## Controls

- `Button`: primary, secondary, ghost, danger, glass and link hierarchy. One primary action per decision area.
- `Input`, `Textarea`, `Select`, `Combobox`, `SearchField`, `Checkbox`, `Switch`, `RadioGroup`, `ToggleGroup`: always provide a label or accessible name and surface field errors.
- `OTPInput`: segmented one-time-code entry with one logical accessible label.

## Status and feedback

Use `Badge` for compact status, `Chip` for selected/filter state, `Alert` for contextual feedback, `Banner` for page-level information, `Progress` for determinate completion, and `Spinner`/`Loader` for indeterminate activity. `Skeleton` mirrors final geometry and never replaces an actionable error.

## Content surfaces

`Card` is the base surface. `GlassCard` opts into a named glass level. `FeatureCard`, `DashboardCard`, `PricingCard`, `StatCard`, `QuickActionCard`, `ProgressCard` and `StepCard` standardize recurring composition without business logic.

## Overlays and disclosure

Use the shared `Drawer`, dialog/confirmation, tabs, accordion, dropdown/popover and tooltip primitives. Preserve focus trapping where modal, Escape dismissal, focus restoration, keyboard navigation and descriptive labels. Toasts announce status through the appropriate live region.

## Empty and loading states

`EmptyState` includes a concise title, explanation and at most one primary plus one secondary action. Loading states use `Skeleton`, `Spinner` or `Loader` according to whether final layout is known.

## Extension rule

Do not fork a component for color, radius or shadow changes. Add a semantic variant backed by tokens. Keep data fetching, permissions and business state outside the Design System.
