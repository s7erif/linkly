# DESIGN_SYSTEM.md

## Overview

The React Card Renderer uses a modular, purely presentational Design System located in `src/components/card-renderer/ui/`. These components form the foundational building blocks for all future themes. 

They contain **no business logic**, **no API calls**, and **no state/hooks**. They rely entirely on props and Tailwind CSS for styling and layout.

## Folder Structure

```text
src/
└── components/
    └── card-renderer/
        ├── ui/
        │   ├── ActionGrid.tsx
        │   ├── Avatar.tsx
        │   ├── Badge.tsx
        │   ├── CardContainer.tsx
        │   ├── CardSection.tsx
        │   ├── ContactButton.tsx
        │   ├── CoverImage.tsx
        │   ├── FooterBrand.tsx
        │   └── SocialButton.tsx
        ├── themes/
        │   └── MedicalTheme.tsx
        ├── BaseCard.tsx
        ├── CardRenderer.tsx
        └── ThemeRegistry.ts
```

## Components

### 1. Avatar
**Responsibility:** Renders the user's profile image or a fallback initial if no image is provided.
**Props:**
- `src` (string | null): URL to the image.
- `fallback` (string): Text used for initials (e.g., the user's name).
- `className` (string): Tailwind overrides (e.g., width, height, border).
- `alt` (string): Accessibility text.

**Example Usage:**
```tsx
<Avatar src={card.avatar} fallback={card.name || "User"} className="w-24 h-24 border-4 border-white" />
```

### 2. CoverImage
**Responsibility:** Displays a decorative banner at the top of the card.
**Props:**
- `src` (string | null): URL to the image.
- `fallbackClass` (string): Tailwind class applied when no image exists (default: `"bg-slate-200"`).
- `className` (string): Tailwind overrides.

**Example Usage:**
```tsx
<CoverImage src={card.coverImage} fallbackClass="bg-gradient-to-r from-blue-500 to-indigo-600" />
```

### 3. Badge
**Responsibility:** A small pill-shaped indicator for labels like job titles or status.
**Props:**
- `children` (ReactNode): The text content.
- `icon` (ReactNode): Optional icon node to render beside the text.
- `className` (string): Tailwind overrides.

**Example Usage:**
```tsx
<Badge className="bg-indigo-100 text-indigo-700">Developer</Badge>
```

### 4. ContactButton
**Responsibility:** A wide button used for primary actions like calling a phone number, sending an email, or visiting a website.
**Props:**
- `href` (string): The link URL (e.g., `tel:123`, `mailto:a@b.com`).
- `icon` (ReactNode): SVG or emoji icon.
- `label` (string): Top title (e.g., "Phone").
- `value` (string): Optional secondary text (e.g., "+1 234 567 8900").
- `className` (string): Tailwind overrides.

**Example Usage:**
```tsx
<ContactButton href={`tel:${card.phone}`} icon={<span>📞</span>} label="Phone" value={card.phone} className="bg-slate-50 hover:bg-slate-100" />
```

### 5. SocialButton
**Responsibility:** A compact, circular button meant for social media links.
**Props:**
- `href` (string): Profile URL.
- `icon` (ReactNode): Platform logo (SVG).
- `label` (string): Accessible label (e.g., "LinkedIn").
- `className` (string): Tailwind overrides.

**Example Usage:**
```tsx
<SocialButton href={link.url} icon={<FaLinkedin />} label="LinkedIn" className="bg-blue-600 text-white" />
```

### 6. ActionGrid
**Responsibility:** A responsive grid layout wrapper specifically for aligning ContactButtons or SocialButtons.
**Props:**
- `children` (ReactNode): The buttons to render.
- `columns` (1 | 2 | 3 | 4): Preferred number of columns on desktop. Defaults to `2`.
- `className` (string): Tailwind overrides.

**Example Usage:**
```tsx
<ActionGrid columns={2}>
  <ContactButton ... />
  <ContactButton ... />
</ActionGrid>
```

### 7. CardSection
**Responsibility:** A semantically structured `<section>` wrapper for grouping content like "About Me" or "Socials", complete with an optional title.
**Props:**
- `title` (string): Optional section header.
- `children` (ReactNode): The section content.
- `className` (string): Tailwind overrides.

**Example Usage:**
```tsx
<CardSection title="About Me" className="mt-8">
  <p>{card.bio}</p>
</CardSection>
```

### 8. CardContainer
**Responsibility:** The outermost responsive container that frames the digital business card. Limits maximum width and centers the content.
**Props:**
- `children` (ReactNode): The entire card UI.
- `className` (string): Tailwind overrides (backgrounds, shadows, borders).

**Example Usage:**
```tsx
<CardContainer className="bg-white shadow-xl rounded-3xl">
  ...
</CardContainer>
```

### 9. FooterBrand
**Responsibility:** A reusable footer indicating the platform powering the card.
**Props:**
- `companyName` (string): Defaults to "OI Cards".
- `logoSrc` (string): Optional image URL for the logo.
- `poweredByText` (string): Defaults to "Powered by".
- `className` (string): Tailwind overrides.

**Example Usage:**
```tsx
<FooterBrand className="mt-10" />
```
