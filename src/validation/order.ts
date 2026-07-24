import { z } from "zod";
import { uuidSchema } from "./common";
export const orderStatusSchema=z.enum(["DRAFT","SUBMITTED","PENDING","APPROVED","FULFILLED","COMPLETED","CANCELLED"]);
export const orderPackageSchema=z.enum(["DIGITAL","DIGITAL_NFC"]);
export const createOrderSchema=z.object({customerName:z.string().trim().min(2).max(120),company:z.string().trim().max(160).nullable().optional(),email:z.string().trim().email().max(254),phone:z.string().trim().min(5).max(40),package:orderPackageSchema,quantity:z.number().int().min(1).max(10).default(1),notes:z.string().trim().max(2000).nullable().optional(),planId:uuidSchema.optional(),billingInterval:z.enum(["MONTHLY","QUARTERLY","YEARLY"]).optional(),accountPasswordHash:z.instanceof(Uint8Array).optional(),accountPasswordSalt:z.instanceof(Uint8Array).optional()}).strict();
export const orderIdSchema=z.object({orderId:uuidSchema}).strict();
export const listOrdersSchema=z.object({status:orderStatusSchema.optional(),take:z.number().int().min(1).max(100).default(100)}).strict();
export type CreateOrderInput=z.input<typeof createOrderSchema>;export type OrderIdInput=z.input<typeof orderIdSchema>;export type ListOrdersInput=z.input<typeof listOrdersSchema>;
