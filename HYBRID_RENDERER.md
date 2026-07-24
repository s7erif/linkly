# HYBRID_RENDERER.md

## Overview
The platform has officially transitioned to a **Hybrid Rendering Strategy**. This allows the legacy string-based iframe renderer (`generateCardDocument()`) and the new React-based renderer (`CardRenderer`) to coexist seamlessly within the same public card view (`CardVisitorView.jsx`).

This approach guarantees zero downtime and 100% backward compatibility for themes that have not yet been ported to the new React architecture.

## Decision Flow
When a visitor accesses a public digital business card (`/card/[hash]`), the application follows this logic:

1. **Theme Lookup:** The `card.templateId` is retrieved from the database and normalized (e.g., converted to lowercase, defaulting to `"default"`).
2. **Registry Check:** The system checks if the normalized `templateId` exists within the new `ThemeRegistry` (excluding the fallback `"default"`).
3. **React Render (New):** If `hasReactTheme` evaluates to `true` (currently true for `"medical"`), the system natively mounts `<CardRenderer card={card} />` directly into the DOM tree.
4. **Iframe Fallback (Legacy):** If the theme is not found in the React registry (e.g., `"neumorphism"`, `"cyberpunk-glitch"`), the system renders the legacy `<iframe />`, injecting the massive HTML string returned by `generateCardDocument(card)` into the `srcDoc` attribute.

## Fallback Strategy
- **`hasReactTheme` Check**: By evaluating `themeId in ThemeRegistry && themeId !== "default"`, the system strictly limits the new React rendering flow to themes explicitly verified and imported into the `ThemeRegistry`.
- **Database/Prisma Stability:** The `templateId` column in the database continues to act as the ultimate source of truth. No data migrations or updates to existing user records are required.
- **Client-Side Grace:** Both renderers are mounted within the identical bounding wrapper (the "Mobile Device Frame" in the UI), guaranteeing the layout and presentation surrounding the card remains visually consistent regardless of the underlying rendering engine.

## Remaining Migration Work
- **Dashboard Preview Integration:** The dashboard form (`FormPanel`/`PreviewPanel`) still uses the `iframe` preview. This hybrid check should be abstracted into a reusable hook or utility component and implemented on the admin side to ensure live previews accurately reflect the native React rendering.
- **Porting Remaining Themes:** Sequentially rewrite `"corporate"`, `"business"`, `"developer"`, and other legacy templates using the new pure UI components in `src/components/card-renderer/themes/`. Add them to `ThemeRegistry.ts`.
- **Legacy Code Removal:** Once the `ThemeRegistry` achieves full parity with the themes listed in `templates.js`, the `hasReactTheme` check can be permanently resolved to `true`. At that stage, `CardVisitorView.jsx` will be simplified, the `<iframe />` fallback will be deleted, and `src/lib/templates.js` will be removed.
