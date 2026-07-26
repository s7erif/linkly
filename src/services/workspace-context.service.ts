import "server-only";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { hasWorkspacePermission, type WorkspacePermission, type WorkspaceScope } from "@/domain/workspace-access";
export interface WorkspaceMembershipReader {
 findActiveScope(accountId:string,workspaceId:string):Promise<WorkspaceScope|null>;
}
export class WorkspaceContextService {
 constructor(private readonly memberships: WorkspaceMembershipReader) {}
 async resolve(accountId:string,workspaceId:string):Promise<WorkspaceScope>{
  const scope=await this.memberships.findActiveScope(accountId,workspaceId);
  if(!scope)throw new NotFoundError("Workspace",workspaceId);
  return scope;
 }
 async authorize(accountId:string,workspaceId:string,permission:WorkspacePermission):Promise<WorkspaceScope>{const scope=await this.resolve(accountId,workspaceId);if(!hasWorkspacePermission(scope.role,permission))throw new ForbiddenError(`Missing workspace permission: ${permission}`);return scope;}
}
