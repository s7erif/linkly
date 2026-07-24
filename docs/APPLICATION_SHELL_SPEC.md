# OI Platform Application Shell — Phase 2

The shared Admin application frame is now defined independently from page composition.

## Frame

- Compact vertical navigation with six workflow groups.
- Sticky 60px topbar.
- Context breadcrumb affordance.
- Global search surface with command shortcut cue.
- Notification affordance and accessible user menu.
- Responsive mobile navigation trigger.
- Content column with consistent reading gutters.
- Reusable command-palette foundation, intentionally not wired to commands in this phase.

## Boundaries

This phase changes only the shared shell. Existing pages, routes, APIs, services, data models, and permissions are unchanged. Page-level redesign begins in later phases.

## Accessibility

Navigation uses semantic nav landmarks and labels. Controls expose aria labels, visible focus states, keyboard-friendly details menu behavior, and reduced-motion handling.
