# Workspace Before / After

| Area | Before Sprint 7 | After Sprint 7 |
|---|---|---|
| Product feel | Long CRUD-style HTML form | Focused creative workspace with property cards and canvas |
| Desktop proportions | Roughly 30 / 45 / 25 | Approximately 26 / 56 / 18 |
| Navigation | Every group expanded in one scroll | Profile, Appearance, Links, Buttons, Advanced accordion; one open |
| Profile | Flat field sequence | Basic, Contact, and About groups with initials identity treatment |
| Appearance presets | Small name/swatch buttons | Selector plus seven large value-derived visual cards |
| Appearance controls | Sequential fieldsets | Colors, Background, Typography, Buttons, Card, Sections token groups |
| Preview | Plain gray region and fixed view | Larger dotted canvas with responsive frame and transitions |
| Preview toolbar | None | Functional Mobile, Desktop, 100%, Fit, and Public View controls |
| Share | URL, copy, QR only | Compact publishing panel with URL, copy state, QR, download, and open |
| Saving | Traditional bottom button | Sticky Saved / Saving / Save Changes / failure status bar |
| Empty state | Heading and one sentence | Illustrated selection card with Gallery and Create New Card paths |
| Renderer | `DefaultTheme` | Unchanged `DefaultTheme` |
| Data flow | Public DTO draft + existing saves | Unchanged |

## Deliberately unchanged

No domain, database, DTO, repository, application use-case, API, authorization, route, or `DefaultTheme` code changed. Controls that cannot persist through the frozen architecture were not simulated.
