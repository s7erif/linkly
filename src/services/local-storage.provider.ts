import type { StorageProvider } from "@/types/providers";
export class LocalStorageProvider implements StorageProvider { async put(input:{key:string;body:Uint8Array;contentType:string}){return {key:input.key,url:`data:${input.contentType};base64,${Buffer.from(input.body).toString("base64")}`}} async delete(_key:string){return undefined} }
