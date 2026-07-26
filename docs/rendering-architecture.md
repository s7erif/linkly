# Shared Card Rendering Architecture

## Before

```text
Workspace Preview                         Public Profile
PreviewSync                               /@username
  -> PreviewRenderer                        -> DefaultTheme
    -> Workspace ThemeProvider                -> orderedVisibleBlocks
      -> ProfileCard                            -> BlockRenderer
        -> ProfileAvatar
        -> LinksRenderer
```

These trees had independent theme resolution, typography, avatar, buttons,
spacing, block composition, visibility, and appearance mapping.

## After

```text
Workspace Preview                         Public Profile
PreviewSync                               /@username
  -> renderer data/layout adapter           -> toCardRendererProps
    -> CardRenderer <--------------------------+
      -> ThemeProvider
        -> resolved ThemeTokens
        -> ProfileCard
          -> ProfileAvatar
          -> ProfileHeader / ProfileBio
          -> LinksRenderer / SocialIcons
          -> shared content-section rendering
```

`CardRenderer` is the rendering boundary. It accepts serializable render data,
validated appearance settings, resolved layout/visibility options, and the
avatar URL. It owns no reads, writes, authorization, publication decisions, or
cache behavior.

## Persisted configuration

- `Card.themeConfig` supplies validated appearance settings and layout.
- `CardSection` or enabled `CardBlock` order supplies renderer section order.
- Button and social-link visibility is applied by the existing application
  mapper before public rendering and by the editor adapter in Workspace.
- `CardMedia` role `AVATAR` supplies the same avatar URL to both surfaces.
- The Prisma Card model has no persisted `themeId`. Workspace theme-gallery
  choices persist their resolved appearance settings, so no field was added.

## Legacy routes

The `/card/[hash]` visitor UI was orphaned: it had no page entry point, no
runtime references, and imported prototype renderer modules that no longer
exist. It was removed. `GET /card/[slug]` remains an active JSON route and was
not changed or removed.
