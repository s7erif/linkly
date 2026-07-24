import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { WorkspaceScope } from "@/domain/workspace-access";
import type { MediaAssetDTO, MediaQuery } from "@/dto/media.dto";

const select={id:true,fileName:true,originalFilename:true,extension:true,contentType:true,byteSize:true,storageKey:true,publicUrl:true,altText:true,caption:true,tags:true,folderId:true,status:true,width:true,height:true,createdAt:true,updatedAt:true,deletedAt:true} satisfies Prisma.MediaAssetSelect;
type Db=PrismaClient|Prisma.TransactionClient;
type Row=Prisma.MediaAssetGetPayload<{select:typeof select}>;
type MediaCreateInput=Omit<Prisma.MediaAssetUncheckedCreateInput,"workspaceId">;
const map=(row:Row):MediaAssetDTO=>({...row,byteSize:Number(row.byteSize),tags:row.tags});
const whereFor=(query:MediaQuery,workspaceId?:string):Prisma.MediaAssetWhereInput=>({workspaceId,deletedAt:query.includeDeleted?undefined:null,folderId:query.folderId===undefined?undefined:query.folderId,contentType:query.contentType,OR:query.search?[{fileName:{contains:query.search,mode:"insensitive"}},{originalFilename:{contains:query.search,mode:"insensitive"}},{altText:{contains:query.search,mode:"insensitive"}}]:undefined});

export interface MediaRepository {
  /** Explicit platform-admin path. Tenant callers must use listInWorkspace. */
  list(query:MediaQuery):Promise<{items:readonly MediaAssetDTO[];total:number;page:number;pageSize:number}>;
  listInWorkspace(scope:WorkspaceScope,query:MediaQuery):Promise<{items:readonly MediaAssetDTO[];total:number;page:number;pageSize:number}>;
  provisionWorkspace():Promise<string>;
  listFolders():Promise<readonly {id:string;name:string;parentId:string|null}[]>;
  listFoldersInWorkspace(scope:WorkspaceScope):Promise<readonly {id:string;name:string;parentId:string|null}[]>;
  ensureFolderInWorkspace(scope:WorkspaceScope,name:string):Promise<string>;
  createInWorkspace(scope:WorkspaceScope,input:MediaCreateInput):Promise<MediaAssetDTO>;
  softDelete(id:string):Promise<MediaAssetDTO>;
  softDeleteInWorkspace(scope:WorkspaceScope,id:string):Promise<MediaAssetDTO|null>;
  restore(id:string):Promise<MediaAssetDTO>;
  restoreInWorkspace(scope:WorkspaceScope,id:string):Promise<MediaAssetDTO|null>;
}

export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly db:Db){}
  async provisionWorkspace(){return (await this.db.workspace.create({data:{},select:{id:true}})).id;}
  async list(query:MediaQuery){return this.listWhere(query,whereFor(query));}
  async listInWorkspace(scope:WorkspaceScope,query:MediaQuery){return this.listWhere(query,whereFor(query,scope.workspaceId));}
  private async listWhere(query:MediaQuery,where:Prisma.MediaAssetWhereInput){const page=query.page??1,pageSize=query.pageSize??25;const [total,rows]=await Promise.all([this.db.mediaAsset.count({where}),this.db.mediaAsset.findMany({where,skip:(page-1)*pageSize,take:pageSize,orderBy:{createdAt:"desc"},select})]);return{items:rows.map(map),total,page,pageSize};}
  async ensureFolderInWorkspace(scope:WorkspaceScope,name:string){const existing=await this.db.mediaFolder.findFirst({where:{workspaceId:scope.workspaceId,name,parentId:null},select:{id:true}});if(existing)return existing.id;return(await this.db.mediaFolder.create({data:{workspaceId:scope.workspaceId,name},select:{id:true}})).id;}
  async listFolders(){return this.db.mediaFolder.findMany({orderBy:{name:"asc"},select:{id:true,name:true,parentId:true}});}
  async listFoldersInWorkspace(scope:WorkspaceScope){return this.db.mediaFolder.findMany({where:{workspaceId:scope.workspaceId},orderBy:{name:"asc"},select:{id:true,name:true,parentId:true}});}
  async createInWorkspace(scope:WorkspaceScope,input:MediaCreateInput){if(input.folderId&&!await this.db.mediaFolder.findFirst({where:{id:input.folderId,workspaceId:scope.workspaceId},select:{id:true}}))throw new Error("Media folder is outside the current workspace");if(input.customerId&&!await this.db.customer.findFirst({where:{id:input.customerId,workspaceId:scope.workspaceId},select:{id:true}}))throw new Error("Media customer is outside the current workspace");return map(await this.db.mediaAsset.create({data:{...input,workspaceId:scope.workspaceId},select}));}
  async softDelete(id:string){return map(await this.db.mediaAsset.update({where:{id},data:{deletedAt:new Date(),status:"DELETED"},select}));}
  async softDeleteInWorkspace(scope:WorkspaceScope,id:string){const result=await this.db.mediaAsset.updateMany({where:{id,workspaceId:scope.workspaceId},data:{deletedAt:new Date(),status:"DELETED"}});if(result.count!==1)return null;const row=await this.db.mediaAsset.findFirst({where:{id,workspaceId:scope.workspaceId},select});return row?map(row):null;}
  async restore(id:string){return map(await this.db.mediaAsset.update({where:{id},data:{deletedAt:null,status:"READY"},select}));}
  async restoreInWorkspace(scope:WorkspaceScope,id:string){const result=await this.db.mediaAsset.updateMany({where:{id,workspaceId:scope.workspaceId},data:{deletedAt:null,status:"READY"}});if(result.count!==1)return null;const row=await this.db.mediaAsset.findFirst({where:{id,workspaceId:scope.workspaceId},select});return row?map(row):null;}
}
