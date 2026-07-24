# Appearance Preset Specification

## Contract

A preset contains a stable identifier, display name, short description, and one complete `AppearanceSettings` value. Applying a preset copies all nested values into editor draft state. A preset is not a theme and cannot select or alter a React component.

## Built-in presets

| Preset | Intent | Background | Typography | Button | Radius | Shadow |
|---|---|---|---|---|---:|---|
| Default | Clean blue/slate baseline | Solid | Sans | Solid | 16px | Medium |
| Minimal | Quiet monochrome clarity | Solid | System | Outline | 6px | None |
| Dark | High-contrast night mode | Gradient | Sans | Soft | 18px | Large |
| Luxury | Ivory, black, and gold | Gradient | Serif | Outline | 4px | Large |
| Coffee | Warm roasted neutrals | Gradient | Serif | Soft | 20px | Medium |
| Ocean | Deep blue coastal calm | Gradient | Sans | Solid | 22px | Medium |
| Sunset | Warm coral evening | Gradient | Sans | Soft | 24px | Large |

All presets enable every supported section by default. Users may change any value after application. Preset identity is not persisted; only the resulting appearance values are stored, preventing future preset edits from silently changing existing cards.

## Governance

Sprint 5 presets are code-owned built-ins. There is no database model, admin management, marketplace, custom CSS, layout selection, or remote preset loading. Every built-in value must pass `appearanceSettingsSchema` tests.
