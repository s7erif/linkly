# Admin Route Map

| Route | Product | Auth | Responsibility | Status |
|---|---|---|---|---|
| `/` | Platform entry | Public | Product selection; legacy `?slug=` links move to Workspace | Implemented |
| `/admin` | Admin Platform | NextAuth admin | Summary metrics only | Implemented; metrics unavailable until approved aggregate reads |
| `/admin/customers` | Admin Platform | NextAuth admin | Customer inventory and operations | Shell implemented; collection read blocked by frozen ports |
| `/admin/customers/[customerId]` | Admin Platform | NextAuth admin | Informational customer profile/tabs | Implemented through existing CustomerService |
| `/admin/cards` | Admin Platform | NextAuth admin | Card inventory and operations | Shell implemented; collection read blocked by frozen ports |
| `/admin/cards/[cardId]` | Admin Platform | NextAuth admin | Card detail, public view, issuance, support status | Implemented through existing CardService |
| `/admin/access-codes` | Admin Platform | NextAuth admin | Access-code lifecycle inventory | Shell implemented; collection/usage reads blocked by frozen ports |
| `/admin/analytics` | Admin Platform | NextAuth admin | Analytics placeholder | Implemented with no fake analytics |
| `/admin/settings` | Admin Platform | NextAuth admin | Settings placeholder | Implemented |
| `/workspace` | Customer Workspace | EditorSession for writes | Profile/appearance editor | Existing Workspace moved intact |
| `/c/[slug]` | Public Experience | Public | Canonical visitor page | Unchanged |
| `/gallery` | Compatibility | Admin redirect | Retired legacy mixed-product entry | Redirects to `/admin/cards` |
| `/login` | Admin authentication | Public entry | NextAuth credentials sign-in | Existing page; default continuation is `/admin` |

## Navigation boundaries

- `/admin/*` renders only the Admin Platform sidebar/topbar.
- `/workspace` suppresses the global marketing navigation and renders only the customer editor.
- `/c/[slug]` remains the visitor route.
- Gallery is absent from active navigation.
- Admin detail pages never embed `AppearanceEditor`, `PreviewPanel`, `SharePanel`, or `DefaultTheme`.

## Compatibility behavior

Existing `/?slug=<slug>` links redirect to `/workspace?slug=<slug>`. This preserves old bookmarks while making `/workspace` canonical. `/gallery` redirects to the Admin Cards route; its legacy UI and mixed edit links are no longer mounted.
