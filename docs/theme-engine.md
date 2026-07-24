# Theme Engine Activation — Sprint 4

## Scope

The OI Platform V2 Theme Engine is mounted at the application root without changing page composition, components, business logic, or the legacy visual token contracts.

## Root integration

- `ThemeProvider` wraps the existing application providers inside `body`.
- `ThemeScript` runs synchronously in the document head before application hydration.
- `data-oi-theme` is the only attribute controlled by the Design System engine.
- Its rendered value is always the resolved mode: `light` or `dark`.
- The existing `data-theme` attribute remains a separate legacy product/card-theme contract and is not controlled by the Design System engine.

## Theme API

`useTheme()` exposes:

| Value | Contract |
|---|---|
| `currentTheme` | Persisted user selection: `light`, `dark`, or `system` |
| `resolvedTheme` | Active semantic-token mode: `light` or `dark` |
| `setTheme(theme)` | Persists and applies an explicit selection |
| `toggleTheme()` | Switches between the opposite resolved Light/Dark mode |

No theme-switching UI was introduced.

## Persistence and hydration

- Storage key: `oi-platform-theme`.
- The head script validates stored values before applying them.
- Invalid, missing, or inaccessible storage falls back to System.
- System resolves through `prefers-color-scheme`.
- The resolved root attribute is applied before hydration, preventing an incorrect-theme paint.
- The root suppresses only the expected attribute hydration difference.
- The provider uses the same deterministic fallback state for server rendering and the initial client render, then synchronizes the validated stored selection and pre-applied root attribute after hydration.
- Storage failures are non-fatal.
- Storage events synchronize selections across browser tabs.

## System behavior

While `currentTheme === "system"`, the provider subscribes to `prefers-color-scheme: dark` and updates `data-oi-theme` and `resolvedTheme` automatically. The listener is removed when System is no longer selected or the provider unmounts.

## Semantic-token validation

| Validation | Result |
|---|---|
| Light semantic tokens | 21 definitions, 21 unique, zero unresolved references |
| Dark semantic tokens | 21 definitions, 21 unique, zero unresolved references |
| Light/Dark semantic sets | Identical |
| System light resolution | Passed |
| System dark resolution | Passed |
| Invalid stored selection fallback | Passed |
| Root Design System attribute | Only `data-oi-theme` |
| ThemeProvider mount count | One |
| Theme-switch UI | None |

System uses the resolved Light or Dark selector instead of duplicating a third semantic-token block.

## Accessibility

- Existing `prefers-reduced-motion` token overrides remain active.
- System mode follows `prefers-color-scheme`.
- Forced-colors mode maps semantic roles to system colors such as `Canvas`, `CanvasText`, `GrayText`, `ButtonBorder`, and `LinkText`.
- Existing Light and Dark semantic contrast relationships were retained.

## Compatibility and regression assessment

- Legacy variables remain defined by `src/design/legacy-compat.css`.
- Existing pages continue consuming their previous global, feature, and compatibility variables.
- No page, feature component, or business logic was changed.
- The Theme Engine activates only `--oi-color-*` semantic roles, which currently have no page-level consumers outside the Design System foundation.
- The legacy `data-theme` behavior remains unchanged.


## Runtime verification

- Production HTML emitted the pre-hydration script before `body`.
- Headless Chromium resolved System to Dark in the current environment and retained the existing rendered page structure and classes.
- No hydration mismatch, uncaught exception, or theme initialization console error was emitted.
- Typecheck, production build, and architecture checks passed.
