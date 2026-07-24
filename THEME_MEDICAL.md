# THEME_MEDICAL.md

## Overview
The `MedicalTheme` has been successfully refactored to utilize the pure presentation React components from the new Design System. It maintains the exact same layout and visual aesthetic as the previous iteration, but the underlying code is completely assembled from reusable UI components.

## Component Hierarchy
The new Medical Theme is constructed with the following UI hierarchy:

```text
div (Background Wrapper)
└── CardContainer
    ├── CoverImage
    ├── div (Content Wrapper)
    │   ├── Avatar (Profile Photo / Initials)
    │   ├── div (Typography Section)
    │   │   ├── h1 (Name)
    │   │   ├── Badge (Job Title)
    │   │   ├── p (Company)
    │   │   └── CardSection (Bio Container)
    │   │       └── div (Bio Text)
    │   ├── CardSection (Contact Actions)
    │   │   └── ActionGrid (columns={1})
    │   │       ├── ContactButton (Phone)
    │   │       ├── ContactButton (Email)
    │   │       ├── ContactButton (Website)
    │   │       └── ContactButton (Location)
    │   └── CardSection (Social Links)
    │       └── div (Flex Row)
    │           ├── SocialButton (LinkedIn)
    │           ├── SocialButton (Twitter)
    │           └── ... (Dynamic)
    └── FooterBrand (Powered By footer)
```

## Props Received
The `MedicalTheme` component receives a single prop:
- `card`: An `any` type (to avoid strict type errors during the transition) representing the business card data. This data is expected to contain:
  - `name`: string
  - `title`: string
  - `company`: string
  - `bio`: string
  - `phone`: string
  - `email`: string
  - `website`: string
  - `address`: string
  - `avatar`: string (URL)
  - `coverImage`: string (URL)
  - `socialLinks`: string (JSON) or Array/Object containing social media URLs.

## Mapping from Legacy Medical Theme
- **Avatar Extraction:** Legacy HTML built the avatar natively. The new theme uses `<Avatar src={...} fallback={...} />`.
- **Text & Badges:** Instead of raw `<p>` and `<div>` tags with inline styles, we use the `<Badge>` component for the job title to provide a clean pill shape.
- **Buttons:** Legacy string templates mapped to custom styled anchor tags. Now we use `<ContactButton>` which guarantees consistent padding, hover effects, and layout inside an `<ActionGrid>`.
- **Social Links:** Rather than using the `renderSocialIcons` HTML builder from `templates.js`, the React component parses the `socialLinks` object natively and maps each entry to a `<SocialButton>`, ensuring accessibility and cleaner code.
- **Brand/Footer:** Handled consistently by `<FooterBrand />`.

## Remaining Migration Work
- Verify the `CardVisitorView.jsx` handles coexistence seamlessly once activated.
- In a future phase, update the `card` prop to use a strict TypeScript interface instead of `any`.
- Replace the fallback emoji/text icons in `<ContactButton>` and `<SocialButton>` with high-quality SVG/React icons (e.g., `react-icons`) across the platform once the icon strategy is fully finalized.
- Add remaining themes using the identical UI component approach.
