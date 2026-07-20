import { z } from "zod";
import type { PublicCardDTO } from "@/dto";
import { appearanceSettingsSchema } from "@/validation/appearance";

const profile = z.object({ fullName:z.string(), headline:z.string().nullable(), company:z.string().nullable(), bio:z.string().nullable(), email:z.string().nullable(), phone:z.string().nullable(), website:z.string().nullable(), address:z.string().nullable(), countryCode:z.string().nullable() }).nullable();
const card = z.object({ id:z.string().uuid(), themeId:z.string().uuid().nullable(), slug:z.string(), name:z.string(), status:z.enum(["DRAFT","PUBLISHED","UNPUBLISHED","ARCHIVED"]), visibility:z.enum(["PUBLIC","UNLISTED","PRIVATE"]), publishedAt:z.string().datetime().nullable(), profile, createdAt:z.string().datetime(), updatedAt:z.string().datetime(), appearance:appearanceSettingsSchema, buttons:z.array(z.object({id:z.string(),label:z.string(),url:z.string(),position:z.number()})), socialLinks:z.array(z.object({id:z.string(),platform:z.string(),label:z.string().nullable(),url:z.string(),position:z.number()})) });
const envelope=z.object({success:z.literal(true),data:card});
export async function fetchPublicCard(slug:string, signal?:AbortSignal):Promise<PublicCardDTO>{
 const response=await fetch(`/card/${encodeURIComponent(slug)}`,{headers:{accept:"application/json"},signal});
 if(!response.ok) throw new Error(response.status===404?"Card not found":"Unable to load card");
 const value=envelope.parse(await response.json()).data;
 return {...value,publishedAt:value.publishedAt?new Date(value.publishedAt):null,createdAt:new Date(value.createdAt),updatedAt:new Date(value.updatedAt)};
}
