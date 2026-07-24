import { z } from "zod";
import { uuidSchema } from "./common";
import { orderStatusSchema } from "./order";
const page=z.coerce.number().int().min(1).default(1),pageSize=z.coerce.number().int().min(10).max(100).default(20),direction=z.enum(["asc","desc"]).default("desc");
const search=z.string().trim().max(160).optional().transform(value=>value||undefined);
const date=z.string().date().optional();
export const adminOrderQuerySchema=z.object({search,status:orderStatusSchema.optional(),paymentStatus:z.enum(["PENDING","PAID","REFUNDED","FAILED"]).optional(),package:z.literal("DIGITAL").optional(),from:date,to:date,page,pageSize,sortBy:z.enum(["createdAt","orderNumber","customerName","status"]).default("createdAt"),sortDirection:direction}).strict();
export const adminCustomerQuerySchema=z.object({search,status:z.enum(["ACTIVE","SUSPENDED"]).optional(),page,pageSize,sortBy:z.enum(["createdAt","displayName","status"]).default("createdAt"),sortDirection:direction}).strict();
export const adminCardQuerySchema=z.object({search,page,pageSize,sortBy:z.enum(["createdAt","name","status"]).default("createdAt"),sortDirection:direction}).strict();
export const adminRecordIdSchema=z.string().pipe(uuidSchema);
export type AdminOrderQueryInput=z.input<typeof adminOrderQuerySchema>;export type AdminCustomerQueryInput=z.input<typeof adminCustomerQuerySchema>;export type AdminCardQueryInput=z.input<typeof adminCardQuerySchema>;

export const adminAccessCodeQuerySchema=z.object({search,status:z.enum(["ACTIVE","ROTATED","REVOKED","EXPIRED"]).optional(),page,pageSize}).strict();
