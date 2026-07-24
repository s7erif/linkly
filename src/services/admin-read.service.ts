import { NotFoundError, ValidationError } from "@/lib/errors";
import type { AdminReadRepository } from "@/repositories/admin-read.repository";
import type { AdminAccessCodeQuery, AdminCardDetail, AdminCardQuery, AdminCustomerQuery, AdminOrderQuery } from "@/types/admin-read";
import { adminAccessCodeQuerySchema, adminCardQuerySchema, adminCustomerQuerySchema, adminOrderQuerySchema, adminRecordIdSchema } from "@/validation/admin-read";
import { toRenderableCardDTO } from "@/use-cases/card-mappers";
import type { z } from "zod";

function parse<T>(schema:z.ZodType<T>,input:unknown):T{const result=schema.safeParse(input);if(!result.success)throw new ValidationError("Admin query validation failed",{fields:result.error.flatten().fieldErrors});return result.data;}
function nextUtcDay(value:string):Date{const date=new Date(`${value}T00:00:00.000Z`);date.setUTCDate(date.getUTCDate()+1);return date;}
export class AdminReadService {
 constructor(private readonly repository:AdminReadRepository,private readonly clock:()=>Date=()=>new Date()){}
 dashboard(){const now=this.clock(),start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));return this.repository.dashboard(start,now);}
 listOrders(input:unknown){const value=parse(adminOrderQuerySchema,input);const query:AdminOrderQuery={...value,from:value.from?new Date(`${value.from}T00:00:00.000Z`):undefined,to:value.to?nextUtcDay(value.to):undefined};return this.repository.listOrders(query);}
 async getOrder(id:string){const valid=parse(adminRecordIdSchema,id),result=await this.repository.getOrder(valid);if(!result)throw new NotFoundError("Order",valid);return result;}
 async getDigitalOrder(id:string){const valid=parse(adminRecordIdSchema,id),result=await this.repository.getOrder(valid,"DIGITAL");if(!result)throw new NotFoundError("Digital order",valid);return result;}
 listCustomers(input:unknown){const query=parse(adminCustomerQuerySchema,input) as AdminCustomerQuery;return this.repository.listCustomers(query);}
 async getCustomer(id:string){const valid=parse(adminRecordIdSchema,id),result=await this.repository.getCustomer(valid);if(!result)throw new NotFoundError("Customer",valid);return result;}
 listCards(input:unknown){const query=parse(adminCardQuerySchema,input) as AdminCardQuery;return this.repository.listCards(query);}
 listAccessCodes(input:unknown){const query=parse(adminAccessCodeQuerySchema,input) as AdminAccessCodeQuery;return this.repository.listAccessCodes(query);}
 async getCard(id:string):Promise<AdminCardDetail>{const valid=parse(adminRecordIdSchema,id),source=await this.repository.getCard(valid);if(!source)throw new NotFoundError("Card",valid);const preview=toRenderableCardDTO(source.editorCard);return {card:source.card,owner:source.owner,profile:source.profile,preview,appearance:{typography:preview.appearance.typography,buttonStyle:preview.appearance.buttonStyle,borderRadius:preview.appearance.borderRadius,shadow:preview.appearance.shadow,backgroundStyle:preview.appearance.background.style},order:source.order,accessCode:source.accessCode};}
}
