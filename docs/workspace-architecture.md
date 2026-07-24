# Workspace architecture

## Ownership boundary

A Workspace is the tenant boundary. Customer accounts receive access only through active WorkspaceMembership records. Platform administrators remain a separate platform context and do not receive implicit tenant membership.

Current capability-based editor sessions remain scoped to their verified card. They are not treated as general workspace membership.

## Request resolution

WorkspaceContextService resolves accountId + requested workspaceId to one non-deleted membership and returns an immutable WorkspaceScope containing accountId, workspaceId, membershipId, and role. Missing membership fails closed without disclosing whether another tenant owns the workspace.

Controllers and application services must call authorize before tenant operations. Request-provided workspace IDs are selectors only; repositories must stamp ownership from the resolved scope.

## Roles and permissions

Roles are OWNER, ADMIN, MANAGER, MEMBER, and VIEWER. Permission decisions use typed capability keys in domain/workspace-access.ts. Subscription entitlements and feature flags are future independent policy inputs.

## Repository strategy

Tenant repositories must require WorkspaceScope. Lists, counts, aggregates, exports, reads, updates, and deletes must include workspaceId. Mutations should use compound workspace filters or updateMany/deleteMany and verify one affected row. Public slug, activation-token, and session-token reads remain isolated capability ports. Platform repositories must be explicitly named and protected by platform authorization.

## Migration strategy

Workspace columns must be introduced additively, backfilled, checked for orphaned and cross-tenant relationships, protected with composite indexes and foreign keys, and only then made required. The incomplete migration baseline must be repaired before ownership migrations are generated or deployed.

## Activation

New activation creates the Workspace and its OWNER membership in the same transaction. Existing accounts resolve their workspace through active membership rather than Customer ownership.

## Future subscription integration

Subscription access is a separate entitlement input. Membership establishes actor scope; entitlements may later constrain features but never expand access beyond the resolved Workspace.

## Ownership migration

The additive 20260723120000 migration adds workspace ownership to Customer, Card, Order, Invoice, PaymentSubmission, Payment, Subscription, MediaAsset, MediaFolder, NotificationDelivery, BillingTimelineEntry, AnalyticsEvent, and AnalyticsAggregate. Setting and AuditLog may remain platform-scoped with a null workspace. Unassigned NFC inventory remains platform-scoped; activated NFC cards require a workspace.

Backfill follows authoritative relationships: Customer to its single legacy Workspace; Card to primary Workspace or Customer; Order to Customer or generated Card; invoice, payment proof, notification, and timeline to Order; analytics to Card; media to Customer/Card/folder usage. The migration aborts when ownership is missing or ambiguous instead of guessing. Legacy Workspace customer and primary-card pointers are nullable compatibility references; required workspaceId fields are canonical.

Public acquisition creates a provisional Workspace before an authenticated membership exists. Uploaded payment proof is stored in a provisional workspace and may be adopted only by its authoritative Order workspace while that provisional workspace has no memberships, customers, cards, or orders. Activation creates or reactivates the OWNER membership transactionally.

WorkspaceContextService rejects suspended/revoked/deleted memberships and archived workspaces. Tenant mutations use workspace-filtered updateMany guards; public slug and activation-token reads remain explicit capability paths.
