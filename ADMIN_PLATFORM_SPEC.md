# Admin Platform Specification

Status: Sprint 8 implementation baseline

## Product boundary

OI Platform contains three independently routed experiences:

- Admin Platform: authenticated platform operations under `/admin`.
- Customer Workspace: access-code/editor-session product under `/workspace`.
- Public Card Experience: visitor-only rendering under `/c/[slug]`.

Admin identity is provided by the existing NextAuth configuration. Customer identity is an opaque card-scoped editor session. Visitor access carries no editing authority. These credentials are not interchangeable.

## Pre-implementation audit

### Mixed flows found

1. `/` mounted `AppearanceEditor`, making the site root a customer editor rather than an explicit product route.
2. `/gallery` used legacy NextAuth and legacy `BusinessCard` data as an admin-like card manager.
3. Gallery's Edit Card action navigated directly from an admin-authenticated screen to the customer Workspace query flow.
4. Gallery's create actions also targeted the Workspace root using `?new=true`.
5. The global Navbar exposed Workspace and Gallery as peer tabs, combining customer editing and platform operation in one navigation model.
6. Login defaulted to `/`, sending admins into the customer editor surface.
7. The Workspace empty state linked to Gallery, making the customer product depend on an admin/legacy screen.
8. Gallery contained legacy template names and BusinessCard presentation while linking to OI public slugs.
9. No dedicated `/admin` layout, navigation, permission boundary, or information architecture existed.
10. No admin-authorized support-edit capability exists in the frozen application layer; customer updates require an EditorSession.

### Capability constraints found

- Customer and Card services support ID lookup, creation, update, and archive, but no list query.
- AccessCode repositories support hash/card lookup and lifecycle writes, but no platform-wide list or usage-list query.
- No approved aggregate/count query exists for dashboard metrics.
- `GenerateInitialAccessCode` exists and is the correct canonical first-issuance workflow.
- `AccessCodeService.issue` and `revoke` exist for later lifecycle operations.
- Admin support editing cannot use customer update paths without impersonation; a proper admin-authorized update use case is absent and frozen this sprint.

## Migration plan

1. Establish `/admin` as a server-guarded product shell with independent navigation and visual language.
2. Move the unchanged customer editor route wrapper from `/` to `/workspace`.
3. Replace root ambiguity with a neutral product entry page.
4. Retire Gallery as an active product surface; preserve `/gallery` only as a compatibility redirect to `/admin/cards`.
5. Remove Gallery dependencies from the Workspace empty state and global navigation.
6. Default admin login continuation to `/admin`.
7. Add requested admin routes and real ID-based detail reads through existing services.
8. Implement card issuance as an authenticated server action calling the existing `GenerateInitialAccessCode`; expose plaintext once in the client result.
9. Represent unavailable collection metrics and frozen-layer mutations honestly until approved read models/admin update use cases exist.
10. Verify no admin page imports Workspace components, editor-session helpers, renderer components, repositories, or Prisma.

## Admin navigation

Overview, Customers, Cards, Access Codes, Analytics, Settings.

## Non-goals

- No customer profile/appearance editing inside Admin.
- No customer EditorSession creation by Admin.
- No direct database access from pages.
- No legacy Gallery data reused in Admin.
- No fake analytics or counts.
- No new repository, DTO, use case, or endpoint.
