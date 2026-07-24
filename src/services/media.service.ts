import { randomUUID } from "node:crypto";
import type { WorkspaceScope } from "@/domain/workspace-access";
import type { MediaRepository } from "@/repositories/media.repository";
import type { MediaQuery } from "@/dto/media.dto";
import { mediaUploadSchema } from "@/validation/media";
import type { StorageProvider } from "@/types/providers";

interface MediaUploadInput {scope:WorkspaceScope;fileName:string;originalFilename?:string;contentType:string;byteSize:number;extension:string;body:Uint8Array;altText?:string;caption?:string;tags?:string[];folderId?:string|null;customerId?:string|null}
export class MediaService {
  constructor(private readonly repository:MediaRepository,private readonly storage:StorageProvider){}
  /** Explicit platform-admin compatibility path. */ async list(query:MediaQuery){return this.repository.list(query);}
  async listInWorkspace(scope:WorkspaceScope,query:MediaQuery){return this.repository.listInWorkspace(scope,query);}
  /** Explicit platform-admin compatibility path. */ async listFolders(){return this.repository.listFolders();}
  async listFoldersInWorkspace(scope:WorkspaceScope){return this.repository.listFoldersInWorkspace(scope);}
  async uploadForAcquisition(input:Omit<MediaUploadInput,"scope">){const workspaceId=await this.repository.provisionWorkspace();return this.upload({...input,scope:{workspaceId,accountId:"acquisition",membershipId:"acquisition",role:"OWNER"}});}
  async upload(input:MediaUploadInput){const parsed=mediaUploadSchema.parse(input);const storageKey="media/"+input.scope.workspaceId+"/"+randomUUID()+"."+parsed.extension;const folderId=input.folderId??await this.repository.ensureFolderInWorkspace(input.scope,"Payment Proofs");const stored=await this.storage.put({key:storageKey,body:input.body,contentType:parsed.contentType});try{return await this.repository.createInWorkspace(input.scope,{fileName:parsed.fileName,originalFilename:input.originalFilename??parsed.fileName,extension:parsed.extension,contentType:parsed.contentType,byteSize:BigInt(parsed.byteSize),storageKey:stored.key,publicUrl:stored.url??null,altText:input.altText??null,caption:input.caption??null,tags:input.tags??[],folderId,customerId:input.customerId??null,status:"READY",kind:"IMAGE"});}catch(error){await this.storage.delete(stored.key);throw error;}}
  /** Explicit platform-admin compatibility path. */ async softDelete(id:string){return this.repository.softDelete(id);}
  async softDeleteInWorkspace(scope:WorkspaceScope,id:string){return this.repository.softDeleteInWorkspace(scope,id);}
  /** Explicit platform-admin compatibility path. */ async restore(id:string){return this.repository.restore(id);}
  async restoreInWorkspace(scope:WorkspaceScope,id:string){return this.repository.restoreInWorkspace(scope,id);}
}
