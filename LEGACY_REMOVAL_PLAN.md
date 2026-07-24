# Legacy Removal Plan

## Removed in Sprint 6

- Root legacy BusinessCard editor composition.
- `FormPanel` sidebar.
- Legacy template selection state in the editor.
- Root `/api/cards` reads and writes.
- Root NextAuth editor coupling.
- Legacy upload/editor handlers.
- Legacy iframe/template preview integration from PreviewPanel.
- Orphaned Appearance editor route.
- Gallery edit links using legacy IDs.

## Remaining compatibility surface

The following legacy modules remain outside the canonical Workspace and should be removed only after their remaining callers are migrated:

- `src/app/api/cards/route.js` — still supports the prototype Gallery list/delete operations.
- `src/app/gallery/page.js` — still loads its inventory from the legacy API, although Edit now enters the OI slug workspace.
- `src/lib/services/business-card.service.ts` and `src/lib/services/social-link.service.ts` — prototype service compatibility.
- `src/repositories/legacy.repository.ts` and legacy repository ports — migration/compatibility access.
- `src/components/card-renderer/*`, `src/lib/templates.js`, and `src/app/card/[hash]/*` — old renderer artifacts no longer used by the canonical Workspace or `/c/[slug]`.
- Legacy Prisma compatibility models — retained until data and rollback verification are formally complete.

## Safe removal order

1. Add an OI card-list use case and transport for Gallery.
2. Move Gallery list/delete operations to OI DTOs and authorized application use cases.
3. Remove `/api/cards` and legacy business-card/social services.
4. Confirm no imports of legacy renderer/template modules.
5. Remove old `/card/[hash]` artifacts and renderer directory.
6. After retention and rollback approval, remove legacy repository ports/models in a separately approved database migration.

No remaining item is imported by the canonical `/` Workspace.
