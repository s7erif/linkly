# PUBLIC_CARD_ARCHITECTURE.md

## 1. Current Problems

The existing public card architecture relies on rendering the card entirely within an `iframe` by injecting a raw HTML string generated via `generateCardDocument()` in `src/lib/templates.js`. 
This approach creates several significant problems:

- **Monolithic String Generation:** A massive 54KB+ JavaScript file (`templates.js`) constructs HTML strings manually. This violates the React philosophy and the project spec requirement: "Themes should use reusable React components. No custom HTML editing."
- **Lack of Type Safety:** HTML strings offer zero TypeScript safety, making UI bugs easy to introduce and hard to catch during compilation.
- **No React State or Hooks:** Because the card UI is just a raw HTML string, you cannot easily attach React state, hooks, or complex interactive components (like tabs, modals, or animated transitions).
- **Maintenance Nightmare:** Any global change (e.g., adding a new social icon or modifying contact actions) requires updating massive string templates across all themes.
- **Security & Performance:** Injecting user-supplied data directly into HTML templates increases the risk of XSS (if not perfectly escaped). Also, the `iframe` creates unnecessary overhead and limits responsive CSS capabilities from propagating natively.

## 2. New Component Tree

We will build the card using native React Server and Client Components. The overarching structure will resemble this:

```text
src/
└── components/
    └── public-card/
        ├── PublicCardLayout.tsx      # Main layout wrapper
        ├── ThemeProvider.tsx         # Handles CSS variables and theme injection
        ├── CardHeader.tsx            # Covers images, avatars, basic identity info
        ├── ProfileSection.tsx        # Bio, company, job title
        ├── ContactActions.tsx        # Call, Email, Location buttons
        ├── SocialLinks.tsx           # Grid/List of social media icons
        ├── QRSection.tsx             # QR Code modal and trigger
        ├── SaveContactButton.tsx     # vCard generation action
        ├── ShareButton.tsx           # Web Share API / Copy Link integration
        └── Footer.tsx                # Branding (Powered by OI Cards)
```

## 3. Component Responsibilities

- **`PublicCardLayout`**: The orchestrator. Fetches data (or accepts it via props from the `page.tsx` server component), sets up the responsive container (e.g., max-width mobile views centered on desktop), and composes the sections below.
- **`ThemeProvider`**: Determines which CSS classes, layouts, or CSS variables to apply based on the `templateId`. It will wrap the card and inject the chosen theme's design tokens.
- **`CardHeader`**: Renders the background cover image, profile avatar, user's name, and job title. Adjusts its internal layout based on the active theme.
- **`ProfileSection`**: Renders the bio and company information. Handles text truncation if necessary.
- **`ContactActions`**: Displays actionable buttons (Phone, Email, WhatsApp, Website, Address). Uses reusable hooks to format links (e.g., `mailto:`, `tel:`, maps URLs).
- **`SocialLinks`**: Maps over the user's `SocialLink` records and renders the appropriate SVG icons dynamically.
- **`QRSection` / `ShareButton` / `SaveContactButton`**: Independent interactive Client Components that handle modal popups, native device sharing, and `.vcf` file generation.
- **`Footer`**: Displays standard company branding or white-label footers.

## 4. Business Logic & Reusable Hooks

Business logic will be moved out of the UI components and into reusable custom hooks, ensuring separation of concerns:

- `useVCard(cardData)`: Hook to handle the generation and downloading of `.vcf` contact files.
- `useAnalytics(cardId)`: Hook that automatically fires a view event when the card mounts, and provides a method `trackClick(platform)` for tracking individual interactions.
- `useShare(url, title)`: Hook to abstract the `navigator.share()` API with a fallback to `navigator.clipboard.writeText()` for unsupported browsers.

## 5. Theme Integration Strategy

Instead of generating entirely different HTML strings per theme, the React architecture will use a single unified component tree with **Data-Driven Styling**.

1. **CSS Variables & Tailwind Variants**: The `ThemeProvider` will inject a CSS class at the root (e.g., `theme-neumorphism` or `theme-cyberpunk`). Tailwind CSS variants or standard CSS variables will respond to this root class to alter colors, border radii, shadows, and fonts globally.
2. **Conditional Component Layouts**: If a theme fundamentally changes the structural layout (e.g., Avatar floating in the center vs. Avatar aligned to the left), the individual components (`CardHeader`, `ContactActions`) will use the `templateId` prop to render slightly different internal layouts, or we will map `templateId` to specific Layout variations (e.g., `HeaderVariantA`, `HeaderVariantB`).
3. **Registry Pattern**: If themes differ drastically, we can create a `ThemeRegistry` that maps a `templateId` to a specific high-level Theme component wrapper, passing the normalized sub-components as children.
