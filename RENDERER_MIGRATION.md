# RENDERER_MIGRATION.md

## Overview

We have introduced a new React-based component rendering architecture for Public Digital Business Cards (`src/components/card-renderer`). This architecture is designed to eventually replace the legacy HTML string builder (`src/lib/templates.js`).

To ensure total backward compatibility during the transition, **both renderers currently coexist**.

## Architecture Components

1. **`generateCardDocument()` (Legacy HTML Renderer)**
   - Located in `src/lib/templates.js`.
   - Continues to work untouched.
   - Generates massive raw HTML strings that are injected into `iframe`s using `srcDoc`.
   - Remains the default fallback for themes that haven't been ported yet.

2. **`CardRenderer` (New React Renderer)**
   - Located in `src/components/card-renderer/CardRenderer.tsx`.
   - Leverages `ThemeRegistry.ts` to map `card.templateId` to native React components.
   - Uses real React components (e.g., `BaseCard`, `MedicalTheme`), enabling interactivity, hooks, state, and type safety.
   - Renders directly to the DOM without an `iframe` (or can be placed inside one if required for style isolation, but native rendering is preferred).

## Completed Work

- Created `CardRenderer.tsx`.
- Created `ThemeRegistry.ts` for theme mapping.
- Implemented `BaseCard.tsx` as a default fallback structure.
- Implemented **Medical Theme** (`themes/MedicalTheme.tsx`).

## Coexistence Strategy

Because both renderers exist:
- **No API Changes:** The database schema (`templateId`), API routes, and Prisma queries are completely untouched.
- **Gradual Migration:** If a customer selects "medical" as their template, the application can route them to the new React component `MedicalTheme`. If they select "neumorphism" (not yet ported), the application can fall back to the legacy `iframe` + `generateCardDocument()` HTML string.
- The `CardVisitorView.jsx` (which currently uses the legacy iframe) can be updated in the future to perform a check:
  ```javascript
  import { ThemeRegistry } from "@/components/card-renderer/ThemeRegistry";
  
  // If the theme exists in the new React registry, render natively:
  if (ThemeRegistry[card.templateId]) {
    return <CardRenderer card={card} />;
  }
  // Otherwise, use the legacy HTML generator:
  return <iframe srcDoc={generateCardDocument(card)} />
  ```

## Next Steps

1. Update `CardVisitorView.jsx` and dashboard preview panes to perform the coexistence check shown above.
2. Port remaining themes (`corporate`, `business`, `developer`, `photographer`, etc.) into `src/components/card-renderer/themes/`.
3. Extract reusable UI micro-components (e.g., `SocialIcons`, `ContactPills`) to share across all new React themes.
4. Once all themes are fully ported and verified, deprecate and safely remove `src/lib/templates.js`.
