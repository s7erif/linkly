export type WorkspaceRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";
export type WorkspacePermission = "WORKSPACE_READ" | "WORKSPACE_MANAGE" | "MEMBERSHIP_MANAGE" | "CUSTOMER_READ" | "CUSTOMER_WRITE" | "CARD_READ" | "CARD_WRITE" | "ORDER_READ" | "ORDER_WRITE" | "ANALYTICS_READ";
export type WorkspaceScope = Readonly<{ accountId: string; workspaceId: string; membershipId: string; role: WorkspaceRole }>;
const ALL: readonly WorkspacePermission[] = ["WORKSPACE_READ","WORKSPACE_MANAGE","MEMBERSHIP_MANAGE","CUSTOMER_READ","CUSTOMER_WRITE","CARD_READ","CARD_WRITE","ORDER_READ","ORDER_WRITE","ANALYTICS_READ"];
const ROLE_PERMISSIONS: Record<WorkspaceRole, ReadonlySet<WorkspacePermission>> = {
 OWNER:new Set(ALL), ADMIN:new Set(ALL),
 MANAGER:new Set(["WORKSPACE_READ","CUSTOMER_READ","CUSTOMER_WRITE","CARD_READ","CARD_WRITE","ORDER_READ","ORDER_WRITE","ANALYTICS_READ"]),
 MEMBER:new Set(["WORKSPACE_READ","CUSTOMER_READ","CARD_READ","CARD_WRITE","ORDER_READ","ANALYTICS_READ"]),
 VIEWER:new Set(["WORKSPACE_READ","CUSTOMER_READ","CARD_READ","ORDER_READ","ANALYTICS_READ"]),
};
export function hasWorkspacePermission(role: WorkspaceRole, permission: WorkspacePermission): boolean { return ROLE_PERMISSIONS[role].has(permission); }
