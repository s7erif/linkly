# Design Token Consolidation — Sprint 3

## Status

The canonical design foundation is `src/design/`. Sprint 4 now mounts the V2 ThemeProvider. The Sprint 3 consolidation itself changed token ownership and compatibility routing only.

## Canonical ownership

| Category | Canonical definition |
|---|---|
| Colors | `src/design/tokens.css` palette; `src/design/themes.css` semantic roles |
| Typography, spacing, radius, shadows, blur | `src/design/tokens.css` |
| Motion durations and easing | `src/design/tokens.css` |
| Z-index and opacity | `src/design/tokens.css` |

`src/design/tokens.ts` is a typed reference to CSS variable names and contains no independent design values.

## Audited sources and duplicates

- `src/design`: canonical primitive scales, semantic themes, and compatibility mappings.
- `src/design-system/tokens.css`: now an import-only legacy entry point to `src/design/index.css`.
- `src/design-system/tokens.ts`: now re-exports the canonical token contract.
- `src/app/globals.css`: active Tailwind mappings and four legacy public-card theme sets moved without value changes to `src/design/legacy-compat.css`.
- `src/features/admin/admin-shell.module.css`: seven feature-scoped variables remain (`--bg`, `--surface`, `--surface2`, `--line`, `--text`, `--muted`, `--accent`) because migrating them could change Admin visuals.

Former duplicated categories were colors, typography, spacing, radius, shadows/elevation, and motion. Complete blur, z-index, and opacity scales now exist only in the canonical foundation.

## Compatibility layer

`src/design/legacy-compat.css` preserves active Tailwind aliases, Cyberpunk/Emerald/Sunset/Midnight values, and old Design System variable names. Exact legacy values are retained where a same-number canonical token differs. For example, `--oi-legacy-space-10` preserves 4rem for the old primitive while canonical `--oi-space-10` remains 2.5rem.

V2 theme selectors require `data-oi-theme`. Sprint 4 mounts ThemeProvider and applies the resolved Light or Dark mode before hydration.

## Remaining hardcoded values

Scope: authored CSS under `src`, excluding canonical/compatibility definitions in `src/design` and generated sources. Counts are declaration matches, not unique values. No values below were migrated.

### Hex colors — 410

| Location | Count |
|---|---:|
| `src/features/appearance/appearance-editor.module.css` | 130 |
| `src/features/admin/admin-shell.module.css` | 126 |
| `src/features/marketing/marketing.module.css` | 99 |
| `src/components/workspace-panels.module.css` | 40 |
| `src/features/appearance/admin-mode-banner.module.css` | 13 |
| `src/design-system/primitives/primitives.module.css` | 2 |

### Fixed spacing — 359

Literal px/rem/em values in margin, padding, or gap declarations.

| Location | Count |
|---|---:|
| `src/features/admin/admin-shell.module.css` | 159 |
| `src/features/appearance/appearance-editor.module.css` | 74 |
| `src/features/marketing/marketing.module.css` | 69 |
| `src/components/workspace-panels.module.css` | 25 |
| `src/components/themes/default-theme.module.css` | 13 |
| `src/design-system/primitives/primitives.module.css` | 11 |
| `src/features/appearance/admin-mode-banner.module.css` | 8 |

### Fixed radius — 127

| Location | Count |
|---|---:|
| `src/features/admin/admin-shell.module.css` | 44 |
| `src/features/appearance/appearance-editor.module.css` | 37 |
| `src/features/marketing/marketing.module.css` | 23 |
| `src/components/workspace-panels.module.css` | 11 |
| `src/components/themes/default-theme.module.css` | 5 |
| `src/features/appearance/admin-mode-banner.module.css` | 4 |
| `src/design-system/primitives/primitives.module.css` | 2 |
| `src/app/globals.css` | 1 |

### Fixed shadows — 38

| Location | Count |
|---|---:|
| `src/features/appearance/appearance-editor.module.css` | 13 |
| `src/features/marketing/marketing.module.css` | 12 |
| `src/features/admin/admin-shell.module.css` | 7 |
| `src/components/workspace-panels.module.css` | 4 |
| `src/components/themes/default-theme.module.css` | 1 |
| `src/features/appearance/admin-mode-banner.module.css` | 1 |

## Remaining risks

- Feature styles still hardcode many design values and are intentionally unchanged.
- Admin's seven local variables are a feature-scoped compatibility island, not a second V2 token system.
- Keep the compatibility layer until all legacy consumers are separately migrated and visually verified.
- ThemeProvider was activated in Sprint 4; the compatibility layer remains unchanged.
