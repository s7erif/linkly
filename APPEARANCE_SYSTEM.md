# OI Appearance System

## Purpose

Appearance changes presentation values without changing the card layout. `DefaultTheme` remains the sole canonical layout and receives only `PublicCardDTO` plus `AppearanceSettings`.

## Data flow

`GET /card/[slug]` → `PublicCardDTO` → editor draft state → `DefaultTheme` live preview. Each control or preset creates a new appearance value in React state, producing an immediate preview update. Save sends the complete validated value to `PUT /cards/[id]/appearance`, which calls `UpdateCardAppearance`; authorization and persistence remain inside the established application and UnitOfWork boundaries.

## Editor sections

- Colors: primary, accent, text, and muted text.
- Background: solid or gradient plus source colors.
- Typography: system, sans, or serif family.
- Buttons: solid, outline, or soft presentation.
- Card: border radius and shadow depth.
- Sections: profile, biography, contact, buttons, and social-link visibility.

## Boundaries

Presets contain no components, fetching, persistence, behavior, or layout decisions. The theme performs no fetching and contains no application business logic. The editor coordinates local draft state and transport only. Zod validates the full appearance contract at the transport and application boundaries.

The prototype Template selector is removed from the legacy form. Its stored `templateId` compatibility field remains untouched so no legacy data or API contract is destructively changed.
