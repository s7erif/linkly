import { z } from "zod";
import { accessCodeSchema } from "@/validation/access-code";
import { createCardSchema } from "@/validation/card";
import { createCustomerSchema } from "@/validation/customer";
import { slugSchema } from "@/validation/common";

export const createCustomerRequestSchema = createCustomerSchema;
export const createCardRequestSchema = createCardSchema;
export const verifyAccessCodeRequestSchema = z.object({ code: accessCodeSchema });
export const createEditorSessionRequestSchema = z.object({ code: accessCodeSchema, lifetimeSeconds: z.number().int().min(300).max(86400).optional() });
export const publicCardParamsSchema = z.object({ slug: slugSchema });
export const cardRouteParamsSchema = z.object({ id: z.string().uuid() });
export const cardBlockRouteParamsSchema = cardRouteParamsSchema.extend({ blockId: z.string().uuid() });
