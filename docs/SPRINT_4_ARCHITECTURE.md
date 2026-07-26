# Rendering Architecture

## Canonical rendering

`src/components/card-renderer/card-renderer.tsx` exports `CardRenderer`, the
only card rendering engine.
It owns the card theme provider, resolved tokens, typography, profile/avatar,
button and social-link renderers, content-block rendering, layout mapping, and
visibility rules.

The two product surfaces differ only at their data-adapter boundary:

- Workspace: reactive editor state is converted to renderer data by
  `PreviewSync`, then passed to `CardRenderer` inside the device frame.
- Public profile: the published/public `PublicCardDTO` is converted by
  `toCardRendererProps`, then passed directly to the same `CardRenderer`.

`Card.themeConfig` remains the persisted appearance document. Theme-gallery
selection is not persisted as a theme identifier; it is converted into that
appearance document before save. No new theme persistence is introduced.

## Data and security boundary

The public route remains `/@{username}` and reads only Published/Public cards.
The active `GET /card/[slug]` JSON resource is unchanged. Workspace reads and
writes retain their existing EditorSession or administrator authorization.
The renderer performs no fetching or persistence.

## Legacy disposition

The former `DefaultTheme -> BlockRenderer` implementation was removed after
the public and admin previews moved to `CardRenderer`.

The orphan `/card/[hash]` visitor UI was removed. It had no `page.tsx`, no
runtime importer, and depended on already-removed prototype renderer modules.
The active `/card/[slug]/route.ts` JSON route and `/card/layout.tsx` remain.
