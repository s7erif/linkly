# Sprint 5 UI Audit

Date: 2026-07-20
Result: **FAIL — Sprint 5 Appearance UI is not integrated into the active editor workflow**

## Executive Summary

The implementation exists and compiles, but it did not replace the editor users actually open. The running workspace route `/` still renders the prototype `Home` editor and its `FormPanel` sidebar. The new Appearance UI is mounted on a separate route, `/appearance/[slug]`, which has no link, redirect, tab, or programmatic navigation from the workspace, gallery, navbar, access flow, preview, or share UI.

Therefore the Sprint 5 report overstated integration. It correctly described the isolated Appearance route, but incorrectly implied that the active legacy editor UI had been replaced.

## 1. Is the new Appearance editor actually rendered?

**Yes, but only when `/appearance/[slug]` is opened directly.**

The route file `src/app/appearance/[slug]/page.tsx` imports and renders `AppearanceEditor`. For example, the migrated card would use `/appearance/john-doe`.

It is **not rendered by `/`**, which is the route labeled “Workspace” and used by existing edit links. No application navigation points to `/appearance/[slug]`.

## 2. Which component is mounted by the editor page?

There are currently two disconnected editor entrypoints:

### Running workspace editor

`/` → `src/app/page.tsx` (`Home`) → `FormPanel` + `PreviewPanel` + `SharePanel`

`Home` renders `FormPanel` in both responsive branches:

- Mobile: when `mobileTab === "edit"`.
- Desktop: permanently in the left `<aside>`.

### Isolated Appearance editor

`/appearance/[slug]` → `src/app/appearance/[slug]/page.tsx` (`AppearancePage`) → `AppearanceEditor` → `DefaultTheme`.

This route is implemented, but it is not the route the current Workspace or Gallery edit actions open.

## 3. Is the old sidebar still being used?

**Yes.**

`src/components/FormPanel.tsx` still renders:

- My Cards
- Identity
- Profile Photo
- Contact
- Social Links
- Save / Save as New controls

The legacy Template picker was removed, but removing that one block did not replace the remainder of the sidebar with the Appearance system. The root editor continues to use legacy form state, legacy `/api/cards` persistence, image upload, and the prototype preview path.

## 4. Are the new Appearance components orphaned?

### Import-level status

No Appearance module is completely unused by the compiler:

| File | Imported by | Status |
|---|---|---|
| `src/features/appearance/AppearanceEditor.tsx` | `src/app/appearance/[slug]/page.tsx` | Used on isolated route |
| `src/features/appearance/presets.ts` | `AppearanceEditor.tsx` | Used on isolated route |
| `src/features/appearance/appearance-editor.module.css` | `AppearanceEditor.tsx` | Used on isolated route |
| `src/components/themes/DefaultTheme.tsx` | `AppearanceEditor.tsx`, `PublicCardExperience.tsx` | Used by appearance and public routes |

### Workflow status

The Appearance editor is **functionally orphaned from the active editing workflow**:

- No `Link` points to `/appearance/[slug]`.
- No router navigation opens it.
- No redirect sends an authenticated editor to it.
- Gallery “Edit Card” links point to `/?id=[legacy-id]`.
- Gallery “Create” links point to `/?new=true`.
- Navbar “Workspace” points to `/`.
- The root editor does not import `AppearanceEditor`, `appearancePresets`, or `DefaultTheme`.

As a result, a normal user cannot discover the new UI through the running application.

## 5. Is a feature flag or conditional preventing the new UI?

**No.**

No feature flag, environment variable, configuration switch, experiment, permission branch, or session branch selects between `FormPanel` and `AppearanceEditor`.

The relevant conditionals only control existing behavior:

- `mobileTab === "edit"` shows `FormPanel` on mobile.
- Desktop always shows `FormPanel`.
- `session?.user` controls loading and displaying saved legacy cards, not editor selection.
- The Appearance route waits for its public-card fetch and requires an editor-session token only when saving; neither condition causes the root workspace to render it.

The problem is route composition, not conditional rendering.

## Complete Legacy Sidebar Reference Inventory

### Direct references

1. `src/app/page.tsx`
   - Imports `FormPanel`.
   - Mounts it in mobile and desktop layouts.
   - Owns the legacy identity/contact/social state and handlers.
   - Reads and writes through `/api/cards`.

2. `src/components/FormPanel.tsx`
   - Implements the legacy sidebar.
   - Still renders Identity, Profile Photo, Contact, Social Links, and legacy save controls.

### Navigation references that route users into the legacy sidebar

3. `src/app/gallery/page.js`
   - “Create” links use `/?new=true`.
   - “Edit Card” links use `/?id=${c.id}`.
   - Both resolve to `src/app/page.tsx` and therefore `FormPanel`.

4. `src/components/Navbar.js`
   - The brand link points to `/`.
   - The “Workspace” navigation item points to `/`.
   - Both open the legacy editor composition.

### Closely coupled legacy editor siblings

These files do not render the sidebar itself, but they are mounted beside it by `src/app/page.tsx` and remain part of the active prototype editor:

- `src/components/PreviewPanel.tsx`
- `src/components/SharePanel.tsx`
- `src/app/api/cards/route.js`
- `src/lib/templates.js`
- `src/components/card-renderer/CardRenderer.tsx`
- `src/components/card-renderer/ThemeRegistry.ts`

## Why the Running UI Does Not Match Sprint 5

1. Sprint 5 enhanced `AppearanceEditor`, which belongs to `/appearance/[slug]`.
2. The existing application’s primary editor is `/`, not `/appearance/[slug]`.
3. `/` continued to mount `FormPanel`; only its Template-picker block was removed.
4. No integration changed the root editor’s component tree.
5. No navigation was added to the Appearance route.
6. The root editor still consumes legacy BusinessCard records and `/api/cards`, whereas `AppearanceEditor` consumes the OI public DTO and saves through `UpdateCardAppearance`.
7. Because these data and route flows remain separate, the new controls are invisible during the normal Workspace flow.

## Architectural Consequence

The Appearance implementation itself respects the canonical `DefaultTheme` and save-use-case boundaries, but the product workflow does not reach it. Sprint 5 cannot be considered integrated until a future approved remediation explicitly chooses how the active editor routes to or composes the OI Appearance editor without reintroducing legacy persistence or a second layout.

## Audit Scope

This audit made no feature, routing, component, API, schema, or behavior changes. It only documents the current mounted UI and import/navigation graph.
