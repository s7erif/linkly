import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { hasWorkspacePermission, type WorkspacePermission, type WorkspaceScope } from "@/domain/workspace-access";
export class WorkspaceContextService {
 constructor(private readonly db: PrismaClient) {}
 async resolve(accountId:string,workspaceId:string):Promise<WorkspaceScope>{
  const membership=await this.db.workspaceMembership.findFirst({where:{accountId,workspaceId,status:"ACTIVE",deletedAt:null,workspace:{archivedAt:null}},select:{id:true,accountId:true,workspaceId:true,role:true}});
  if(!membership)throw new NotFoundError("Workspace",workspaceId);
  return {...membership,membershipId:membership.id};
 }
 async authorize(accountId:string,workspaceId:string,permission:WorkspacePermission):Promise<WorkspaceScope>{const scope=await this.resolve(accountId,workspaceId);if(!hasWorkspacePermission(scope.role,permission))throw new ForbiddenError(`Missing workspace permission: ${permission}`);return scope;}
}
